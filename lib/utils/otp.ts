import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN_MINUTES = 10;

export const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;

  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export const hashOtp = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);

  return bcrypt.hash(otp, salt);
};

export const verifyOtpHash = async (otp: string, otpHash: string) => {
  return bcrypt.compare(otp, otpHash);
};

export const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);
};

export const sendOtpEmail = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
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
