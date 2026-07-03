import { confirmStoragePurchase } from '@/lib/billing/confirm-storage-purchase';
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

    const result = await confirmStoragePurchase({ sessionId, user });

    if (result.status === 'failed') {
      return NextResponse.json(
        { message: result.message },
        {
          status: result.message.includes('another account') ? 403 : 422,
        }
      );
    }

    if (result.status === 'pending') {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (
      result.status === 'confirmed' &&
      'purchasedStorageGb' in result &&
      'storageLimitBytes' in result
    ) {
      return NextResponse.json({
        purchasedStorageGb: result.purchasedStorageGb,
        storageLimitBytes: result.storageLimitBytes,
      });
    }

    return NextResponse.json(
      { message: 'Unexpected result status or missing properties.' },
      { status: 500 }
    );
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
