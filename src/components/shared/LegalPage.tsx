import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface LegalSection {
    title: string;
    content: React.ReactNode;
}

export default function LegalPage({ title, intro, sections }: {
    title: string;
    intro?: string;
    sections: LegalSection[];
}) {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{title}</h1>
                {intro && (
                    <p className="text-zinc-400 leading-relaxed mb-12 border-l-2 border-yellow-600 pl-4">
                        {intro}
                    </p>
                )}
                <div className="space-y-10">
                    {sections.map((section, idx) => (
                        <section key={idx} className="space-y-3">
                            <h2 className="text-xl font-bold text-white">{section.title}</h2>
                            <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
