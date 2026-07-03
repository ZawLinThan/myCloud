import 'server-only';

import { cookies } from 'next/headers';
import { getStorageLimitBytes } from '@/lib/billing/storage-plans';
import {
  firebaseAdminAuth,
  firebaseAdminDb,
  hasExplicitFirebaseAdminCredentials,
} from '@/lib/firebase/admin';
import { CurrentUser } from '../types/types';
import { serializeFiles } from './fileSerialization';

export const FIREBASE_SESSION_COOKIE_NAME = 'firebase-id-token';
export const LEGACY_SESSION_COOKIE_NAME = 'session-token';

const SESSION_MAX_AGE = 60 * 60;

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

export const clearSessionCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(FIREBASE_SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME);
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(FIREBASE_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
    let userData: FirebaseFirestore.DocumentData | undefined;

    if (hasExplicitFirebaseAdminCredentials) {
      try {
        const userSnap = await firebaseAdminDb
          .collection('users')
          .doc(decodedToken.uid)
          .get();

        userData = userSnap.exists ? userSnap.data() : undefined;
      } catch (error) {
        console.error('Firebase session user lookup error:', error);
      }
    }

    const email = decodedToken.email ?? userData?.email;
    const fullName =
      userData?.fullName ||
      decodedToken.name ||
      email?.split('@')[0] ||
      'MyCloud user';
    const purchasedStorageGb =
      typeof userData?.purchasedStorageGb === 'number'
        ? userData.purchasedStorageGb
        : 0;

    return {
      accountId: decodedToken.uid,
      email,
      fullName,
      avatar: userData?.avatar ?? decodedToken.picture ?? null,
      files: serializeFiles(userData?.files),
      purchasedStorageGb,
      storageLimitBytes:
        typeof userData?.storageLimitBytes === 'number'
          ? userData.storageLimitBytes
          : getStorageLimitBytes(purchasedStorageGb),
    };
  } catch (error) {
    console.error('Firebase session verification error:', error);
    return null;
  }
};
