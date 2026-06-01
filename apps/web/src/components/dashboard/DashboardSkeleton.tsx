const Box = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton rounded-[var(--radius-card)] ${className}`} />
);

/** Loading state shaped like the real report so layout does not jump. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <Box className="h-[200px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Box className="h-[92px]" />
        <Box className="h-[92px]" />
        <Box className="h-[92px]" />
        <Box className="h-[92px]" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Box className="h-[260px]" />
        <Box className="h-[260px]" />
      </div>
      <Box className="h-[320px]" />
    </div>
  );
}
