import { redirect } from 'next/navigation';

import AuthForm from '../components/AuthForm';
import { getCurrentUser } from '@/lib/utils/session';

const SignIn = async () => {
  console.log('Checking authentication status...');
  const user = await getCurrentUser();
  console.log('Current user:', user);
  if (user) {
    redirect('/dashboard');
  }

  return <AuthForm type="sign-in" />;
};

export default SignIn;
