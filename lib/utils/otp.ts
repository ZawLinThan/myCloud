import { Resend } from 'resend';
import hashingService from './hashing';

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN_MINUTES = 10;
const PENDING_USER_TTL_MS = 60 * 60 * 1000;

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;

  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

const hashOtp = async (otp: string) => {
  return hashingService.hash(otp);
};

const verifyOtpHash = async (otp: string, otpHash: string) => {
  return hashingService.verify(otp, otpHash);
};

const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);
};

const issueOtp = async (
  user: {
    email: string;
    otpExpiresAt?: Date;
    otpHash?: string;
    save: () => Promise<unknown>;
    deleteAt?: Date | null;
  },
  options: { expirePendingUser?: boolean } = {}
) => {
  const otp = otpService.generateOtp();

  user.otpHash = await otpService.hashOtp(otp);
  user.otpExpiresAt = otpService.getOtpExpiry();

  if (options.expirePendingUser) {
    user.deleteAt = new Date(Date.now() + PENDING_USER_TTL_MS);
  }

  await user.save();

  return otpService.sendOtpEmail({ email: user.email, otp });
};

const sendOtpEmail = async ({ email, otp }: { email: string; otp: string }) => {
  const resend = new Resend(process.env.RESEND_API);

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'OTP for MyCloud',
    html: `<p> Your OTP for MyCloud is <strong>${otp}</strong>!</p>`,
  });

  if (error)
    return {
      success: false,
      message: error.message,
    };

  return {
    success: true,
    message: `OTP sent successfully. ID: ${data.id}`,
  };
};

const otpService = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getOtpExpiry,
  sendOtpEmail,
  issueOtp,
};

export default otpService;
