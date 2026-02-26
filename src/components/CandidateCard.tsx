import MetricRing from "./MetricRing";
import TrustBadge from "./TrustBadge";
import IssueTag from "./IssueTag";
import { User, AlertTriangle, ExternalLink } from "lucide-react";
import type { Candidate } from "@/lib/data";
import { formatAssets, getSourceUrl, getAssetsSourceUrl, getCriminalCasesSourceUrl, getIssuesSourceUrl } from "@/lib/data";

interface CandidateCardProps {
    candidate: Candidate;
    maxAssets: number;
    maxCases: number;
}

/** Map party colors that have poor contrast on white to readable alternatives */
function getReadablePartyColor(color: string): string {
    const lowContrast: Record<string, string> = {
        "#FFD700": "#B8860B", // PMK gold → dark goldenrod
        "#ffd700": "#B8860B",
    };
    return lowContrast[color] || color;
}

export default function CandidateCard({ candidate, maxAssets, maxCases }: CandidateCardProps) {
    const isOfficial = candidate.source === "official";
    const isPotential = candidate.source === "potential";
    const cardClass = (isOfficial || isPotential) ? "card" : "card-glass";
    const readableColor = getReadablePartyColor(candidate.partyColor);
    const sourceUrl = getSourceUrl(candidate);

    return (
        <div className={`${cardClass} relative overflow-hidden p-4 sm:p-6 flex flex-col gap-3 sm:gap-4`}>
            {/* Party accent strip */}
            <div className="party-accent" style={{ background: candidate.partyColor }} />

            {/* Header: Name + Party + Badge */}
            <div className="pt-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `${candidate.partyColor}12` }}
                        >
                            <User size={18} style={{ color: candidate.partyColor }} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-base font-semibold leading-tight break-words">
                                {candidate.name}
                            </h3>
                            <p className="text-tamil text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                {candidate.nameTamil}
                            </p>
                        </div>
                    </div>
                    <TrustBadge source={candidate.source} href={sourceUrl} />
                </div>
                <div className="flex items-center gap-2 ml-[50px]">
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{
                            background: `${candidate.partyColor}12`,
                            color: readableColor,
                        }}
                    >
                        {candidate.party}
                    </span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                        Age {candidate.age > 0 ? candidate.age : "--"}
                    </span>
                </div>
            </div>

            {/* Education */}
            {candidate.education && (
                <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <span className="font-medium text-[var(--color-text-tertiary)]">Education:</span>
                    {candidate.education}
                </div>
            )}

            {/* Metric Rings */}
            <div className="flex items-center justify-around py-3 border-t border-b border-[var(--color-border-light)] gap-2">
                <MetricRing
                    value={candidate.declaredAssets}
                    max={maxAssets}
                    label="Declared Assets"
                    displayValue={formatAssets(candidate.declaredAssets)}
                    color="var(--color-accent-blue)"
                    size={68}
                    href={candidate.assetsSourceUrl || candidate.sourceUrl || getAssetsSourceUrl(candidate)}
                />
                <MetricRing
                    value={candidate.pendingCriminalCases}
                    max={Math.max(maxCases, 1)}
                    label="Criminal Cases"
                    displayValue={String(candidate.pendingCriminalCases)}
                    color={candidate.pendingCriminalCases > 0 ? "var(--color-accent-red)" : "var(--color-accent-green)"}
                    size={68}
                    href={candidate.casesSourceUrl || candidate.sourceUrl || getCriminalCasesSourceUrl(candidate)}
                />
                <MetricRing
                    value={candidate.localIssues.length}
                    max={6}
                    label="Issues Tracked"
                    displayValue={String(candidate.localIssues.length)}
                    color="var(--color-accent-amber)"
                    size={68}
                    href={candidate.localIssues.length > 0 ? (candidate.sourceUrl || getIssuesSourceUrl(candidate)) : undefined}
                />
            </div>

            {/* Local Issues */}
            {candidate.localIssues.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">Local Issues Addressed</p>
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.localIssues.map((issue) => (
                            <IssueTag key={issue} issue={issue} />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-light)]">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                    Updated {candidate.lastUpdated}
                </span>
                <div className="flex items-center gap-3">
                    {candidate.pendingCriminalCases > 0 && (
                        <span className="text-xs text-[var(--color-accent-red)] flex items-center gap-1 font-medium">
                            <AlertTriangle size={12} strokeWidth={2.5} />
                            {candidate.pendingCriminalCases} case{candidate.pendingCriminalCases > 1 ? "s" : ""} pending
                        </span>
                    )}
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-accent-blue)] flex items-center gap-1 font-medium hover:opacity-80 transition-opacity"
                        style={{ textDecoration: "none" }}
                        title={isOfficial ? "View on MyNeta.info (ECI 2026)" : isPotential ? "View on MyNeta.info (2021 data)" : "Search news source"}
                    >
                        Source
                        <ExternalLink size={10} strokeWidth={2.5} />
                    </a>
                </div>
            </div>
        </div>
    );
}
