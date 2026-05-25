'use server';

import bcrypt from 'bcryptjs';
import { connectDB } from '../mongoDB/db';
import User from '@/models/user.model';
import { generateTokenAndSetCookie } from '../utils/generateToken';
import { cookies } from 'next/headers';
import {
  generateOtp,
  getOtpExpiry,
  hashOtp,
  sendOtpEmail,
  verifyOtpHash,
} from '../utils/otp';

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const accountId = crypto.randomUUID();

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    const newUser = existingUser
      ? await User.findByIdAndUpdate(
          existingUser._id,
          {
            fullName,
            password: hashedPassword,
            otpHash,
            otpExpiresAt: getOtpExpiry(),
          },
          { new: true }
        )
      : await User.create({
          fullName,
          email,
          accountId,
          password: hashedPassword,
          isVerified: false,
          otpHash,
          otpExpiresAt: getOtpExpiry(),
        });

    if (!newUser) {
      return {
        success: false,
        message: 'Failed to create user',
      };
    }

    const otpConnection = await sendOtpEmail({ email: newUser.email, otp });

    if (otpConnection.success) {
      return {
        success: true,
        requiresOtp: true,
        message:
          'Verification code sent. Check your email to finish signing up.',
        user: {
          _id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          accountId: newUser.accountId,
          avatar: newUser.avatar ?? null,
          files: [],
        },
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

export const verifySignUpOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        message: 'No pending account found for this email.',
      };
    }

    if (user.isVerified) {
      return {
        success: false,
        message: 'This account is already verified. Sign in instead.',
      };
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return {
        success: false,
        message: 'No verification code found. Please sign up again.',
      };
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return {
        success: false,
        message: 'Verification code expired. Please sign up again.',
      };
    }

    const isOtpValid = await verifyOtpHash(otp, user.otpHash);

    if (!isOtpValid) {
      return {
        success: false,
        message: 'Invalid verification code.',
      };
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    await generateTokenAndSetCookie({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: 'Account verified successfully.',
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        accountId: user.accountId,
        avatar: user.avatar ?? null,
        files: [],
      },
    };
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);

    return {
      success: false,
      message: 'Failed to verify code.',
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

    await generateTokenAndSetCookie({
      userId: user._id.toString(),
      email: email,
    });

    return {
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        accountId: user.accountId,
        avatar: user.avatar ?? null,
        files: [],
      },
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
