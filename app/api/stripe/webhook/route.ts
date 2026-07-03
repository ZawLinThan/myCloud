import { applyStoragePurchase } from '@/lib/billing/storage-purchases';
import { getStripe } from '@/lib/billing/stripe';
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
