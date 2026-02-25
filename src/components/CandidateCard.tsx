import MetricRing from "./MetricRing";
import TrustBadge from "./TrustBadge";
import IssueTag from "./IssueTag";
import { User, Scale, AlertTriangle } from "lucide-react";
import type { Candidate } from "@/lib/data";
import { formatAssets } from "@/lib/data";

interface CandidateCardProps {
    candidate: Candidate;
    maxAssets: number;
    maxCases: number;
}

export default function CandidateCard({ candidate, maxAssets, maxCases }: CandidateCardProps) {
    const isOfficial = candidate.source === "official";
    const cardClass = isOfficial ? "card" : "card-glass";

    return (
        <div className={`${cardClass} relative overflow-hidden p-6 flex flex-col gap-4`}>
            {/* Party accent strip */}
            <div className="party-accent" style={{ background: candidate.partyColor }} />

            {/* Header: Name + Party + Badge */}
            <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${candidate.partyColor}12` }}
                    >
                        <User size={20} style={{ color: candidate.partyColor }} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-tight truncate">
                            {candidate.name}
                        </h3>
                        <p className="text-tamil text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                            {candidate.nameTamil}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                style={{
                                    background: `${candidate.partyColor}12`,
                                    color: candidate.partyColor,
                                }}
                            >
                                {candidate.party}
                            </span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">
                                Age {candidate.age}
                            </span>
                        </div>
                    </div>
                </div>
                <TrustBadge source={candidate.source} />
            </div>

            {/* Education */}
            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <span className="font-medium text-[var(--color-text-tertiary)]">Education:</span>
                {candidate.education}
            </div>

            {/* Metric Rings */}
            <div className="flex items-center justify-around py-2 border-t border-b border-[var(--color-border-light)]">
                <MetricRing
                    value={candidate.declaredAssets}
                    max={maxAssets}
                    label="Declared Assets"
                    displayValue={formatAssets(candidate.declaredAssets)}
                    color="var(--color-accent-blue)"
                    size={76}
                />
                <MetricRing
                    value={candidate.pendingCriminalCases}
                    max={Math.max(maxCases, 1)}
                    label="Criminal Cases"
                    displayValue={String(candidate.pendingCriminalCases)}
                    color={candidate.pendingCriminalCases > 0 ? "var(--color-accent-red)" : "var(--color-accent-green)"}
                    size={76}
                />
                <MetricRing
                    value={candidate.localIssues.length}
                    max={6}
                    label="Issues Tracked"
                    displayValue={String(candidate.localIssues.length)}
                    color="var(--color-accent-amber)"
                    size={76}
                />
            </div>

            {/* Local Issues */}
            <div>
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">Local Issues Addressed</p>
                <div className="flex flex-wrap gap-1.5">
                    {candidate.localIssues.map((issue) => (
                        <IssueTag key={issue} issue={issue} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)]">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                    Updated {candidate.lastUpdated}
                </span>
                {candidate.pendingCriminalCases > 0 && (
                    <span className="text-xs text-[var(--color-accent-red)] flex items-center gap-1 font-medium">
                        <AlertTriangle size={12} strokeWidth={2.5} />
                        {candidate.pendingCriminalCases} case{candidate.pendingCriminalCases > 1 ? "s" : ""} pending
                    </span>
                )}
            </div>
        </div>
    );
}
