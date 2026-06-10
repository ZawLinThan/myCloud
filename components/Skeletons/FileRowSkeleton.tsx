import { Skeleton } from '@mui/material';

// Skeleton version matching the file row layout
export const FileRowSkeleton = () => (
  <div className="flex min-w-0 max-w-full items-center justify-between gap-3 px-5 py-4">
    <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
      <Skeleton
        variant="rounded"
        width={40}
        height={40}
        sx={{ bgcolor: 'var(--surface-soft)', flexShrink: 0 }}
      />
      <div className="min-w-0 flex-1">
        <Skeleton
          variant="text"
          width="55%"
          height={18}
          sx={{ bgcolor: 'var(--surface-soft)' }}
        />
        <Skeleton
          variant="text"
          width="35%"
          height={14}
          sx={{ bgcolor: 'var(--surface-soft)' }}
        />
      </div>
    </div>
    <Skeleton
      variant="rounded"
      width={36}
      height={36}
      sx={{ bgcolor: 'var(--surface-soft)', flexShrink: 0 }}
    />
  </div>
);
