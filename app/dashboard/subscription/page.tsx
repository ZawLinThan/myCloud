import { confirmStoragePurchase } from '@/lib/billing/confirm-storage-purchase';
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
  let currentUser = user;
  let checkoutConfirmationStatus: 'idle' | 'confirmed' | 'pending' | 'failed' =
    'idle';

  if (checkoutStatus === 'success' && checkoutSessionId) {
    try {
      const confirmation = await confirmStoragePurchase({
        sessionId: checkoutSessionId,
        user,
      });

      checkoutConfirmationStatus = confirmation.status;

      if (confirmation.status === 'confirmed') {
        currentUser = {
          ...user,
          purchasedStorageGb: confirmation.purchasedStorageGb,
          storageLimitBytes: confirmation.storageLimitBytes,
        };
      }
    } catch {
      checkoutConfirmationStatus = 'failed';
    }
  }

  return (
    <SubscriptionClient
      checkoutSessionId={checkoutSessionId}
      checkoutStatus={checkoutStatus}
      user={currentUser}
    />
  );
}
