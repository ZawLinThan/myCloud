import { Skeleton } from '@mui/material';
import { FileRowSkeleton } from './FileRowSkeleton';

const DashboardSkeleton = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[248px_minmax(0,1fr)] items-start">
        {/* Sidebar skeleton */}
        <aside className="hidden sticky top-24 rounded-lg border border-app surface p-4 shadow-drop-1 lg:block">
          <Skeleton
            variant="rounded"
            height={60}
            sx={{ bgcolor: 'var(--surface-soft)' }}
          />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={40}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
            ))}
          </div>
          <Skeleton
            variant="rounded"
            height={120}
            className="mt-8"
            sx={{ bgcolor: 'var(--surface-soft)' }}
          />
          <Skeleton
            variant="rounded"
            height={48}
            className="mt-4"
            sx={{ bgcolor: 'var(--surface-soft)' }}
          />
        </aside>

        <section className="min-w-0">
          {/* Header skeleton */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Skeleton
                variant="text"
                width={160}
                height={16}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
              <Skeleton
                variant="text"
                width={280}
                height={40}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
            </div>
            <div className="flex gap-2">
              <Skeleton
                variant="rounded"
                width={240}
                height={40}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
              <Skeleton
                variant="rounded"
                width={100}
                height={40}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={100}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
            ))}
          </div>

          {/* File list skeleton */}
          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-lg border border-app surface shadow-drop-1">
              <div className="px-5 py-4 border-b border-app">
                <Skeleton
                  variant="text"
                  width={120}
                  height={20}
                  sx={{ bgcolor: 'var(--surface-soft)' }}
                />
                <Skeleton
                  variant="text"
                  width={200}
                  height={16}
                  sx={{ bgcolor: 'var(--surface-soft)' }}
                />
              </div>
              <div className="flex gap-2 px-5 py-3 border-b border-app">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={72}
                    height={36}
                    sx={{ bgcolor: 'var(--surface-soft)' }}
                  />
                ))}
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <FileRowSkeleton key={i} />
              ))}
            </div>

            <div className="rounded-lg border border-app surface p-5 shadow-drop-1">
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: 'var(--surface-soft)' }}
              />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <Skeleton
                        variant="text"
                        width={80}
                        height={16}
                        sx={{ bgcolor: 'var(--surface-soft)' }}
                      />
                      <Skeleton
                        variant="text"
                        width={20}
                        height={16}
                        sx={{ bgcolor: 'var(--surface-soft)' }}
                      />
                    </div>
                    <Skeleton
                      variant="rounded"
                      height={8}
                      sx={{ bgcolor: 'var(--surface-soft)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default DashboardSkeleton;
