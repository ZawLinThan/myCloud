import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

type TokenPayload = {
  userId: string;
  email?: string;
};

export const SESSION_COOKIE_NAME = 'session-token';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return secret;
};

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      return null;
    }

    return {
      userId: payload.userId,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  } catch {
    return null;
  }
};

export const generateTokenAndSetCookie = async (payload: TokenPayload) => {
  const token = generateToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return token;
};
