'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';

import AuthSubmitButton from './AuthSubmitButton';
import ErrorMessage from '../../../components/ErrorMessage';
import { AuthFormProps, AuthFormValues, authFormSchema } from '../types';
import { signIn, signUp } from '@/lib/actions/user.actions';
import { getAuthFormContent, getDefaultValues } from '../utils/authForm.util';

const AuthForm = ({ type }: AuthFormProps) => {
  const isSignIn = type === 'sign-in';
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AuthFormValues>({
    defaultValues: getDefaultValues(type),
    resolver: zodResolver(authFormSchema),
  });
  const formContent = getAuthFormContent(type);

  const [backendErrorMsg, setBackendErrorMsg] = useState('');
  const [backendSuccessMsg, setBackendSuccessMsg] = useState('');
  const router = useRouter();

  // Submit handler for both sign-in and sign-up forms.
  const onSubmit = async (data: AuthFormValues) => {
    setBackendErrorMsg('');
    setBackendSuccessMsg('');

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isSignIn) {
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        setBackendErrorMsg(result.message);
      } else {
        setBackendSuccessMsg(result.message);
        router.replace('/dashboard');
      }
    } else {
      if (!data.fullName) {
        throw new Error('Full name is required');
      }

      const result = await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        setBackendErrorMsg(result.message);
      } else {
        setBackendSuccessMsg(result.message);
        router.replace(
          `/verify-otp?flow=sign-up&email=${encodeURIComponent(data.email)}`
        );
      }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div>
        <p className="text-sm font-semibold text-accent">
          {formContent.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          {formContent.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {formContent.subtitle}
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('type')} />

        {!isSignIn && (
          <label className="block">
            <span className="text-sm font-medium text-app">Full name</span>
            <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
              <PersonOutlineRoundedIcon fontSize="small" />
              <input
                className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
                placeholder="Your full name"
                type="text"
                {...register('fullName')}
              />
            </span>
            <ErrorMessage
              message={!isSignIn ? errors.fullName?.message : undefined}
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium text-app">Email</span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <MailOutlineRoundedIcon fontSize="small" />
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              placeholder="you@example.com"
              type="email"
              {...register('email')}
            />
          </span>
          <ErrorMessage message={errors.email?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-app">Password</span>
          <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
            <LockOutlinedIcon fontSize="small" />
            <input
              className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
              placeholder="Password"
              type="password"
              {...register('password')}
            />
          </span>
          <ErrorMessage message={errors.password?.message} />
        </label>

        <AuthSubmitButton
          isLoading={isSubmitting}
          loadingText={formContent.loadingText}
          text={formContent.submitText}
        />
      </form>

      {backendErrorMsg && <ErrorMessage message={backendErrorMsg} />}

      {backendSuccessMsg && (
        <p className="mt-4 text-sm text-emerald-600">{backendSuccessMsg}</p>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {formContent.bottomText}
        <Link
          href={formContent.bottomLinkHref}
          className="font-semibold text-accent"
        >
          {formContent.bottomLinkText}
        </Link>
      </p>
      {isSignIn && (
        <Link
          href="/recover-password"
          className="mt-4 block text-center text-sm font-semibold text-accent hover:underline"
        >
          Forgot password?
        </Link>
      )}
    </div>
  );
};

export default AuthForm;
