import ResetPasswordForm from './ResetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { email = '' } = await searchParams;

  return <ResetPasswordForm email={email} />;
}
