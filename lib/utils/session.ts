import 'server-only';

import { cookies } from 'next/headers';

import User from '@/models/user.model';
import { connectDB } from '@/lib/mongoDB/db';
import { serializeAuthUser } from './authUser';
import { firebaseAdminAuth } from '@/lib/firebase/admin';

export const FIREBASE_SESSION_COOKIE_NAME = 'firebase-id-token';
export const LEGACY_SESSION_COOKIE_NAME = 'session-token';

export const getCurrentUser = async () => {
  const token = (await cookies()).get(FIREBASE_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
    await connectDB();

    const user = await User.findOne({
      $or: [{ accountId: decodedToken.uid }, { email: decodedToken.email }],
    });

    if (!user?.isVerified) {
      return null;
    }

    return serializeAuthUser(user);
  } catch {
    return null;
  }
};
