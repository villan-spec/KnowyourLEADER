import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";

interface DistrictCardProps {
    id: string;
    name: string;
    nameTamil: string;
    constituencyCount: number;
    candidateCount: number;
    index: number;
}

export default function DistrictCard({ id, name, nameTamil, constituencyCount, candidateCount, index }: DistrictCardProps) {
    return (
        <Link href={`/district/${id}`} className="block">
            <div
                className="card p-5 cursor-pointer group animate-[slide-up_0.6s_ease-out_forwards] opacity-0"
                style={{ animationDelay: `${Math.min(index * 50, 800)}ms` }}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-blue)]/6 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin size={16} className="text-[var(--color-accent-blue)]" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold group-hover:text-[var(--color-accent-blue)] transition-colors">
                                {name}
                            </h3>
                            <p className="text-tamil text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                {nameTamil}
                            </p>
                        </div>
                    </div>
                    <ChevronRight
                        size={16}
                        className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-blue)] group-hover:translate-x-0.5 transition-all mt-1"
                        strokeWidth={2}
                    />
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border-light)]">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                        <span className="font-semibold text-[var(--color-text-primary)]">{constituencyCount}</span> constituencies
                    </span>
                    {candidateCount > 0 && (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            <span className="font-semibold text-[var(--color-text-primary)]">{candidateCount}</span> candidates
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
