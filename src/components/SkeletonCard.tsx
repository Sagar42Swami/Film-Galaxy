export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800/40 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/30 backdrop-blur-md">
      <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700 animate-pulse">
        {/* Rating badge skeleton */}
        <div className="absolute bottom-2 left-2 w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-md" />
      </div>
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse" />
        <div className="flex justify-between items-center">
          {/* Year skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
