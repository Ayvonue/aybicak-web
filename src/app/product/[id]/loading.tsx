export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-background pt-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-zinc-100 rounded-3xl animate-pulse" />
                        <div className="flex gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="w-20 h-20 bg-zinc-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Details Skeleton */}
                    <div className="space-y-6">
                        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-10 w-3/4 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-zinc-100 rounded animate-pulse" />
                            <div className="h-4 w-4/6 bg-zinc-100 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <div className="h-14 flex-1 bg-zinc-200 rounded-full animate-pulse" />
                            <div className="h-14 w-14 bg-zinc-100 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
