import CandidateCard from "./CandidateCard";
import type { Candidate } from "@/lib/data";
import { PARTY_NAMES, ALLOWED_PARTIES } from "@/lib/data";
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
    const maxAssets = Math.max(0, ...candidates.map((c) => c.declaredAssets));
    const maxCases = Math.max(0, ...candidates.map((c) => c.pendingCriminalCases));

    const officialCount = candidates.filter((c) => c.source === "official").length;
    const potentialCount = candidates.filter((c) => c.source === "potential").length;
    const newsCount = candidates.filter((c) => c.source === "news").length;

    // Generate TBA candidates for major parties that are missing
    const existingParties = new Set(candidates.map((c) => c.party));

    // Some basic colors for missing parties in case they aren't in data.ts yet (TVK is already there but just to be safe)
    const PARTY_COLORS_FALLBACK: Record<string, string> = {
        "DMK": "#E31E24",
        "AIADMK": "#006B3F",
        "BJP": "#FF6B00",
        "INC": "#19AAED",
        "NTK": "#8B0000",
        "MNM": "#B91C1C",
        "PMK": "#FFD700",
        "VCK": "#1D4ED8",
        "DMDK": "#FDE047",
        "CPI": "#DC2626",
        "CPM": "#DC2626",
        "AMMK": "#064E3B",
    };

    const missingCandidates: Candidate[] = ALLOWED_PARTIES.filter(p => !existingParties.has(p)).map(party => ({
        id: `tba-${party}-${constituencyName.toLowerCase().replace(/\s+/g, '-')}`,
        name: "Yet to be announced",
        nameTamil: "அறிவிக்கப்படவில்லை",
        party: party,
        partyColor: PARTY_COLORS_FALLBACK[party] || "#888888",
        constituencyId: "",
        districtId: "",
        photo: null,
        source: "potential", // Consistent with empty data fallback
        declaredAssets: 0,
        pendingCriminalCases: 0,
        localIssues: [],
        education: "",
        age: 0,
        lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    const displayCandidates = [...candidates, ...missingCandidates].sort((a, b) => {
        const aIsTba = a.id.startsWith("tba-");
        const bIsTba = b.id.startsWith("tba-");
        if (aIsTba && !bIsTba) return 1;
        if (!aIsTba && bIsTba) return -1;

        const order = { "official": 1, "potential": 2, "news": 3 };
        const scoreA = (order as any)[a.source] || 99;
        const scoreB = (order as any)[b.source] || 99;
        if (scoreA !== scoreB) return scoreA - scoreB;

        // Secondary sort: Try to group by alliance or party size if needed, but alphabetical is fine for equals
        return a.party.localeCompare(b.party);
    });

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
                    {potentialCount > 0 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-accent-amber)]/8 text-[var(--color-accent-amber)] font-semibold">
                            {potentialCount} Potential
                        </span>
                    )}
                    {newsCount > 0 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-accent-blue)]/8 text-[var(--color-accent-blue)] font-semibold">
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
                className={`grid gap-4 sm:gap-5 ${displayCandidates.length === 1
                    ? "grid-cols-1 max-w-md"
                    : displayCandidates.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
            >
                {displayCandidates.map((candidate, index) => (
                    <div
                        key={candidate.id}
                        className="animate-[slide-up_0.6s_ease-out_forwards] opacity-0"
                        style={{ animationDelay: `${index * 50}ms` }}
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
