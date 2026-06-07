import { getStoragePlan } from '@/lib/billing/storage-plans';
import { getStripe } from '@/lib/billing/stripe';
import { getCurrentUser } from '@/lib/utils/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: 'Please sign in to buy storage.' },
      { status: 401 }
    );
  }

  const { planId } = (await request.json()) as { planId?: string };
  const plan = planId ? getStoragePlan(planId) : undefined;

  if (!plan) {
    return NextResponse.json(
      { message: 'Unknown storage plan.' },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    cancel_url: `${origin}/dashboard/subscription?checkout=cancelled`,
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            description: plan.description,
            name: plan.name,
          },
          unit_amount: plan.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      additionalGb: String(plan.additionalGb),
      planId: plan.id,
      uid: user.accountId,
    },
    mode: 'payment',
    payment_intent_data: {
      metadata: {
        additionalGb: String(plan.additionalGb),
        planId: plan.id,
        uid: user.accountId,
      },
    },
    success_url: `${origin}/dashboard/subscription?checkout=success`,
  });

  return NextResponse.json({ url: session.url });
}
