import { redirect } from 'next/navigation';

import AuthForm from '../components/AuthForm';
import { getCurrentUser } from '@/lib/utils/session';

const SignIn = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return <AuthForm type="sign-in" />;
};

export default SignIn;
