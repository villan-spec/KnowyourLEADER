"use client";

import { useState } from "react";
import Link from "next/link";
import { Vote, Menu, X } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-2xl border-b border-[var(--color-border-light)]/50">
            <div className="container-app">
                <div className="flex items-center justify-between h-12 sm:h-18 gap-2">
                    <Link href="/" className="flex flex-col group py-1 min-w-0" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors truncate">
                                Know Your Leader
                            </span>
                            <div className="h-1 w-1 rounded-full bg-[var(--color-accent-blue)] animate-pulse shrink-0" />
                        </div>
                        <span className="text-[7px] sm:text-[9px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-[0.05em] sm:tracking-[0.1em] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            Tamil Nadu 2026 Assembly Election
                        </span>
                    </Link>

                    {/* Desktop & Stats Navigation */}
                    <nav className="flex items-center gap-3 sm:gap-10 shrink-0">
                        <div className="hidden md:flex items-center gap-6 border-r border-[var(--color-border-light)] pr-10">
                            <Link
                                href="/"
                                className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                Districts
                            </Link>
                            <Link
                                href="/party"
                                className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                Party Audit
                            </Link>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[9px] sm:text-[10px] font-black text-[var(--color-text-primary)] leading-none">
                                234
                            </span>
                            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] leading-tight">
                                Constituencies
                            </span>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-background)] border-b border-[var(--color-border-light)] animate-fade-in shadow-xl">
                    <nav className="flex flex-col p-4 gap-4">
                        <Link
                            href="/"
                            className="text-xs font-bold uppercase tracking-widest p-2 hover:bg-black/5 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Districts
                        </Link>
                        <Link
                            href="/party"
                            className="text-xs font-bold uppercase tracking-widest p-2 hover:bg-black/5 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Party Audit
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
