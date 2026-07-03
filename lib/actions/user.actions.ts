'use server';

import {
  firebaseAdminAuth,
  firebaseAdminDb,
  hasFirebaseAdminCredentials,
} from '@/lib/firebase/admin';
import {
  setFirebaseSessionCookie,
  clearSessionCookies,
} from '../utils/session';
import { getStorageLimitBytes } from '../billing/storage-plans';
import { serializeFiles } from '../utils/fileSerialization';

const getVerifiedFirebaseUser = async (idToken: string) => {
  if (!idToken) {
    throw new Error('Firebase ID token is required.');
  }

  return firebaseAdminAuth.verifyIdToken(idToken);
};

const getUserDocument = async (uid: string) => {
  if (!hasFirebaseAdminCredentials) {
    return null;
  }

  try {
    return await firebaseAdminDb.collection('users').doc(uid).get();
  } catch (error) {
    console.error('Firebase user document read error:', error);
    return null;
  }
};

const syncUserDocument = async ({
  uid,
  email,
  displayName,
  avatar,
  documentExists,
}: {
  uid: string;
  email: string;
  displayName: string;
  avatar: string | null;
  documentExists: boolean;
}) => {
  if (!hasFirebaseAdminCredentials) {
    console.warn(
      'Skipping Firebase user document sync because Admin credentials are not configured.'
    );
    return;
  }

  try {
    await firebaseAdminDb
      .collection('users')
      .doc(uid)
      .set(
        {
          accountId: uid,
          email,
          fullName: displayName,
          avatar,
          otpHash: null,
          otpExpiresAt: null,
          ...(!documentExists
            ? {
                files: [],
                purchasedStorageGb: 0,
                storageLimitBytes: getStorageLimitBytes(0),
              }
            : {}),
        },
        { merge: true }
      );
  } catch (error) {
    console.error('Firebase user document sync error:', error);
  }
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

    const userDocSnap = await getUserDocument(decodedToken.uid);

    await syncUserDocument({
      uid: decodedToken.uid,
      email,
      displayName,
      avatar: decodedToken.picture ?? null,
      documentExists: userDocSnap?.exists ?? false,
    });

    await setFirebaseSessionCookie(idToken);

    const userData = userDocSnap?.exists ? userDocSnap.data() : undefined;

    return {
      success: true,
      message: 'Signed in successfully',
      user: {
        accountId: decodedToken.uid,
        email,
        fullName: displayName,
        avatar: decodedToken.picture ?? null,
        files: serializeFiles(userData?.files),
        purchasedStorageGb:
          typeof userData?.purchasedStorageGb === 'number'
            ? userData.purchasedStorageGb
            : 0,
        storageLimitBytes:
          typeof userData?.storageLimitBytes === 'number'
            ? userData.storageLimitBytes
            : getStorageLimitBytes(0),
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
