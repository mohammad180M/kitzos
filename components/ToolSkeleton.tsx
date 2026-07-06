export default function ToolSkeleton() {
  return (
    <div className="space-y-4 motion-reduce:animate-none" aria-hidden="true" aria-busy="true">
      <div className="h-32 animate-pulse rounded-lg bg-surface-2 motion-reduce:animate-none" />
      <div className="h-10 w-40 animate-pulse rounded-lg bg-surface-2 motion-reduce:animate-none" />
    </div>
  );
}
