interface SectionSkeletonProps {
  variant?: "cards" | "block";
  count?: number;
}

export default function SectionSkeleton({ variant = "cards", count = 5 }: SectionSkeletonProps) {
  return (
    <div className="home-container" aria-busy="true" aria-label="Loading">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-ink-800" />

      {variant === "cards" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-card dark:bg-ink-800">
              <div className="aspect-[4/5] w-full animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
              <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              <div className="mx-auto h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-ink-800" />
      )}
    </div>
  );
}
