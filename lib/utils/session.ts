import 'server-only';

import { cookies } from 'next/headers';
import { firebaseAdminAuth } from '@/lib/firebase/admin';

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

export const getCurrentUser = async () => {
  const token = (await cookies()).get(FIREBASE_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
    return {
      accountId: decodedToken.uid,
      email: decodedToken.email,
      fullName: decodedToken.name,
      avatar: decodedToken.picture ?? null,
      files: decodedToken.files,
    };
  } catch {
    return null;
  }
};
