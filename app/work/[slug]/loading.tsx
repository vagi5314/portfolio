export default function Loading() {
  return (
    <main className="relative min-h-screen bg-bone text-ink">
      <div className="mx-auto w-full max-w-[1400px] px-6 pt-32 md:pt-40">
        <div className="mb-8 h-3 w-32 animate-pulse rounded-full bg-ink/10" />
        <div className="mb-12 h-3 w-48 animate-pulse rounded-full bg-ink/10" />
        <div className="aspect-[16/8] w-full animate-pulse rounded-sm bg-ink/10 md:aspect-[16/7]" />
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-ink/10" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-ink/10" />
          </div>
          <div className="md:col-span-7 space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-ink/10" />
            <div className="h-8 w-full animate-pulse rounded-full bg-ink/10" />
            <div className="h-8 w-3/4 animate-pulse rounded-full bg-ink/10" />
          </div>
        </div>
      </div>
    </main>
  );
}