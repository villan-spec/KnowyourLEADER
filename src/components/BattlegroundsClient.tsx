"use client";

import { BATTLEGROUNDS, Battleground } from "@/lib/election-pulse-data";
import { Target, ExternalLink, Shield, Swords } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

function BattlegroundCard({ bg, t }: { bg: Battleground; t: (key: string) => string }) {
    return (
        <div className="card p-5 sm:p-6 relative overflow-hidden">
            {/* Tag strip */}
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background: bg.tagColor }} />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold truncate">{bg.constituencyName}</h3>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold mt-0.5">
                        {bg.districtId} {t("Districts").slice(0, -1)}
                    </p>
                </div>
                <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
                    style={{ background: `${bg.tagColor}15`, color: bg.tagColor }}
                >
                    {bg.tag}
                </span>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">{bg.description}</p>

            {/* Key Contestants */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 flex items-center gap-1">
                    <Swords size={10} /> {t("Key Contestants")}
                </p>
                <div className="space-y-2">
                    {bg.keyContestants.map((c, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-black/[0.03] border border-[var(--color-border-light)]"
                        >
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: c.partyColor }}
                            >
                                {c.party.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold truncate">{c.name}</p>
                                <p className="text-[10px] text-[var(--color-text-tertiary)]">{c.party}</p>
                            </div>
                            {c.isIncumbent && (
                                <span className="text-[8px] font-bold text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                                    <Shield size={8} /> {t("Incumbent")}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2021 Margin */}
            {bg.margin2021 && (
                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-3 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">{t("2021 Margin")}</span>
                    <span className="font-semibold">{bg.margin2021.toLocaleString("en-IN")} {t("votes")}</span>
                </div>
            )}

            {/* Source */}
            <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-end">
                <a
                    href={bg.sourceUrl}
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

export default function BattlegroundsClient() {
    const { t } = useTranslation();

    return (
        <div className="container-app py-10 sm:py-16">
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-light)] text-xs font-medium text-[var(--color-text-secondary)] mb-4">
                    <Target size={12} strokeWidth={2.5} />
                    {t("Hot Seats")}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    {t("Key Battlegrounds")}
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed px-2">
                    {t("The most-watched constituencies in the 2026 election — featuring CM matchups, TVK debuts, and margin thrillers.")}
                </p>
            </div>

            {/* Summary */}
            <div className="max-w-md mx-auto mb-8 sm:mb-10 p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-light)] flex items-center justify-between">
                <div className="flex flex-col items-center justify-center w-1/2 border-r border-[var(--color-border-light)]">
                    <span className="text-3xl font-bold text-[var(--color-accent-red)]">{BATTLEGROUNDS.length}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)] font-medium mt-1">{t("Hot Seats")}</span>
                </div>
                <div className="flex flex-col items-center justify-center w-1/2">
                    <span className="text-3xl font-bold text-[var(--color-accent-blue)]">
                        {new Set(BATTLEGROUNDS.map(b => b.districtId)).size}
                    </span>
                    <span className="text-xs text-[var(--color-text-tertiary)] font-medium mt-1">{t("Districts")}</span>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BATTLEGROUNDS.map((bg, index) => (
                    <div key={bg.constituencyId} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                        <BattlegroundCard bg={bg} t={t} />
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 sm:mt-12 text-center">
                <p className="text-[10px] text-[var(--color-text-tertiary)] max-w-lg mx-auto leading-relaxed">
                    Candidate listings for these battleground seats are based on news reports and may change once final nominations are filed.
                </p>
            </div>
        </div>
    );
}
