import 'server-only';

import { cookies } from 'next/headers';
import { getStorageLimitBytes } from '@/lib/billing/storage-plans';
import { firebaseAdminAuth, firebaseAdminDb } from '@/lib/firebase/admin';
import { CurrentUser } from '../types/types';
import { serializeFiles } from './fileSerialization';
import { decode } from 'punycode';

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
  console.log('Token retrieved');
  if (!token) {
    console.log('No token found in cookies.');
    return null;
  }
  console.log('Token found, verifying...');
  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);

    // const userSnap = await firebaseAdminDb
    //   .collection('users')
    //   .doc(decodedToken.uid)
    //   .get();
    // console.log("line 48")
    // const userData = userSnap.exists ? userSnap.data() : undefined;
    // const purchasedStorageGb =
    //   typeof userData?.purchasedStorageGb === 'number'
    //     ? userData.purchasedStorageGb
    //     : 0;
    // console.log("User data retrieved:")
    return {
      accountId: decodedToken.uid,
      email: decodedToken.email, // ?? userData?.email,
      fullName: decodedToken.name,
      //userData?.fullName || decodedToken.name || decodedToken.email || 'User',
      avatar: decodedToken.picture ?? null, //userData?.avatar ?? decodedToken.picture ?? null,
      files: decodedToken.files, //userData?.files, //serializeFiles(userData?.files),
      purchasedStorageGb: decodedToken.purchasedStorageGb, //typeof userData?.purchasedStorageGb === 'number' ? userData.purchasedStorageGb : 0,
      storageLimitBytes: getStorageLimitBytes(decodedToken.purchasedStorageGb), //typeof userData?.storageLimitBytes === 'number' ? userData.storageLimitBytes : getStorageLimitBytes(purchasedStorageGb),
    };
  } catch {
    return null;
  }
};
