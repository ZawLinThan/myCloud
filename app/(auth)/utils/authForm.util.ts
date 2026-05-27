import { AuthFormProps, AuthFormValues } from '../types';

export const getAuthFormContent = (type: AuthFormProps['type']) => {
  const isSignIn = type === 'sign-in';

  return {
    bottomLinkHref: isSignIn ? '/sign-up' : '/sign-in',
    bottomLinkText: isSignIn ? 'Sign up' : 'Sign in',
    bottomText: isSignIn
      ? "Don't have an account? "
      : 'Already have an account? ',
    eyebrow: isSignIn ? 'Welcome back' : 'Create workspace',
    loadingText: isSignIn ? 'Signing in...' : 'Creating account...',
    submitText: isSignIn ? 'Sign in' : 'Create account',
    subtitle: isSignIn
      ? 'Access your files, shared folders, and recent uploads.'
      : 'Set up your account and organize files for yourself or your team.',
    title: isSignIn ? 'Sign in to MyCloud' : 'Start using MyCloud',
  };
};

export const getDefaultValues = (
  type: AuthFormProps['type']
): AuthFormValues => {
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
