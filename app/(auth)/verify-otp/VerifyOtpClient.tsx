'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import OTPForm from '../components/OTPForm';
import { resendOtp, verifyOtp } from '@/lib/actions/user.actions';

type OtpFlow = 'sign-up' | 'recovery';

type VerifyOtpClientProps = {
  email: string;
  flow: string;
};

const isOtpFlow = (flow: string): flow is OtpFlow =>
  flow === 'sign-up' || flow === 'recovery';

export default function VerifyOtpClient({ email, flow }: VerifyOtpClientProps) {
  const router = useRouter();
  const [backendErrorMsg, setBackendErrorMsg] = useState('');
  const [backendSuccessMsg, setBackendSuccessMsg] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  if (!email || !isOtpFlow(flow)) {
    return (
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold text-accent">Invalid request</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          Verification link is incomplete
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Start again so we can send a fresh verification code.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 block text-sm font-semibold text-accent"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBackendErrorMsg('');
    setBackendSuccessMsg('');
    setIsVerifyingOtp(true);

    try {
      const result = await verifyOtp({ email, otp, type: flow });

      if (!result.success) {
        setBackendErrorMsg(result.message);
        return;
      }

      setBackendSuccessMsg(result.message);
      router.replace(
        flow === 'sign-up'
          ? '/dashboard'
          : `/reset-password?email=${encodeURIComponent(email)}`
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setBackendErrorMsg('');
    setBackendSuccessMsg('');
    setIsResendingOtp(true);

    try {
      const result = await resendOtp({ email, type: flow });

      if (!result.success) {
        setBackendErrorMsg(result.message);
        return;
      }

      setBackendSuccessMsg(result.message);
      setOtp('');
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <OTPForm
      backendErrorMsg={backendErrorMsg}
      backendSuccessMsg={backendSuccessMsg}
      description={`We sent a 6-digit verification code to ${email}.`}
      isResendingOtp={isResendingOtp}
      isVerifyingOtp={isVerifyingOtp}
      onResendOtp={handleResendOtp}
      onSubmit={handleSubmit}
      otp={otp}
      setOtp={setOtp}
      submitText={flow === 'sign-up' ? 'Verify account' : 'Verify code'}
      title={flow === 'sign-up' ? 'Verify email' : 'Verify recovery code'}
    />
  );
}
