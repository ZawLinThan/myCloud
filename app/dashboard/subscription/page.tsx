import { getCurrentUser } from '@/lib/utils/session';
import { redirect } from 'next/navigation';
import SubscriptionClient from './SubscriptionClient';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkout?: string | string[];
    session_id?: string | string[];
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const checkoutStatus = Array.isArray(params.checkout)
    ? params.checkout[0]
    : params.checkout;
  const checkoutSessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;

  return (
    <SubscriptionClient
      checkoutSessionId={checkoutSessionId}
      checkoutStatus={checkoutStatus}
      user={user}
    />
  );
}
