import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import Footer from "@/components/shared/Footer";
import { products } from "@/data/products";
import ProductMarquee from "@/components/shared/ProductMarquee";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  // Filter Logic
  const newArrivals = products.filter(p => p.isNew).slice(0, 15); // Top 15 new items
  // Featured: Shuffle or pick high value items. For now, let's pick a diverse set (e.g. Damascus or specific items)
  // Or simply slice the main list to avoid showing 300+ items at once.
  const featuredProducts = products.slice(0, 20);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-black">
      <Navbar />
      <Hero />

      {/* New Arrivals Section */}
      <section className="py-16 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Koleksiyona Yeni Eklenenler</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground font-sans tracking-tight">Yeni Gelenler</h2>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="hidden md:flex gap-2">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <ProductMarquee products={newArrivals} />

        <div className="flex justify-center mt-8 md:hidden">
          <Link href="/shop">
            <Button variant="outline" className="gap-2">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Divider / Visual Break */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Featured Products Section */}
      <section className="py-20 relative z-10 bg-[#0c0c0c]">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[url('/light-metal-bg.png')] opacity-5 mix-blend-overlay pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Sizin İçin Seçtiklerimiz</span>
          <h2 className="text-4xl font-bold text-white font-sans tracking-tight">Öne Çıkan Modeller</h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Usta ellerden çıkan, dayanıklılığı ve estetiği ile fark yaratan, en çok tercih edilen bıçak modellerimiz.
          </p>
        </div>

        <ProductMarquee products={featuredProducts} />

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200">
              Mağazayı Keşfet
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
