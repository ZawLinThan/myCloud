import 'server-only';

import { firebaseAdminDb } from '@/lib/firebase/admin';
import type { CurrentUser } from '@/lib/types/types';
import { getStripe } from './stripe';
import { applyStoragePurchase } from './storage-purchases';

export type StoragePurchaseConfirmation =
  | {
      purchasedStorageGb: number;
      status: 'confirmed';
      storageLimitBytes: number;
    }
  | {
      message: string;
      purchasedStorageGb?: number; // optional, might need to remove this field if not needed
      status: 'pending' | 'failed';
    };

export const confirmStoragePurchase = async ({
  sessionId,
  user,
}: {
  sessionId: string;
  user: CurrentUser;
}): Promise<StoragePurchaseConfirmation> => {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const uid = session.metadata?.uid;
  const additionalGb = Number(session.metadata?.additionalGb);

  if (uid !== user.accountId) {
    return {
      message: 'This storage purchase belongs to another account.',
      status: 'failed',
    };
  }

  if (!Number.isFinite(additionalGb) || additionalGb <= 0) {
    return {
      message: 'Stripe checkout session is missing storage plan metadata.',
      status: 'failed',
    };
  }

  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    return {
      message: 'Stripe has not confirmed this payment yet.',
      status: 'pending',
    };
  }

  await applyStoragePurchase({
    additionalGb,
    sessionId: session.id,
    uid,
  });

  const userSnap = await firebaseAdminDb.collection('users').doc(uid).get();
  const userData = userSnap.exists ? userSnap.data() : undefined;

  return {
    purchasedStorageGb:
      typeof userData?.purchasedStorageGb === 'number'
        ? userData.purchasedStorageGb
        : user.purchasedStorageGb,
    status: 'confirmed',
    storageLimitBytes:
      typeof userData?.storageLimitBytes === 'number'
        ? userData.storageLimitBytes
        : user.storageLimitBytes,
  };
};
