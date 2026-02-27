"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/85 backdrop-blur-2xl border-b border-[var(--color-border-light)]/50">
            <div className="container-app py-3 sm:py-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:h-18 gap-3 sm:gap-6">

                    {/* Top Row (Mobile) / Left Side (Desktop): Logo & Stats */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <Link href="/" className="flex flex-col group py-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--color-text-primary)] group-hover:text-accent-blue transition-colors truncate">
                                    Know Your Leader
                                </span>
                                <div className="h-1 w-1 rounded-full bg-accent-blue animate-pulse shrink-0" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-tertiary font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                Tamil Nadu 2026 Assembly Election
                            </span>
                        </Link>

                        {/* Mobile Stats (Always visible top right on mobile, hidden on desktop here) */}
                        <div className="flex flex-col items-end sm:hidden shrink-0">
                            <span className="text-[10px] font-black leading-none">234</span>
                            <span className="text-[7px] font-bold uppercase tracking-wider text-tertiary leading-tight">Constituencies</span>
                        </div>
                    </div>

                    {/* Bottom Row (Mobile) / Right Side (Desktop): Navigation & Desktop Stats */}
                    <nav className="flex items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto">

                        {/* Segmented Control Navigation */}
                        <div className="flex items-center bg-black/5 p-1 rounded-xl w-full sm:w-auto">
                            <Link
                                href="/"
                                className={`flex-1 sm:flex-none text-center px-4 py-2 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${pathname === "/"
                                        ? "bg-white text-accent-blue shadow-sm"
                                        : "text-secondary hover:text-primary"
                                    }`}
                            >
                                Districts
                            </Link>
                            <Link
                                href="/party"
                                className={`flex-1 sm:flex-none text-center px-4 py-2 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${pathname.startsWith("/party")
                                        ? "bg-white text-accent-blue shadow-sm"
                                        : "text-secondary hover:text-primary"
                                    }`}
                            >
                                Party Audit
                            </Link>
                        </div>

                        {/* Desktop Stats (Hidden on mobile) */}
                        <div className="hidden sm:flex flex-col items-end border-l border-[var(--color-border-light)] pl-8">
                            <span className="text-xs font-black leading-none">234</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-tertiary leading-tight mt-0.5">Constituencies</span>
                        </div>
                    </nav>

                </div>
            </div>
        </header>
    );
}
