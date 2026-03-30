import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ConstituencyListProps {
    constituencies: {
        id: string;
        name: string;
        nameTamil: string;
    }[];
    candidateCounts: Record<string, number>;
}

export default function ConstituencyList({ constituencies, candidateCounts }: ConstituencyListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {constituencies.map((c, i) => {
                const count = candidateCounts[c.id] || 0;
                return (
                    <Link key={c.id} href={`/constituency/${c.id}`} className="block">
                        <div
                            className="card p-4 cursor-pointer group animate-[slide-up_0.6s_ease-out_forwards] opacity-0"
                            style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[var(--color-accent-blue)] transition-colors">
                                        {c.name}
                                    </h4>
                                    <p className="text-tamil text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                                        {c.nameTamil}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                                        <span className="font-semibold text-[var(--color-text-primary)]">{count}</span> candidate{count !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-blue)] group-hover:translate-x-0.5 transition-all shrink-0"
                                    strokeWidth={2}
                                />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
