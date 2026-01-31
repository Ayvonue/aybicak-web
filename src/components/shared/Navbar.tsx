"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/shop/CartDrawer";
import SearchModal from "@/components/shared/SearchModal";
import AuthModal from "@/components/shared/AuthModal";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const { state, dispatch } = useCart();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Koleksiyon", href: "/shop" },
        { name: "Özel Tasarım", href: "/custom" },
        { name: "Hakkımızda", href: "/about" },
        { name: "İletişim", href: "/contact" },
    ];

    return (
        <>
            <div className="titanium-sheen" /> {/* Global Lighting Effect */}
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out flex flex-col border-b",
                    isScrolled
                        ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl border-white/5"
                        : "bg-transparent border-transparent"
                )}
            >
                {/* Global Sales Banner */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-[#1c1c1c] border-b border-white/5 ${isScrolled ? "h-0 opacity-0 border-0" : "h-8 opacity-100"}`}>
                    <div className="h-full flex items-center justify-center relative group">
                        <div className="absolute inset-0 w-full h-full bg-white/5 skew-x-12 -translate-x-full group-hover:animate-shine transition-all duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[#E5E5E0] text-[10px] md:text-xs font-medium tracking-widest uppercase">
                            <span className="opacity-80">TÜM TÜRKİYE'YE ÜCRETSİZ KARGO</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600/50"></span>
                            <span className="text-yellow-500 font-bold">İSME ÖZEL HEDİYE LAZER BASKI</span>
                        </span>
                    </div>
                </div>
                {/* Main Navbar */}
                <div className={`w-full transition-all duration-500 ease-in-out ${isScrolled ? "py-3" : "py-5"}`}>
                    <div className="max-w-7xl mx-auto px-6 relative flex items-center justify-between bg-white/[0.15] backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg shadow-white/5 p-2">

                        {/* Left: Desktop Links */}
                        <div className="hidden md:flex items-center gap-8 pl-4 flex-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors relative group text-zinc-100 hover:text-white uppercase tracking-wider",
                                    )}
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-yellow-600 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* Center: Logo - Inside glassmorphism container */}
                        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]">
                            <div className="relative h-10 md:h-14 flex items-center justify-center">
                                <img
                                    src="/logo-embedded.png"
                                    alt="Ay Bıçak"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                        </Link>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
                            {user ? (
                                <div className="relative group/user">
                                    <button className="flex items-center gap-2 text-sm font-medium text-zinc-100 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                                            {user.name[0]}{user.surname[0]}
                                        </div>
                                        <span className="hidden lg:inline">{user.name}</span>
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full pt-4 opacity-0 group-hover/user:opacity-100 invisible group-hover/user:visible transition-all duration-200">
                                        <div className="bg-[#18181B] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
                                            <div className="p-3 border-b border-white/10">
                                                <p className="text-sm font-bold text-white">{user.name} {user.surname}</p>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                            <div className="p-1">
                                                <Link href="/account" className="block w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Hesabım</Link>
                                                <Link href="/account/orders" className="block w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Siparişlerim</Link>
                                                <div className="h-px bg-white/10 my-1" />
                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-bold text-white uppercase tracking-wider group bg-white/5 hover:bg-yellow-600 hover:border-yellow-600 transition-all duration-300 px-3 py-2 lg:px-4 lg:py-2 rounded-full border border-white/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:fill-white">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <span className="hidden lg:inline">Giriş / Üye Ol</span>
                                    <span className="lg:hidden">Giriş</span>
                                </button>
                            )}

                            <button
                                className="p-2 transition-colors text-zinc-100 hover:text-white hover:scale-110"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <Link href="/favorites" className="relative p-2 transition-colors group text-zinc-100 hover:text-white">
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse z-10 hidden group-hover:block" />
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hover:fill-red-500 hover:text-red-500 transition-all">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </Link>

                            <button
                                className="relative p-2 transition-colors group text-zinc-100 hover:text-white"
                                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                            >
                                <ShoppingBag className="w-5 h-5" />

                                {state.items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-600 text-white text-[10px] grid place-items-center rounded-full font-bold">
                                        {state.items.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Mobile Menu Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-full left-0 right-0 glass-panel bg-background/95 border-b border-border p-6 md:hidden flex flex-col gap-4 shadow-xl z-50"
                            >
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <Link
                                    href="/favorites"
                                    className="text-lg font-medium text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Favorilerim
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </Link>

                                {!user ? (
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }}
                                        className="text-lg font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2"
                                    >
                                        Giriş Yap / Üye Ol
                                    </button>
                                ) : (
                                    <div className="pt-4 border-t border-white/10 space-y-2">
                                        <p className="text-sm text-zinc-500 mb-2">Hoşgeldin, {user.name}</p>
                                        <Link href="/account" className="block text-lg font-medium text-zinc-300">Hesabım</Link>
                                        <Link href="/account/orders" className="block text-lg font-medium text-zinc-300">Siparişlerim</Link>
                                        <button onClick={logout} className="block text-lg font-medium text-red-400">Çıkış Yap</button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </nav>

            {/* Global Components */}
            < CartDrawer />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
