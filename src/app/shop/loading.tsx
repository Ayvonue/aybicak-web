export default function ShopLoading() {
    return (
        <div className="min-h-screen bg-background pt-32">
            <div className="max-w-7xl mx-auto px-4 flex gap-8">
                {/* Sidebar Skeleton */}
                <div className="hidden md:block w-64 shrink-0 space-y-6">
                    <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-10 bg-zinc-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="flex-1">
                    <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="aspect-square bg-zinc-100 rounded-2xl animate-pulse" />
                                <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
