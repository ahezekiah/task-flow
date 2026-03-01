export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function TaskCardSkeleton() {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(4)].map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
