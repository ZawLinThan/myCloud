import 'server-only';

import { cookies } from 'next/headers';

import User from '@/models/user.model';
import { connectDB } from '@/lib/mongoDB/db';
import { serializeAuthUser } from './authUser';
import { SESSION_COOKIE_NAME, verifyToken } from './generateToken';

export const getCurrentUser = async () => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  await connectDB();

  const user = await User.findById(payload.userId);

  if (!user?.isVerified) {
    return null;
  }

  return serializeAuthUser(user);
};
