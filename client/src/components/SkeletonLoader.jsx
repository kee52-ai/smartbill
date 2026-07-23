// components/SkeletonLoader.jsx
export function ReceiptCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-4 flex gap-4">
      <div className="skeleton animate-shimmer w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton animate-shimmer h-4 w-2/3 rounded" />
        <div className="skeleton animate-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton animate-shimmer h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-5 space-y-3">
      <div className="skeleton animate-shimmer h-3 w-24 rounded" />
      <div className="skeleton animate-shimmer h-8 w-32 rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="skeleton animate-shimmer h-72 w-full rounded-2xl" />;
}
