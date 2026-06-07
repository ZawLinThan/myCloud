export const BASE_STORAGE_BYTES = 1024 * 1024 * 1024;
export const BYTES_PER_GB = 1024 * 1024 * 1024;

export type StoragePlanId = 'storage_1gb' | 'storage_2gb';

export type StoragePlan = {
  id: StoragePlanId;
  additionalGb: number;
  description: string;
  name: string;
  priceCents: number;
};

export const storagePlans = [
  {
    id: 'storage_1gb',
    additionalGb: 1,
    description: 'Add 1 GB to your MyCloud storage limit.',
    name: 'Extra 1 GB',
    priceCents: 100,
  },
  {
    id: 'storage_2gb',
    additionalGb: 2,
    description: 'Add 2 GB to your MyCloud storage limit.',
    name: 'Extra 2 GB',
    priceCents: 150,
  },
] satisfies StoragePlan[];

export const getStoragePlan = (planId: string) =>
  storagePlans.find((plan) => plan.id === planId);

export const getStorageLimitBytes = (purchasedStorageGb = 0) =>
  BASE_STORAGE_BYTES + purchasedStorageGb * BYTES_PER_GB;

export const formatPrice = (priceCents: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(priceCents / 100);
