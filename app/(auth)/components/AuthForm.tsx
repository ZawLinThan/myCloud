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
import ErrorMessage from './ErrorMessage';
import { AuthFormValues, authFormSchema } from '@/lib/validations/authForm';
import { signUp, signIn, verifySignUpOtp } from '@/lib/actions/user.actions';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
}

const getDefaultValues = (type: AuthFormProps['type']): AuthFormValues => {
  if (type === 'sign-in') {
    return {
      type,
      email: '',
      password: '',
    };
  }

  return {
    type,
    email: '',
    password: '',
    fullName: '',
  };
};

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

  const title = isSignIn ? 'Sign in to MyCloud' : 'Start using MyCloud';
  const subtitle = isSignIn
    ? 'Access your files, shared folders, and recent uploads.'
    : 'Set up your account and organize files for yourself or your team.';
  const eyebrow = isSignIn ? 'Welcome back' : 'Create workspace';
  const text = isSignIn ? 'Sign in' : 'Create account';
  const loadingText = isSignIn ? 'Signing in...' : 'Creating account...';
  const bottomText = isSignIn
    ? "Don't have an account? "
    : 'Already have an account? ';
  const bottomLinkText = isSignIn ? 'Sign up' : 'Sign in';
  const bottomLinkHref = isSignIn ? '/sign-up' : '/sign-in';

  const [backendErrorMsg, setBackendErrorMsg] = useState('');
  const [backendSuccessMsg, setBackendSuccessMsg] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const router = useRouter();

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
      }
    } else {
      // For sign-up, we need to ensure fullName is provided before calling the API
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
        setPendingEmail(data.email);
        setBackendSuccessMsg(result.message);
      }
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBackendErrorMsg('');
    setBackendSuccessMsg('');
    setIsVerifyingOtp(true);

    try {
      const result = await verifySignUpOtp({
        email: pendingEmail,
        otp,
      });

      if (!result.success) {
        setBackendErrorMsg(result.message);
      } else {
        setBackendSuccessMsg(result.message);
        router.push('/');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (!isSignIn && pendingEmail) {
    return (
      <div className="w-full max-w-sm">
        <div>
          <p className="text-sm font-semibold text-accent">Verify email</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
            Enter your code
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            We sent a 6-digit verification code to {pendingEmail}.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleVerifyOtp}>
          <label className="block">
            <span className="text-sm font-medium text-app">
              Verification code
            </span>
            <span className="mt-2 flex items-center gap-2 rounded-md border border-app bg-[var(--surface-soft)] px-3 py-3 text-muted">
              <input
                className="w-full bg-transparent text-sm text-app outline-none placeholder:text-muted"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                type="text"
                value={otp}
              />
            </span>
          </label>

          <AuthSubmitButton
            isLoading={isVerifyingOtp}
            loadingText="Verifying..."
            text="Verify account"
          />
        </form>

        {backendErrorMsg && <ErrorMessage message={backendErrorMsg} />}
        {backendSuccessMsg && (
          <p className="mt-4 text-sm text-emerald-600">{backendSuccessMsg}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div>
        <p className="text-sm font-semibold text-accent">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
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
          loadingText={loadingText}
          text={text}
        />
      </form>

      {backendErrorMsg && <ErrorMessage message={backendErrorMsg} />}

      {/*success message may be unnecessary*/}
      {backendSuccessMsg && (
        <p className="mt-4 text-sm text-emerald-600">{backendSuccessMsg}</p>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {bottomText}
        <Link href={bottomLinkHref} className="font-semibold text-accent">
          {bottomLinkText}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
