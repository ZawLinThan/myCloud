'use server';

import { firebaseAdminAuth } from '@/lib/firebase/admin';
import {
  setFirebaseSessionCookie,
  clearSessionCookies,
} from '../utils/session';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { fileFormat } from '../types/types';

const getVerifiedFirebaseUser = async (idToken: string) => {
  if (!idToken) {
    throw new Error('Firebase ID token is required.');
  }

  return firebaseAdminAuth.verifyIdToken(idToken);
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

    const displayName =
      fullName?.trim() ||
      decodedToken.name ||
      email.split('@')[0] ||
      'MyCloud user';

    const userDocRef = doc(db, 'users', decodedToken.uid);
    const userDocSnap = await getDoc(userDocRef);
    // const existingFiles = userDocSnap.exists()
    //   ? ((userDocSnap.data().files ?? []) as fileFormat[])
    //   : [];

    // initialize at sign-up, not sign in
    if (userDocSnap) {
      await setDoc(
        userDocRef,
        {
          accountId: decodedToken.uid,
          email: decodedToken.email,
          fullName: displayName,
          avatar: decodedToken.picture ?? null,
          ...(!userDocSnap.exists() ? { files: [] } : {}),
        },
        { merge: true }
      );
    }

    await setFirebaseSessionCookie(idToken);

    return {
      success: true,
      message: 'Signed in successfully',
      user: {
        accountId: decodedToken.uid,
        email: decodedToken.email,
        fullName: displayName,
        avatar: decodedToken.picture ?? null,
        files: decodedToken.files,
      },
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
  return createOrUpdateFirebaseUser({ idToken });
};

export const getFirebaseEmailVerificationStatus = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const user = await firebaseAdminAuth.getUserByEmail(email);

    return {
      success: true,
      emailVerified: user.emailVerified,
    };
  } catch {
    return {
      success: false,
      emailVerified: false,
    };
  }
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
