import 'server-only';

import { firebaseAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { BYTES_PER_GB, getStorageLimitBytes } from './storage-plans';

export const applyStoragePurchase = async ({
  additionalGb,
  sessionId,
  uid,
}: {
  additionalGb: number;
  sessionId: string;
  uid: string;
}) => {
  const purchaseRef = firebaseAdminDb
    .collection('stripeCheckoutSessions')
    .doc(sessionId);
  const userRef = firebaseAdminDb.collection('users').doc(uid);

  await firebaseAdminDb.runTransaction(async (transaction) => {
    const purchaseSnap = await transaction.get(purchaseRef);

    if (purchaseSnap.exists) {
      return;
    }

    const userSnap = await transaction.get(userRef);
    const userData = userSnap.exists ? userSnap.data() : undefined;
    const currentPurchasedGb =
      typeof userData?.purchasedStorageGb === 'number'
        ? userData.purchasedStorageGb
        : 0;
    const nextPurchasedGb = currentPurchasedGb + additionalGb;

    transaction.set(purchaseRef, {
      additionalGb,
      createdAt: FieldValue.serverTimestamp(),
      uid,
    });

    transaction.set(
      userRef,
      {
        purchasedStorageGb: nextPurchasedGb,
        storageLimitBytes: getStorageLimitBytes(nextPurchasedGb),
        storagePurchasedBytes: FieldValue.increment(
          additionalGb * BYTES_PER_GB
        ),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
};
