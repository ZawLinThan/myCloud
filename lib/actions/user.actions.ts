'use server';

import bcrypt from 'bcryptjs';
import { connectDB } from '../mongoDB/db';
import User from '@/models/user.model';
import { generateTokenAndSetCookie } from '../utils/generateToken';
import { cookies } from 'next/headers';
import { serializeAuthUser } from '../utils/authUser';
import otpService from '../utils/otp';
import hashingService from '../utils/hashing';

export const signUp = async ({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser?.isVerified) {
      return {
        success: false,
        message:
          'User with this email already exists! Sign In to your account.',
      };
    }

    // remove pending account that didn't pass OTP verification
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const accountId = crypto.randomUUID();

    const newUser = await User.create({
      fullName,
      email,
      accountId,
      password: hashedPassword,
      isVerified: false,
    });

    if (!newUser) {
      return {
        success: false,
        message: 'Failed to create user',
      };
    }

    const otpConnection = await otpService.issueOtp(newUser, {
      expirePendingUser: true,
    });

    if (otpConnection.success) {
      return {
        success: true,
        requiresOtp: true,
        message:
          'Verification code sent. Check your email to finish signing up.',
        user: serializeAuthUser(newUser),
      };
    } else {
      return {
        success: false,
        message: otpConnection.message,
      };
    }
  } catch (error: unknown) {
    console.error('Sign up error:', error);

    return {
      success: false,
      message: 'Failed to create user',
    };
  }
};

export const verifyOtp = async ({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: 'sign-up' | 'recovery';
}) => {
  try {
    await connectDB();

    const user = await User.findOne({ email });
    const isSignUp = type === 'sign-up';
    const signUpOrRecoveryText = isSignUp
      ? 'sign up again'
      : 'request a new code';

    if (isSignUp) {
      if (!user) {
        return {
          success: false,
          message: 'No pending account found for this email.',
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message:
            'User with this email already exists! Sign In to your account.',
        };
      }
    } else {
      if (!user?.isVerified) {
        return {
          success: false,
          message: 'No verified account found for this email.',
        };
      }
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return {
        success: false,
        message: `No verification code found. Please ${signUpOrRecoveryText}`,
      };
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return {
        success: false,
        message: `Verification code expired. Please ${signUpOrRecoveryText}`,
      };
    }

    const isOtpValid = await otpService.verifyOtpHash(otp, user.otpHash);

    if (!isOtpValid) {
      return {
        success: false,
        message: 'Invalid verification code.',
      };
    }

    user.isVerified = true; // not needed for recovery
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.deleteAt = null; // not needed for recovery
    await user.save();

    await generateTokenAndSetCookie({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: 'Account verified successfully.',
      user: serializeAuthUser(user),
    };
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);

    return {
      success: false,
      message: 'Failed to verify code.',
    };
  }
};

export const resendOtp = async ({
  email,
  type,
}: {
  email: string;
  type: 'sign-up' | 'recovery';
}) => {
  try {
    await connectDB();

    const user = await User.findOne({ email });
    const isSignUp = type === 'sign-up';

    if (!user) {
      return {
        success: false,
        message: isSignUp
          ? 'No pending account found for this email.'
          : 'No account associated with this email.',
      };
    }

    if (isSignUp) {
      if (user.isVerified) {
        return {
          success: false,
          message: 'This account is already verified. Sign in instead.',
        };
      }
    } else {
      if (!user.isVerified) {
        return {
          success: false,
          message:
            'Please verify your account before recovering your password.',
        };
      }
    }

    const otpConnection = await otpService.issueOtp(user, {
      expirePendingUser: isSignUp,
    });

    if (!otpConnection.success) {
      return {
        success: false,
        message: otpConnection.message,
      };
    }

    if (isSignUp) {
      return {
        success: true,
        message: 'A new verification code was sent.',
      };
    } else {
      return {
        success: true,
        requiresOtp: true,
        message: 'Verification code sent. Check your email to continue.',
        user: serializeAuthUser(user),
      };
    }
  } catch (error: unknown) {
    const isSignUp = type === 'sign-up';

    if (isSignUp) {
      console.error('Resend OTP error:', error);
    } else {
      console.error('Password recovery error:', error);
    }

    return {
      success: false,
      message: isSignUp
        ? 'Failed to resend verification code.'
        : 'Failed to start password recovery.',
    };
  }
};

export const resetPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user)
      return {
        success: false,
        message:
          'No user associated with this email. Sign Up to start using MyCloud!',
      };

    const hashedPassword = await hashingService.hash(password);
    user.password = hashedPassword;
    await user.save();

    await generateTokenAndSetCookie({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: 'Password reset successfullly.',
      user: serializeAuthUser(user),
    };
  } catch (error: unknown) {
    console.error('Password reset error', error);

    return {
      success: false,
      message: 'Failed to reset password.',
    };
  }
};
export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user)
      return {
        success: false,
        message:
          'No user associated with this email. Sign Up to start using MyCloud!',
      };

    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid)
      return {
        success: false,
        message: 'Invalid credential.',
      };

    if (!user.isVerified) {
      return {
        success: false,
        message: 'Please verify your email before signing in.',
      };
    }

    if (user.deleteAt) {
      user.deleteAt = null;
      await user.save();
    }

    await generateTokenAndSetCookie({
      userId: user._id.toString(),
      email: email,
    });

    return {
      success: true,
      message: 'Signed in successfully',
      user: serializeAuthUser(user),
    };
  } catch {
    return {
      success: false,
      message: 'Failed to log in.',
    };
  }
};

export const logout = async () => {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('session-token');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch {
    return {
      success: true,
      message: 'Error during log out.',
    };
  }
};
