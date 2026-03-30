"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Globe } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function Header() {
    const pathname = usePathname();
    const [pulseOpen, setPulseOpen] = useState(false);
    const { lang, toggle, t } = useTranslation();

    const pulseActive = pathname.startsWith("/pulse");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/85 backdrop-blur-2xl border-b border-[var(--color-border-light)]/50">
            <div className="container-app py-3 sm:py-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:h-18 gap-3 sm:gap-6">

                    {/* Top Row (Mobile) / Left Side (Desktop): Logo & Stats */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <Link href="/" className="flex flex-col group py-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--color-text-primary)] group-hover:text-accent-blue transition-colors truncate">
                                    {t("Know Your Leader")}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-[var(--color-accent-blue)] animate-pulse shrink-0" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                {t("Tamil Nadu 2026 Assembly Election")}
                            </span>
                        </Link>
                        {/* Mobile Stats (Always visible top right on mobile, hidden on desktop here) */}
                        <div className="flex flex-col items-end sm:hidden shrink-0">
                            <span className="text-[10px] font-black leading-none">234</span>
                            <span className="text-[7px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] leading-tight">{t("Constituencies")}</span>
                        </div>
                    </div>

                    {/* Bottom Row (Mobile) / Right Side (Desktop): Navigation & Desktop Stats */}
                    <nav className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">

                        {/* Segmented Control Navigation */}
                        <div className="flex items-center bg-black/5 p-1 rounded-xl w-full sm:w-auto">
                            <Link
                                href="/"
                                className={`flex-1 sm:flex-none text-center px-3 py-2 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${pathname === "/"
                                    ? "bg-white text-[var(--color-accent-blue)] shadow-sm"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                            >
                                {t("Districts")}
                            </Link>
                            <Link
                                href="/party"
                                className={`flex-1 sm:flex-none text-center px-3 py-2 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${pathname.startsWith("/party")
                                    ? "bg-white text-[var(--color-accent-blue)] shadow-sm"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                            >
                                {t("Party Audit")}
                            </Link>
                            <div className="relative flex-1 sm:flex-none">
                                <button
                                    onClick={() => setPulseOpen(!pulseOpen)}
                                    className={`w-full sm:w-auto text-center px-3 py-2 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 ${pulseActive
                                        ? "bg-white text-[var(--color-accent-blue)] shadow-sm"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                        }`}
                                >
                                    <Zap size={10} strokeWidth={2.5} className="shrink-0" />
                                    {t("Pulse")}
                                </button>
                                {/* Dropdown */}
                                {pulseOpen && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--color-border-light)] overflow-hidden z-50 animate-fade-in">
                                        <Link
                                            href="/pulse/alliances"
                                            onClick={() => setPulseOpen(false)}
                                            className={`block px-4 py-3 text-xs font-semibold transition-colors ${pathname === "/pulse/alliances" ? "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]" : "text-[var(--color-text-secondary)] hover:bg-black/5"}`}
                                        >
                                            {t("Alliance Tracker")}
                                        </Link>
                                        <Link
                                            href="/pulse/battlegrounds"
                                            onClick={() => setPulseOpen(false)}
                                            className={`block px-4 py-3 text-xs font-semibold border-t border-[var(--color-border-light)] transition-colors ${pathname === "/pulse/battlegrounds" ? "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]" : "text-[var(--color-text-secondary)] hover:bg-black/5"}`}
                                        >
                                            {t("Key Battlegrounds")}
                                        </Link>
                                        <Link
                                            href="/pulse/manifestos"
                                            onClick={() => setPulseOpen(false)}
                                            className={`block px-4 py-3 text-xs font-semibold border-t border-[var(--color-border-light)] transition-colors ${pathname === "/pulse/manifestos" ? "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]" : "text-[var(--color-text-secondary)] hover:bg-black/5"}`}
                                        >
                                            {t("Manifesto Comparator")}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={toggle}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] shrink-0"
                            title={lang === "en" ? "Switch to Tanglish" : "Switch to English"}
                        >
                            <Globe size={12} strokeWidth={2} />
                            {lang === "en" ? "TA" : "EN"}
                        </button>

                        {/* Desktop Stats (Hidden on mobile) */}
                        <div className="hidden sm:flex flex-col items-end border-l border-[var(--color-border-light)] pl-6">
                            <span className="text-xs font-black leading-none">234</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-tertiary leading-tight mt-0.5">{t("Constituencies")}</span>
                        </div>
                    </nav>

                </div>
            </div>
        </header>
    );
}
