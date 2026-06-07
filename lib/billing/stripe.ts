import 'server-only';

import Stripe from 'stripe';

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required.');
  }

  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);

  return stripe;
};
