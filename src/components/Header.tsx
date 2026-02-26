import Link from "next/link";
import { Vote } from "lucide-react";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/70 backdrop-blur-2xl border-b border-[var(--color-border-light)]/50">
            <div className="container-app">
                <div className="flex items-center justify-between h-14 sm:h-18">
                    <Link href="/" className="flex flex-col group py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors">
                                Know Your Leader
                            </span>
                            <div className="h-1 w-1 rounded-full bg-[var(--color-accent-blue)] animate-pulse" />
                        </div>
                        <span className="text-[9px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-[0.1em] mt-0.5">
                            Tamil Nadu 2026 Assembly Election
                        </span>
                    </Link>

                    <nav className="flex items-center gap-6 sm:gap-10">
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
                            <span className="text-[10px] font-black text-[var(--color-text-primary)]">
                                234
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                                Constituencies
                            </span>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
