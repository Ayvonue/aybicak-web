export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Skeleton */}
            <div className="h-[85vh] bg-zinc-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mx-auto" />
                    <div className="h-12 w-80 bg-zinc-800 rounded animate-pulse mx-auto" />
                    <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse mx-auto" />
                    <div className="flex gap-4 justify-center pt-4">
                        <div className="h-12 w-40 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-12 w-36 bg-zinc-700 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Products Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-square bg-zinc-100 rounded-2xl animate-pulse" />
                            <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
