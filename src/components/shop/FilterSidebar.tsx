"use client";

import { FilterState } from "@/types";
import { Button } from "@/components/ui/Button";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
    filters: FilterState;
    updateFilter: (key: keyof FilterState, value: any) => void;
    clearFilters: () => void;
    steels: string[];
    handles: string[];
    categories: string[];
}

const STATIC_CATEGORIES = [
    "AV BIÇAĞI ÇEŞİTLERİ",
    "KAMP BIÇAKLARI",
    "KOMANDO BIÇAKLARI",
    "BUSHCRAFT BIÇAKLAR",
    "BALTA ÇEŞİTLERİ",
    "ÇAKI ÇEŞİTLERİ",
    "KILIÇ ÇEŞİTLERİ",
    "BIÇAK SETLERİ",
    "Altın İşlemeli Bıçaklar",
    "SATIR",
    "Ekmek Bıçakları",
    "Şef Bıçakları",
    "Kurban Bıçakları",
    "Döner Bıçağı",
    "Sebze & Meyve Bıçakları",
    "MASAT",
    "MİNYATÜRLER",
    "SALLAMA",
    "ZIRH ÇEŞİTLERİ"
];

export default function FilterSidebar({
    filters,
    updateFilter,
    clearFilters,
    steels,
    handles,
    categories,
}: FilterSidebarProps) {
    const toggleSelection = (key: "steel" | "handle" | "category", value: string) => {
        if (key === "category") {
            // Single select for Category
            const current = filters[key];
            const isSelected = current.includes(value);
            // If already selected, deselect it (empty array). If not, select ONLY this one.
            updateFilter(key, isSelected ? [] : [value]);
            return;
        }

        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        updateFilter(key, updated);
    };

    const hasActiveFilters = filters.minPrice > 0 || filters.maxPrice > 0 || filters.steel.length > 0 || filters.handle.length > 0 || filters.category.length > 0;

    return (
        <aside className="w-full md:w-72 space-y-8 sticky top-32">

            {/* Categories Section (Premium Glass Style) */}
            <div className="bg-white/[0.15] backdrop-blur-lg border border-white/10 shadow-lg shadow-white/5 rounded-2xl mb-6 overflow-hidden">
                <div className="bg-white/10 p-4 border-b border-white/10 backdrop-blur-sm">
                    <h3 className="text-zinc-100 font-bold text-xs tracking-widest uppercase font-sans flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        KATEGORİLER
                    </h3>
                </div>
                <div className="p-2 space-y-0.5">
                    {STATIC_CATEGORIES.map((cat) => {
                        const isSelected = filters.category.includes(cat);
                        return (
                            <div
                                key={cat}
                                onClick={() => toggleSelection("category", cat)}
                                className="group/item relative flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-200 isolate hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {/* Active State Pill */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 bg-yellow-600 rounded-lg shadow-lg shadow-yellow-600/30 z-[-1]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}

                                {/* Hover Effect (Premium White Glow) */}
                                {!isSelected && (
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/item:opacity-100 rounded-lg transition-all duration-200 z-[-1] group-hover/item:shadow-md group-hover/item:shadow-white/10" />
                                )}

                                <span className={cn(
                                    "text-sm font-medium font-sans transition-colors duration-200",
                                    isSelected ? "text-white font-semibold" : "text-zinc-300 group-hover/item:text-white"
                                )}>
                                    {cat}
                                </span>
                                {isSelected ? (
                                    <Check className="w-3.5 h-3.5 text-white/90" strokeWidth={3} />
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-white transition-all group-hover/item:translate-x-1" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Other Filters Section */}
            <div className="bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Filtreleme</h3>

                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className={`text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${hasActiveFilters
                            ? "text-red-400 hover:text-red-300 cursor-pointer"
                            : "text-zinc-600 cursor-not-allowed"
                            }`}
                    >
                        <X className="w-3 h-3" />
                        Temizle
                    </button>
                </div>

                {/* Price Range */}
                <div className="space-y-4 mb-8">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] pl-1">
                        Fiyat Aralığı (TL)
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="relative group flex-1">
                            <input
                                type="number"
                                value={filters.minPrice > 0 ? filters.minPrice : ""}
                                onChange={(e) => updateFilter("minPrice", Number(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-yellow-600/50 focus:bg-black/40 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Min"
                            />
                        </div>
                        <span className="text-zinc-600 font-light text-sm">-</span>
                        <div className="relative group flex-1">
                            <input
                                type="number"
                                value={filters.maxPrice < 100000 ? filters.maxPrice : ""}
                                onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-yellow-600/50 focus:bg-black/40 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </div>

                {/* Steel Types */}
                <FilterSection
                    title="Çelik Tipi"
                    items={steels}
                    selectedItems={filters.steel}
                    onToggle={(item) => toggleSelection("steel", item)}
                />

                {/* Handles */}
                <div className="pt-6 border-t border-white/5 mt-6">
                    <FilterSection
                        title="Sap Malzemesi"
                        items={handles}
                        selectedItems={filters.handle}
                        onToggle={(item) => toggleSelection("handle", item)}
                    />
                </div>
            </div>
        </aside >
    );
}

function FilterSection({
    title,
    items,
    selectedItems,
    onToggle
}: {
    title: string;
    items: string[];
    selectedItems: string[];
    onToggle: (item: string) => void;
}) {
    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] pl-1 font-sans">
                {title}
            </h4>
            <div className="space-y-1">
                {items.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg hover:bg-white/5 transition-all">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isSelected}
                                    onChange={() => onToggle(item)}
                                />
                                <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${isSelected
                                    ? "bg-yellow-600 border-yellow-600 shadow-[0_0_10px_rgba(202,138,4,0.3)]"
                                    : "bg-transparent border-zinc-700 group-hover:border-zinc-500"
                                    }`}>
                                    <Check className={`w-3 h-3 text-white transform transition-all duration-200 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} strokeWidth={3} />
                                </div>
                            </div>
                            <span className={`text-sm transition-colors duration-200 ${isSelected ? "text-white font-medium pl-1" : "text-zinc-400 group-hover:text-zinc-200"
                                }`}>
                                {item}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
