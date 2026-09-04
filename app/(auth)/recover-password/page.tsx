'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

import AuthSubmitButton from '../components/AuthSubmitButton';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import ErrorMessage from '../../../components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import { auth } from '@/lib/firebase/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

export default function RecoverPasswordPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [recovery, setRecovery] = useState(false);

  const sendRecoveryEmail = async ({ email }: { email: string }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent. Check your inbox.');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setRecovery(true);
    } catch {
      setErrorMessage('Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    console.log('Hit handleSubmit');
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();

    if (email) {
      setEmail(email);
    }

    if (!email) {
      setErrorMessage('Email is required for recovery.');
      return;
    }

    setIsSubmitting(true);

    sendRecoveryEmail({ email });

    setIsSubmitting(false);
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
              placeholder={email ? email : 'you@example.com'}
              type="email"
              required
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
      {successMessage && <SuccessMessage message={successMessage} />}
      <div className="flex justify-center mt-3 hover:font-bold">
        {recovery && (
          <button
            onClick={() => sendRecoveryEmail({ email })}
            className="text-accent underline"
          >
            Resend recovery link.
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered your password?{' '}
        <Link href="/sign-in" className="font-semibold text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
