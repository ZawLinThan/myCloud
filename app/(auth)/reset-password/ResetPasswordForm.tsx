'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthSubmitButton from '../components/AuthSubmitButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorMessage from '../../../components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import { resetPassword } from '@/lib/actions/user.actions';

type ResetPasswordFormProps = {
  email: string;
};

export default function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password')?.toString().trim();
    const confirmPassword = formData.get('confirmPassword')?.toString().trim();

    if (!password || !confirmPassword) {
      setErrorMessage('Both password fields are required.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!email) {
      setErrorMessage('Email is not provided.');
      return;
    }

    setSuccessMessage('Password is ready to update.');
    const connection = await resetPassword({ email, password });

    if (!connection.success) {
      setErrorMessage(connection.message);
    } else {
      setSuccessMessage(connection.message);
      router.replace('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div>
        <p className="text-sm font-semibold text-accent">Password reset</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          Create a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose a strong password for your MyCloud account.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-app">New password</span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <LockOutlinedIcon fontSize="small" />
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              name="password"
              placeholder="New password"
              type="password"
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-app">Confirm password</span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <LockOutlinedIcon fontSize="small" />
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              name="confirmPassword"
              placeholder="Confirm password"
              type="password"
            />
          </span>
        </label>

        <AuthSubmitButton
          isLoading={false}
          loadingText="Updating..."
          text="Update password"
        />
      </form>

      {errorMessage && <ErrorMessage message={errorMessage} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      <p className="mt-6 text-center text-sm text-muted">
        Back to{' '}
        <Link href="/sign-in" className="font-semibold text-accent">
          sign in
        </Link>
      </p>
    </div>
  );
}
