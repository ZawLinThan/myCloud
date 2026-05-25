import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const con = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB connected: ${con.connection.host}`);
    return con.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
