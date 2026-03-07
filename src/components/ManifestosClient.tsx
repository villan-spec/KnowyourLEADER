"use client";

import { useState, useMemo } from "react";
import { MANIFESTO_PROMISES, MANIFESTO_SECTORS, ManifestoPromise } from "@/lib/election-pulse-data";
import { ExternalLink, FileText, CheckCircle, Megaphone, FileCheck, Users, Briefcase, Sprout, Building, GraduationCap, HeartPulse, TrendingUp } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import type { LucideIcon } from "lucide-react";

const SECTOR_ICONS: Record<string, LucideIcon> = {
    "users": Users,
    "briefcase": Briefcase,
    "sprout": Sprout,
    "building": Building,
    "graduation-cap": GraduationCap,
    "heart-pulse": HeartPulse,
    "trending-up": TrendingUp,
};

const STATUS_LABELS: Record<ManifestoPromise["status"], { label: string; color: string; icon: typeof CheckCircle }> = {
    official_manifesto: { label: "Manifesto", color: "var(--color-accent-green)", icon: FileCheck },
    policy_announcement: { label: "Policy", color: "var(--color-accent-blue)", icon: CheckCircle },
    rally_promise: { label: "Rally Promise", color: "var(--color-accent-amber)", icon: Megaphone },
};

function PromiseCard({ promise, t }: { promise: ManifestoPromise; t: (key: string) => string }) {
    const status = STATUS_LABELS[promise.status];
    const StatusIcon = status.icon;

    return (
        <div className="card p-4 sm:p-5 relative overflow-hidden">
            {/* Party accent */}
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: promise.partyColor }} />

            <div className="flex items-start justify-between gap-2 mb-2 pt-0.5">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: promise.partyColor }}
                    >
                        {promise.partyId.substring(0, 2)}
                    </div>
                    <span className="text-xs font-bold truncate" style={{ color: promise.partyColor }}>
                        {promise.partyName}
                    </span>
                </div>
                <span
                    className="text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5"
                    style={{ background: `color-mix(in srgb, ${status.color} 12%, transparent)`, color: status.color }}
                >
                    <StatusIcon size={8} />
                    {t(status.label)}
                </span>
            </div>

            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-3">{promise.promise}</p>

            <div className="flex items-center justify-end">
                <a
                    href={promise.sourceUrl}
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

export default function ManifestosClient() {
    const [activeSector, setActiveSector] = useState<string>("all");
    const [activeParty, setActiveParty] = useState<string>("all");
    const { t } = useTranslation();

    const parties = useMemo(() => {
        const set = new Map<string, { id: string; name: string; color: string }>();
        MANIFESTO_PROMISES.forEach(p => {
            if (!set.has(p.partyId)) {
                set.set(p.partyId, { id: p.partyId, name: p.partyName, color: p.partyColor });
            }
        });
        return Array.from(set.values());
    }, []);

    const filtered = useMemo(() => {
        return MANIFESTO_PROMISES.filter(p => {
            if (activeSector !== "all" && p.sector !== activeSector) return false;
            if (activeParty !== "all" && p.partyId !== activeParty) return false;
            return true;
        });
    }, [activeSector, activeParty]);

    return (
        <div className="container-app py-10 sm:py-16">
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-light)] text-xs font-medium text-[var(--color-text-secondary)] mb-4">
                    <FileText size={12} strokeWidth={2.5} />
                    {t("Promise Tracker")}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    {t("Manifesto Comparator")}
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed px-2">
                    {t("Compare verified policy promises side-by-side across all major parties contesting the 2026 elections.")}
                </p>
            </div>

            {/* Sector Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 px-2">
                <button
                    onClick={() => setActiveSector("all")}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${activeSector === "all" ? "bg-[var(--color-accent-blue)] text-white shadow-sm" : "bg-black/5 text-[var(--color-text-secondary)] hover:bg-black/10"}`}
                >
                    {t("All Sectors")}
                </button>
                {MANIFESTO_SECTORS.map(s => {
                    const Icon = SECTOR_ICONS[s.icon];
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveSector(s.id)}
                            className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${activeSector === s.id ? "bg-[var(--color-accent-blue)] text-white shadow-sm" : "bg-black/5 text-[var(--color-text-secondary)] hover:bg-black/10"}`}
                        >
                            {Icon && <Icon size={11} strokeWidth={2} />} {t(s.label)}
                        </button>
                    );
                })}
            </div>

            {/* Party Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10 px-2">
                <button
                    onClick={() => setActiveParty("all")}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${activeParty === "all" ? "bg-[var(--color-text-primary)] text-white shadow-sm" : "bg-black/5 text-[var(--color-text-secondary)] hover:bg-black/10"}`}
                >
                    {t("All Parties")}
                </button>
                {parties.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActiveParty(p.id)}
                        className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${activeParty === p.id ? "text-white shadow-sm" : "bg-black/5 text-[var(--color-text-secondary)] hover:bg-black/10"}`}
                        style={activeParty === p.id ? { backgroundColor: p.color } : {}}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            {/* Promise Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <FileText size={40} strokeWidth={1.2} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                    <p className="text-sm text-[var(--color-text-secondary)]">{t("No promises found for this filter combination")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filtered.map((promise, index) => (
                        <div key={promise.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <PromiseCard promise={promise} t={t} />
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 sm:mt-12 max-w-lg mx-auto card-glass p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 text-center">{t("Status Legend")}</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {Object.entries(STATUS_LABELS).map(([key, val]) => {
                        const Icon = val.icon;
                        return (
                            <div key={key} className="flex items-center gap-1.5 text-[10px]">
                                <Icon size={10} style={{ color: val.color }} />
                                <span className="font-medium text-[var(--color-text-secondary)]">{t(val.label)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
                <p className="text-[10px] text-[var(--color-text-tertiary)] max-w-lg mx-auto leading-relaxed">
                    All promises are sourced from verified news reports and official party channels.
                    Click &quot;Source&quot; on each card to verify the original claim.
                </p>
            </div>
        </div>
    );
}
