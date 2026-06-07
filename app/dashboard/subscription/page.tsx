import { getCurrentUser } from '@/lib/utils/session';
import { redirect } from 'next/navigation';
import SubscriptionClient from './SubscriptionClient';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string | string[] }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const checkoutStatus = Array.isArray(params.checkout)
    ? params.checkout[0]
    : params.checkout;

  return <SubscriptionClient checkoutStatus={checkoutStatus} user={user} />;
}
