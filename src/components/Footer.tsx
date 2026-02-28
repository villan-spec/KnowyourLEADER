import { ShieldCheck, ExternalLink } from "lucide-react";
import { DATA_SOURCES } from "@/lib/data";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--color-border-light)] mt-16">
            <div className="container-app py-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="w-full">
                        <p className="text-xs text-[var(--color-text-tertiary)] w-full leading-relaxed block">
                            <strong className="text-[var(--color-text-secondary)]">Disclaimer:</strong> The information provided on this page about the current and previous elections in the constituency is sourced from various publicly available platforms including https://old.eci.gov.in/statistical-report/statistical-reports/ and https://affidavit.eci.gov.in/. The ECI is the authoritative source for election-related data in India, and we rely on their official records for the content presented here. However, due to the complexity of electoral processes and potential data discrepancies, there may be occasional inaccuracies or omissions in the information provided.
                        </p>
                    </div>
                </div>

                {/* Source Links */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                    <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">Data Sources:</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {DATA_SOURCES.map((source, i) => (
                            <span key={source.name} className="inline-flex items-center gap-1">
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[var(--color-accent-blue)] hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
                                    style={{ textDecoration: "none" }}
                                    title={source.description}
                                >
                                    {source.name}
                                    <ExternalLink size={8} strokeWidth={2.5} className="opacity-50" />
                                </a>
                                {i < DATA_SOURCES.length - 1 && (
                                    <span className="text-[var(--color-border)] ml-1">·</span>
                                )}
                            </span>
                        ))}
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
