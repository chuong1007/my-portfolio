export default function BlogLoading() {
  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-[var(--bg-base)]">
      <div className="w-full pt-24 px-4 sm:px-8 max-w-4xl mx-auto pb-20">
        {/* Title Skeleton */}
        <div className="w-full flex flex-col items-center justify-center mb-12 gap-4">
          <div className="w-24 h-6 bg-[var(--bg-surface)] animate-pulse rounded-full"></div>
          <div className="w-full max-w-2xl h-12 md:h-16 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
          <div className="w-1/3 max-w-sm h-4 bg-[var(--bg-surface)] animate-pulse rounded-md"></div>
        </div>

        {/* Main Image Skeleton */}
        <div className="w-full aspect-video bg-[var(--bg-surface)] animate-pulse rounded-xl mb-12"></div>

        {/* Content Blocks Skeleton */}
        <div className="w-full flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full h-4 bg-[var(--bg-surface)] animate-pulse rounded-md" style={{ width: i % 3 === 0 ? '80%' : '100%' }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
