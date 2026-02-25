import Link from "next/link";
import { Vote } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-xl border-b border-[var(--color-border-light)]">
            <div className="container-app">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-text-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Vote size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <span className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
                                Know Your Leader
                            </span>
                            <span className="block text-[10px] text-[var(--color-text-tertiary)] font-medium leading-none -mt-0.5">
                                Tamil Nadu 2026
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4 sm:gap-6">
                        <Link
                            href="/"
                            className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            Districts
                        </Link>
                        <span className="hidden sm:inline text-xs text-[var(--color-text-tertiary)]">
                            234 Constituencies
                        </span>
                    </nav>
                </div>
            </div>
        </header>
    );
}
