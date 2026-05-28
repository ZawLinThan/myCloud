import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
    },
    accountId: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpHash: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    deleteAt: {
      type: Date,
      default: null,
    },
    files: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'File',
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

userSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

export default User;
