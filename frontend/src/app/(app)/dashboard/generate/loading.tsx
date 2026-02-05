import { Skeleton } from '@/components/ui/Skeleton';

export default function GenerateLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Voice selector */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Text area */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Credits info */}
        <Skeleton className="h-16 w-full rounded-xl" />

        {/* Button */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Tips Card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
