"use client";

import { Candidate, formatAssets, getSourceUrl, PARTY_NAMES } from "@/lib/data";
import { User, ShieldAlert, Zap, TrendingDown, ExternalLink, RefreshCw, Laugh, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FunnyCandidateViewProps {
    candidate: Candidate;
}

export default function FunnyCandidateView({ candidate }: FunnyCandidateViewProps) {
    const router = useRouter();
    const displayParty = PARTY_NAMES[candidate.party] || candidate.party;

    // Generate humorous "Suspicions" or "Observations"
    const observations = [];
    
    if (candidate.declaredAssets > 100000000) {
        observations.push("Suspected of owning a small island or a gold-plated dosa pan.");
    } else if (candidate.declaredAssets < 5000) {
        observations.push("Financial minimalist. Probably borrows a pen at the ECI office.");
    }

    if (candidate.pendingCriminalCases > 10) {
        observations.push("Holds more frequent court dates than family dinners.");
    } else if (candidate.pendingCriminalCases > 0) {
        observations.push("A minor fan of the judicial system.");
    } else {
        observations.push("Shockingly clean record. Possibly suspicious level of law-abiding.");
    }

    const education = candidate.education.toLowerCase();
    if (education.includes("graduate") || education.includes("degree")) {
        observations.push("Confirmed over-educated. Might use big words like 'accountability'.");
    } else {
        observations.push("Self-taught genius. Life is their university (and voters are the final exam).");
    }

    return (
        <div className="container-app py-10 sm:py-20 animate-fade-in">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-blue)] mb-8 transition-colors"
            >
                <ArrowLeft size={16} /> GO BACK
            </button>

            <div className="max-w-3xl mx-auto relative">
                {/* Humorous Badge */}
                <div className="absolute -top-6 -right-6 rotate-12 z-20 bg-[var(--color-accent-blue)] text-white px-4 py-2 rounded-xl font-black shadow-xl border-4 border-white flex items-center gap-2">
                    <Laugh size={24} /> 100% RANDOM
                </div>

                <div className="card shadow-2xl border-4 border-[var(--color-border-light)] overflow-hidden">
                    {/* Header Splash */}
                    <div className="h-4 sm:h-6" style={{ backgroundColor: candidate.partyColor }} />
                    
                    <div className="p-8 sm:p-12 text-center">
                        <div 
                            className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-[var(--color-border-light)] shadow-inner"
                            style={{ background: `${candidate.partyColor}10` }}
                        >
                            <User size={64} style={{ color: candidate.partyColor }} strokeWidth={1} />
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-tight">
                            {candidate.name}
                        </h1>
                        <p className="text-tamil text-xl text-[var(--color-text-tertiary)] mb-6">
                            {candidate.nameTamil}
                        </p>

                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-black/5 text-sm font-bold border border-[var(--color-border-light)] mb-10">
                            Representing: <span className="ml-2" style={{ color: candidate.partyColor }}>{displayParty}</span>
                        </div>

                        {/* The "Profile" grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-12">
                            <div className="card-glass p-6 border-l-4 border-[var(--color-accent-blue)]">
                                <h3 className="text-xs font-black tracking-widest text-[var(--color-text-tertiary)] uppercase mb-4 flex items-center gap-2">
                                    <Zap size={14} className="text-[var(--color-accent-blue)]" /> POWER RANKING
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Wealth Level</p>
                                        <p className="text-xl font-bold">{formatAssets(candidate.declaredAssets)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Legal Stance</p>
                                        <p className="text-xl font-bold">{candidate.pendingCriminalCases} Cases Pending</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-glass p-6 border-l-4 border-[var(--color-accent-amber)]">
                                <h3 className="text-xs font-black tracking-widest text-[var(--color-text-tertiary)] uppercase mb-4 flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-[var(--color-accent-amber)]" /> THE VERDICT
                                </h3>
                                <ul className="space-y-3">
                                    {observations.map((obs, i) => (
                                        <li key={i} className="text-sm font-medium leading-relaxed flex gap-2">
                                            <span className="text-[var(--color-accent-amber)]">•</span>
                                            {obs}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href={`/constituency/${candidate.constituencyId}`}
                                className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <ExternalLink size={18} /> VIEW REAL DATA
                            </Link>
                            
                            <button 
                                onClick={() => router.refresh()}
                                className="px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-background)] active:scale-95 transition-all"
                            >
                                <RefreshCw size={18} /> ANOTHER ONE!
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-12 text-[var(--color-text-tertiary)] text-xs font-medium max-w-md mx-auto leading-relaxed">
                    Disclaimer: This page is for humorous purposes. The actual candidate is a real person. 
                    The data shown is sourced from ECI filings, but the descriptions are just us being cheeky.
                </p>
            </div>
        </div>
    );
}
