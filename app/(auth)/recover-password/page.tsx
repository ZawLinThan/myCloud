'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthSubmitButton from '../components/AuthSubmitButton';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { resendOtp } from '@/lib/actions/user.actions';
import ErrorMessage from '../../../components/ErrorMessage';

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();

    if (!email) {
      setErrorMessage('Email is required for recovery.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resendOtp({ email, type: 'recovery' });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.replace(
        `/verify-otp?flow=recovery&email=${encodeURIComponent(email)}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div>
        <p className="text-sm font-semibold text-accent">Account recovery</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Enter your email and we will send recovery instructions if the account
          exists.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-app">Email</span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <MailOutlineRoundedIcon fontSize="small" />
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </span>
        </label>

        <AuthSubmitButton
          isLoading={isSubmitting}
          loadingText="Sending..."
          text="Send recovery link"
        />
      </form>

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <p className="mt-6 text-center text-sm text-muted">
        Remembered your password?{' '}
        <Link href="/sign-in" className="font-semibold text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
