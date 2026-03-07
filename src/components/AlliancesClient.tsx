"use client";

import { ALLIANCES, Alliance } from "@/lib/election-pulse-data";
import { ExternalLink, Users, TrendingUp } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

function AllianceCard({ alliance, t }: { alliance: Alliance; t: (key: string) => string }) {
    const totalSeats = alliance.members.reduce((sum, m) => sum + m.seatsContesting, 0);

    return (
        <div className="card p-5 sm:p-6 relative overflow-hidden">
            {/* Accent */}
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background: alliance.color }} />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 pt-1">
                <div>
                    <h3 className="text-base sm:text-lg font-bold">{alliance.shortName}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{alliance.name}</p>
                </div>
                <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${alliance.color}15`, color: alliance.color }}
                >
                    {totalSeats} {t("seats")}
                </span>
            </div>

            {/* CM Candidate */}
            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-black/[0.03] border border-[var(--color-border-light)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${alliance.color}15` }}>
                    <Users size={14} style={{ color: alliance.color }} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">{t("CM Candidate")}</p>
                    <p className="text-sm font-semibold truncate">{alliance.cmCandidate}</p>
                </div>
            </div>

            {/* Projected Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="text-center p-2.5 rounded-xl bg-black/[0.03]">
                    <p className="text-lg sm:text-xl font-bold" style={{ color: alliance.color }}>{alliance.projectedVoteShare}%</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mt-0.5">{t("Vote Share")}</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-black/[0.03]">
                    <p className="text-lg sm:text-xl font-bold" style={{ color: alliance.color }}>{alliance.projectedSeats}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mt-0.5">{t("Proj. Seats")}</p>
                </div>
            </div>

            {/* Seat Share Bar */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">{t("Seat Distribution")}</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-black/5">
                    {alliance.members.map(m => (
                        <div
                            key={m.partyId}
                            className="h-full transition-all duration-700 relative group"
                            style={{
                                width: `${(m.seatsContesting / totalSeats) * 100}%`,
                                backgroundColor: m.color,
                                minWidth: m.seatsContesting > 0 ? "4px" : "0"
                            }}
                            title={`${m.partyName}: ${m.seatsContesting} ${t("seats")}`}
                        />
                    ))}
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-1.5">
                {alliance.members.map(m => (
                    <div key={m.partyId} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                            <span className="font-medium truncate">{m.partyName}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-[var(--color-text-secondary)]">{m.seatsContesting}</span>
                            {m.seatShareConfirmed ? (
                                <span className="text-[8px] font-bold text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10 px-1.5 py-0.5 rounded">✓</span>
                            ) : (
                                <span className="text-[8px] font-bold text-[var(--color-accent-amber)] bg-[var(--color-accent-amber)]/10 px-1.5 py-0.5 rounded">?</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Source */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">Poll: {alliance.pollSource}</span>
                <a
                    href={alliance.pollSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[var(--color-accent-blue)] flex items-center gap-1 font-medium hover:opacity-80"
                >
                    {t("Source")} <ExternalLink size={8} />
                </a>
            </div>
        </div>
    );
}

export default function AlliancesClient() {
    const totalSeatsAll = 234;
    const { t } = useTranslation();

    return (
        <div className="container-app py-10 sm:py-16">
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-light)] text-xs font-medium text-[var(--color-text-secondary)] mb-4">
                    <TrendingUp size={12} strokeWidth={2.5} />
                    {t("Coalition Tracker")}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    {t("Alliance Matrix")}
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed px-2">
                    {t("Track coalition structures, seat-sharing agreements, and projected outcomes for the 2026 Tamil Nadu Assembly Elections.")}
                </p>
            </div>

            {/* Overall Seat Projection Bar */}
            <div className="max-w-2xl mx-auto mb-8 sm:mb-12 card-glass p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 text-center">{t("Projected Seat Distribution (234 Total)")}</p>
                <div className="flex h-6 rounded-full overflow-hidden bg-black/5 mb-3">
                    {ALLIANCES.map(a => (
                        <div
                            key={a.id}
                            className="h-full transition-all duration-1000 flex items-center justify-center"
                            style={{
                                width: `${(a.projectedSeats / totalSeatsAll) * 100}%`,
                                backgroundColor: a.color,
                                minWidth: "16px"
                            }}
                        >
                            <span className="text-[8px] font-bold text-white drop-shadow-sm">{a.projectedSeats}</span>
                        </div>
                    ))}
                    {(() => {
                        const allocated = ALLIANCES.reduce((s, a) => s + a.projectedSeats, 0);
                        const remaining = totalSeatsAll - allocated;
                        if (remaining <= 0) return null;
                        return (
                            <div
                                className="h-full flex items-center justify-center bg-gray-300"
                                style={{ width: `${(remaining / totalSeatsAll) * 100}%` }}
                            >
                                <span className="text-[8px] font-bold text-white">{remaining}</span>
                            </div>
                        );
                    })()}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    {ALLIANCES.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 text-[10px]">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                            <span className="font-medium text-[var(--color-text-secondary)]">{a.shortName}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alliance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ALLIANCES.map((alliance, index) => (
                    <div key={alliance.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <AllianceCard alliance={alliance} t={t} />
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 sm:mt-12 text-center">
                <p className="text-[10px] text-[var(--color-text-tertiary)] max-w-lg mx-auto leading-relaxed">
                    Seat projections are based on publicly available opinion poll data and are subject to change.
                    Seat-sharing numbers reflect confirmed agreements as of March 2026.
                </p>
            </div>
        </div>
    );
}
