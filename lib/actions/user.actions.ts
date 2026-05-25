'use server';

import bcrypt from 'bcryptjs';
import { connectDB } from '../mongoDB/db';
import User from '@/models/user.model';
import { generateTokenAndSetCookie } from '../utils/generateToken';

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

    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const accountId = crypto.randomUUID();

    const newUser = await User.create({
      fullName,
      email,
      accountId,
      password: hashedPassword,
    });

    await generateTokenAndSetCookie({
      userId: newUser._id.toString(),
      email: newUser.email,
    });

    return {
      success: true,
      message: 'User created successfully',
      user: {
        _id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        accountId: newUser.accountId,
        avatar: newUser.avatar ?? null,
        files: [],
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);

    return {
      success: false,
      message: 'Failed to create user',
    };
  }
};
