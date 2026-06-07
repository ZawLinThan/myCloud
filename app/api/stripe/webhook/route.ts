import {
  BYTES_PER_GB,
  getStorageLimitBytes,
} from '@/lib/billing/storage-plans';
import { getStripe } from '@/lib/billing/stripe';
import { firebaseAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { message: 'STRIPE_WEBHOOK_SECRET is required.' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json(
      { message: 'Missing Stripe signature.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook.';
    return Response.json({ message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    const additionalGb = Number(session.metadata?.additionalGb);

    if (uid && Number.isFinite(additionalGb) && additionalGb > 0) {
      await applyStoragePurchase({
        additionalGb,
        sessionId: session.id,
        uid,
      });
    }
  }

  return Response.json({ received: true });
}

const applyStoragePurchase = async ({
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
