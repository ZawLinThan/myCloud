'use client';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  formatPrice,
  storagePlans,
  type StoragePlanId,
} from '@/lib/billing/storage-plans';
import type { CurrentUser } from '@/lib/types/types';

const formatBytes = (bytes = 0) => {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
};

export default function SubscriptionClient({
  checkoutStatus,
  user,
}: {
  checkoutStatus?: string;
  user: CurrentUser;
}) {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<StoragePlanId | null>(
    null
  );

  const handleCheckout = async (planId: StoragePlanId) => {
    setLoadingPlanId(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        body: JSON.stringify({ planId }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const data = (await response.json()) as {
        message?: string;
        url?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.message || 'Unable to start checkout.');
      }

      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to start checkout.'
      );
      setLoadingPlanId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Storage add-ons</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app sm:text-4xl">
              Buy more room for your files.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Extra storage is added to your account after Stripe confirms
              payment. Your current allowance is{' '}
              <span className="font-semibold text-app">
                {formatBytes(user.storageLimitBytes)}
              </span>
              .
            </p>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-app surface px-4 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-app"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>

        {checkoutStatus === 'success' && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            Payment received. Stripe is updating your storage; refresh the
            dashboard in a moment if the new limit is not visible yet.
          </div>
        )}

        {checkoutStatus === 'cancelled' && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Checkout was cancelled. No charge was made.
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            {storagePlans.map((plan) => {
              const isLoading = loadingPlanId === plan.id;

              return (
                <article
                  className="flex flex-col rounded-lg border border-app surface p-6 shadow-drop-1"
                  key={plan.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
                      <StorageOutlinedIcon />
                    </span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-accent">
                      +{plan.additionalGb} GB
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-app">
                    {plan.name}
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
                    {plan.description}
                  </p>
                  <p className="mt-6 text-4xl font-semibold tracking-tight text-app">
                    {formatPrice(plan.priceCents)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">
                    One-time purchase
                  </p>

                  <button
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    disabled={loadingPlanId !== null}
                    onClick={() => void handleCheckout(plan.id)}
                    type="button"
                  >
                    {isLoading ? 'Opening Stripe…' : 'Purchase with Stripe'}
                  </button>
                </article>
              );
            })}
          </div>

          <aside className="rounded-lg border border-app surface p-6 shadow-drop-1">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
              <CloudUploadOutlinedIcon />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-app">
              Your storage
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Current limit</span>
                <span className="font-semibold text-app">
                  {formatBytes(user.storageLimitBytes)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Purchased add-ons</span>
                <span className="font-semibold text-app">
                  {user.purchasedStorageGb} GB
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-[var(--surface-soft)] p-4">
              <p className="flex items-start gap-2 text-sm font-medium leading-6 text-app">
                <CheckCircleOutlineRoundedIcon
                  className="mt-0.5 text-accent"
                  fontSize="small"
                />
                Webhooks apply storage automatically and safely ignore duplicate
                Stripe events.
              </p>
            </div>

            <button
              className="mt-4 text-sm font-semibold text-accent"
              onClick={() => router.refresh()}
              type="button"
            >
              Refresh storage limit
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
