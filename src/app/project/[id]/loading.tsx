export default function ProjectLoading() {
  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-[var(--bg-base)]">
      <div className="w-full pt-24 px-4 sm:px-8 max-w-7xl mx-auto pb-20">
        {/* Title Skeleton */}
        <div className="w-full flex flex-col items-center justify-center mb-16 gap-4">
          <div className="w-3/4 max-w-2xl h-12 md:h-16 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
          <div className="w-1/2 max-w-md h-6 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
        </div>

        {/* Main Image Skeleton */}
        <div className="w-full aspect-[16/9] bg-[var(--bg-surface)] animate-pulse rounded-xl mb-16"></div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-1/3 h-4 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
              <div className="w-2/3 h-6 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
            </div>
          ))}
        </div>

        {/* Content Blocks Skeleton */}
        <div className="w-full flex flex-col gap-8 mb-16">
          <div className="w-full h-4 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
          <div className="w-full h-4 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
          <div className="w-3/4 h-4 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
        </div>
        
        {/* Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full aspect-square bg-[var(--bg-surface)] animate-pulse rounded-xl"></div>
          <div className="w-full aspect-square bg-[var(--bg-surface)] animate-pulse rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
