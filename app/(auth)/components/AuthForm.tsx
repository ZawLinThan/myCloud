'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';

import AuthSubmitButton from './AuthSubmitButton';
import ErrorMessage from '../../../components/ErrorMessage';
import { AuthFormProps, AuthFormValues, authFormSchema } from '../types';
import {
  getFirebaseEmailVerificationStatus,
  setFirebaseSessionCookie,
  signIn,
} from '@/lib/actions/user.actions';
import { getAuthFormContent, getDefaultValues } from '../utils/authForm.util';
import SignInWithGoogle from './SignInWithGoogle';
import { auth } from '@/lib/firebase/firebase';

const VERIFY_EMAIL_MESSAGE = 'Please verify your email before signing in.';

const getFirebaseAuthCode = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'string'
    ? error.code
    : '';

const getFirebaseAuthMessage = (error: unknown) => {
  const code = getFirebaseAuthCode(error);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'User with this email already exists! Sign in to your account.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid credential.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Firebase could not complete authentication.';
  }
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
      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const idToken = await credential.user.getIdToken();
        const result = await signIn({ idToken });

        if (!result.success) {
          setBackendErrorMsg(result.message);
          await sendEmailVerification(credential.user);
          await signOut(auth);
          return;
        } else {
          setBackendSuccessMsg(result.message);
          setFirebaseSessionCookie(idToken);
          router.replace('/dashboard');
          router.refresh();
        }
      } catch (error) {
        const errorCode = getFirebaseAuthCode(error);

        if (errorCode === 'auth/too-many-requests') {
          const verificationStatus = await getFirebaseEmailVerificationStatus({
            email: data.email,
          });

          if (verificationStatus.success && !verificationStatus.emailVerified) {
            setBackendErrorMsg(VERIFY_EMAIL_MESSAGE);
            return;
          }
        }

        setBackendErrorMsg(getFirebaseAuthMessage(error));
        // if (error === 'User with this email already exists! Sign in to your account.') {
        //   const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
        //   const user = credential.user;

        //   console.log("HERE")
        //   if (!user.emailVerified) {
        //     await sendEmailVerification(credential.user);
        //     await signOut(auth);

        //     setBackendSuccessMsg('Verification email sent. Please verify your email before signing in.')
        //   }
        // }
      }
    } else {
      try {
        if (!data.fullName) {
          throw new Error('Full name is required');
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await updateProfile(credential.user, {
          displayName: data.fullName,
        });
        await sendEmailVerification(credential.user);
        await signOut(auth);

        setBackendSuccessMsg(
          'Verification email sent. Please verify your email before signing in.'
        );
      } catch (error) {
        const errorMsg = getFirebaseAuthMessage(error);
        setBackendErrorMsg(errorMsg);
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

      <div>
        <SignInWithGoogle />
      </div>
    </div>
  );
};

export default AuthForm;
