import VerifyOtpClient from './VerifyOtpClient';

type VerifyOtpPageProps = {
  searchParams: Promise<{
    email?: string;
    flow?: string;
  }>;
};

export default async function VerifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  const { email = '', flow = '' } = await searchParams;

  return <VerifyOtpClient email={email} flow={flow} />;
}
