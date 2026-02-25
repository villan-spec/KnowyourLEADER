import { ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--color-border-light)] mt-16">
            <div className="container-app py-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-[var(--color-text-tertiary)] max-w-lg leading-relaxed">
                            <strong className="text-[var(--color-text-secondary)]">Disclaimer:</strong> This platform is a non-partisan, open-source civic tool. Data is sourced from public news feeds and official Election Commission filings. We do not endorse any candidate or political party.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] shrink-0">
                        <ShieldCheck size={14} strokeWidth={2} />
                        <span>Open Source Civic Tech</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                        &copy; 2026 Know Your Leader. Built for citizens, by citizens.
                    </p>
                </div>
            </div>
        </footer>
    );
}
