import CandidateCard from "./CandidateCard";
import type { Candidate } from "@/lib/data";
import { Users, Scale } from "lucide-react";

interface ComparisonViewProps {
    candidates: Candidate[];
    constituencyName: string;
    constituencyNameTamil: string;
}

export default function ComparisonView({ candidates, constituencyName, constituencyNameTamil }: ComparisonViewProps) {
    if (candidates.length === 0) {
        return (
            <div className="card p-8 sm:p-12 text-center">
                <Users size={48} strokeWidth={1.2} className="mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                <h3 className="text-lg font-semibold text-[var(--color-text-secondary)]">No Candidates Yet</h3>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-2 max-w-md mx-auto">
                    Candidate data for this constituency hasn&apos;t been sourced yet. Check back as our automation pipeline discovers new data from official filings and news sources.
                </p>
            </div>
        );
    }

    // Calculate max values for synchronized scales across all candidates
    const maxAssets = Math.max(...candidates.map((c) => c.declaredAssets));
    const maxCases = Math.max(...candidates.map((c) => c.pendingCriminalCases));

    const officialCount = candidates.filter((c) => c.source === "official").length;
    const newsCount = candidates.filter((c) => c.source === "news").length;

    return (
        <div>
            {/* Comparison header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-blue)]/8 flex items-center justify-center shrink-0">
                        <Scale size={20} className="text-[var(--color-accent-blue)]" strokeWidth={1.8} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold">{constituencyName}</h2>
                        <p className="text-tamil text-sm text-[var(--color-text-tertiary)]">{constituencyNameTamil}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-13 sm:ml-0">
                    {officialCount > 0 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-accent-green)]/8 text-[var(--color-accent-green)] font-semibold">
                            {officialCount} Official
                        </span>
                    )}
                    {newsCount > 0 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-accent-amber)]/8 text-[var(--color-accent-amber)] font-semibold">
                            {newsCount} News-Sourced
                        </span>
                    )}
                </div>
            </div>

            {/* Scale legend */}
            <div className="card p-3 mb-4 flex items-center justify-center gap-6 text-xs text-[var(--color-text-tertiary)] text-center">
                <span>Metric rings are normalized to the same scale for fair comparison</span>
            </div>

            {/* Candidate cards grid */}
            <div
                className={`grid gap-4 sm:gap-5 ${candidates.length === 1
                    ? "grid-cols-1 max-w-md"
                    : candidates.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
            >
                {candidates.map((candidate, index) => (
                    <div
                        key={candidate.id}
                        className="animate-[slide-up_0.6s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <CandidateCard
                            candidate={candidate}
                            maxAssets={maxAssets}
                            maxCases={maxCases}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
