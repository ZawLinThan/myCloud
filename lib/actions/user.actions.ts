'use server';

import { cookies } from 'next/headers';

import User from '@/models/user.model';
import { firebaseAdminAuth } from '@/lib/firebase/admin';
import { connectDB } from '@/lib/mongoDB/db';
import {
  FIREBASE_SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
} from '@/lib/utils/session';
import { serializeAuthUser } from '@/lib/utils/authUser';

const SESSION_MAX_AGE = 60 * 60;

const getVerifiedFirebaseUser = async (idToken: string) => {
  if (!idToken) {
    throw new Error('Firebase ID token is required.');
  }

  return firebaseAdminAuth.verifyIdToken(idToken);
};

export const setFirebaseSessionCookie = async (idToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set(FIREBASE_SESSION_COOKIE_NAME, idToken, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

const clearSessionCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(FIREBASE_SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME);
};

export const createOrUpdateFirebaseUser = async ({
  idToken,
  fullName,
}: {
  idToken: string;
  fullName?: string | null;
}) => {
  try {
    const decodedToken = await getVerifiedFirebaseUser(idToken);
    const email = decodedToken.email;
    console.log(decodedToken.email);
    if (!email) {
      return {
        success: false,
        message: 'Firebase account does not include an email address.',
      };
    }

    const signInProvider =
      typeof decodedToken.firebase?.sign_in_provider === 'string'
        ? decodedToken.firebase.sign_in_provider
        : '';

    if (signInProvider === 'password' && !decodedToken.email_verified) {
      return {
        success: false,
        message: 'Please verify your email before signing in.',
      };
    }

    await connectDB();

    const displayName =
      fullName?.trim() ||
      decodedToken.name ||
      email.split('@')[0] ||
      'MyCloud user';

    const user = await User.findOneAndUpdate(
      {
        $or: [{ accountId: decodedToken.uid }, { email }],
      },
      {
        $set: {
          avatar: decodedToken.picture ?? null,
          email,
          fullName: displayName,
          isVerified: true,
          deleteAt: null,
        },
        $setOnInsert: {
          accountId: decodedToken.uid,
          files: [],
        },
        $unset: {
          otpHash: '',
          otpExpiresAt: '',
        },
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    {
      /*await setFirebaseSessionCookie(idToken);*/
    }

    return {
      success: true,
      message: 'Signed in successfully',
      user: serializeAuthUser(user),
    };
  } catch (error) {
    console.error('Firebase auth error:', error);

    return {
      success: false,
      message: 'Unable to verify your Firebase session.',
    };
  }
};

export const signIn = async ({ idToken }: { idToken: string }) => {
  // try {
  //   const decodedToken = await getVerifiedFirebaseUser(idToken);
  //   const email = decodedToken.email;

  //   if (!email) {
  //     return {
  //       success: false,
  //       message: 'Firebase account does not include an email address.',
  //     };
  //   }

  //   const displayName =
  //     decodedToken.name ||
  //     email.split('@')[0] ||
  //     'MyCloud user';

  //   await setFirebaseSessionCookie(idToken);

  //   return {
  //     success: true,
  //     message: 'Signed in successfully',
  //     //user: serializeAuthUser(decodedToken),
  //     user: {
  //       uid : decodedToken.uid,
  //       email: decodedToken.email,
  //       name: displayName,
  //       phone: decodedToken.phone_number,
  //     }
  //   };
  // } catch (error) {}
  return createOrUpdateFirebaseUser({ idToken });
};

export const signUp = async ({
  idToken,
  fullName,
}: {
  idToken: string;
  fullName: string;
}) => {
  return createOrUpdateFirebaseUser({ idToken, fullName });
};

export const refreshFirebaseSession = async ({
  idToken,
}: {
  idToken: string;
}) => {
  try {
    await getVerifiedFirebaseUser(idToken);
    await setFirebaseSessionCookie(idToken);

    return {
      success: true,
      message: 'Session refreshed.',
    };
  } catch {
    await clearSessionCookies();

    return {
      success: false,
      message: 'Session expired. Please sign in again.',
    };
  }
};

export const logout = async () => {
  try {
    await clearSessionCookies();

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch {
    return {
      success: false,
      message: 'Error during log out.',
    };
  }
};

export const verifyOtp: (_input?: unknown) => Promise<{
  success: false;
  message: string;
}> = async () => {
  return {
    success: false,
    message:
      'OTP verification has been replaced by Firebase Authentication. Please sign in again.',
  };
};

export const resendOtp: (_input?: unknown) => Promise<{
  success: false;
  message: string;
}> = async () => {
  return {
    success: false,
    message:
      'OTP codes have been replaced by Firebase Authentication. Use the password reset email instead.',
  };
};

export const resetPassword: (_input?: unknown) => Promise<{
  success: false;
  message: string;
}> = async () => {
  return {
    success: false,
    message:
      'Password reset is now handled by Firebase. Use the recovery email link to set a new password.',
  };
};
