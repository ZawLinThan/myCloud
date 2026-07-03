import { applyStoragePurchase } from '@/lib/billing/storage-purchases';
import { getStripe } from '@/lib/billing/stripe';
import { firebaseAdminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/utils/session';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const readRequestJson = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: 'Please sign in to confirm storage purchase.' },
        { status: 401 }
      );
    }

    const body = await readRequestJson<{ sessionId?: string }>(request);
    const sessionId = body?.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Missing Stripe checkout session.' },
        { status: 400 }
      );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const uid = session.metadata?.uid;
    const additionalGb = Number(session.metadata?.additionalGb);

    if (uid !== user.accountId) {
      return NextResponse.json(
        { message: 'This storage purchase belongs to another account.' },
        { status: 403 }
      );
    }

    if (!Number.isFinite(additionalGb) || additionalGb <= 0) {
      return NextResponse.json(
        {
          message: 'Stripe checkout session is missing storage plan metadata.',
        },
        { status: 422 }
      );
    }

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          message: 'Stripe has not confirmed this payment yet.',
          paymentStatus: session.payment_status,
          sessionStatus: session.status,
        },
        { status: 409 }
      );
    }

    await applyStoragePurchase({
      additionalGb,
      sessionId: session.id,
      uid,
    });

    const userSnap = await firebaseAdminDb.collection('users').doc(uid).get();
    const userData = userSnap.exists ? userSnap.data() : undefined;

    return NextResponse.json({
      purchasedStorageGb:
        typeof userData?.purchasedStorageGb === 'number'
          ? userData.purchasedStorageGb
          : user.purchasedStorageGb,
      storageLimitBytes:
        typeof userData?.storageLimitBytes === 'number'
          ? userData.storageLimitBytes
          : user.storageLimitBytes,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    const isMissingFirebaseCredentials = errorMessage.includes(
      'Could not load the default credentials'
    );
    const message = isMissingFirebaseCredentials
      ? 'Firebase Admin credentials are missing. Add FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to your server environment.'
      : error instanceof Stripe.errors.StripeError
        ? error.message
        : errorMessage || 'Unable to confirm storage purchase.';

    return NextResponse.json({ message }, { status: 500 });
  }
}
