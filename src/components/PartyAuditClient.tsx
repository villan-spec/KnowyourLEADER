"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    formatAssets,
    getRegionByDistrictId
} from "@/lib/data";
import CandidateCard from "@/components/CandidateCard";
import EducationBarChart from "@/components/EducationBarChart";
import SeatMatrix from "@/components/SeatMatrix";
import { ArrowLeft, Filter, SortAsc, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Party, Candidate, Constituency, PARTY_NAMES } from "@/lib/data";

interface PartyAuditClientProps {
    party: Party;
    allCandidates: Candidate[];
    constituencies: Constituency[];
}

export default function PartyAuditClient({ party, allCandidates, constituencies }: PartyAuditClientProps) {
    const router = useRouter();

    const [sortBy, setSortBy] = useState<"name" | "assets" | "cases">("name");
    const [filterRegion, setFilterRegion] = useState<string>("All");
    const [filterAge, setFilterAge] = useState<boolean>(false);

    type ExtendedCandidate = Candidate & { isTBA?: boolean };

    const partyCandidates = useMemo((): ExtendedCandidate[] => {
        return allCandidates.filter(c => c.party === party.id);
    }, [allCandidates, party]);

    const filteredCandidates = useMemo(() => {
        let list = [...partyCandidates];

        if (filterRegion !== "All") {
            list = list.filter(c => getRegionByDistrictId(c.districtId) === filterRegion);
        }

        if (filterAge) {
            list = list.filter(c => c.age < 40 && c.age > 0);
        }

        list.sort((a, b) => {
            const aIsTBA = (a as ExtendedCandidate).isTBA;
            const bIsTBA = (b as ExtendedCandidate).isTBA;

            if (aIsTBA && !bIsTBA) return 1;
            if (!aIsTBA && bIsTBA) return -1;

            if (sortBy === "assets") return b.declaredAssets - a.declaredAssets;
            if (sortBy === "cases") return b.pendingCriminalCases - a.pendingCriminalCases;

            // Default sort: Official first, then by name
            const order: Record<string, number> = { "official": 1, "potential": 2, "news": 3 };
            const scoreA = order[a.source] || 99;
            const scoreB = order[b.source] || 99;
            if (scoreA !== scoreB) return scoreA - scoreB;

            return a.name.localeCompare(b.name);
        });

        return list;
    }, [partyCandidates, sortBy, filterRegion, filterAge]);

    const { maxAssets, maxCases } = useMemo(() => {
        return {
            maxAssets: Math.max(...allCandidates.map(c => c.declaredAssets), 1),
            maxCases: Math.max(...allCandidates.map(c => c.pendingCriminalCases), 1)
        };
    }, [allCandidates]);

    const actualPartyCandidates = useMemo(() => {
        return allCandidates.filter(c => c.party === party.id);
    }, [allCandidates, party.id]);

    const officialCount = actualPartyCandidates.filter(c => c.source === "official").length;
    const potentialCount = actualPartyCandidates.filter(c => c.source === "potential" || c.source === "news").length;

    const candidateMap = useMemo(() => {
        const map: Record<string, { partyColor: string; party: string }> = {};
        allCandidates.forEach(c => {
            map[c.constituencyId] = { partyColor: c.partyColor, party: c.party };
        });
        return map;
    }, [allCandidates]);

    const regions = ["All", "Chennai", "North", "South", "West (Kongu)", "Central (Delta)"];

    return (
        <main className="min-h-screen bg-background">
            <div className="container-app py-10 sm:py-16">
                <Link
                    href="/party"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-blue)] mb-8 hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft size={16} /> Back to Parties
                </Link>

                {/* Hero / Header Audit Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-1 card-glass p-5 sm:p-6 flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    fill="none"
                                    stroke="rgba(0,0,0,0.05)"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    fill="none"
                                    stroke={party.color}
                                    strokeWidth="10"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * party.cleanRosterPercentage) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">{party.cleanRosterPercentage}%</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Clean Roster</span>
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black mb-1">{PARTY_NAMES[party.id] || party.id}</h1>
                        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{party.alliance} Alliance</p>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 items-start">
                        <div className="card-glass p-4 sm:p-5">
                            <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">Average Wealth</p>
                                <h3 className="text-lg sm:text-2xl font-bold">{formatAssets(party.averageAssets)}</h3>
                            </div>
                            <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-3 italic">Declared Assets per Candidate</p>
                        </div>

                        <div className="card-glass p-4 sm:p-5">
                            <EducationBarChart
                                graduate={party.educationBreakdown.graduate}
                                nonGraduate={party.educationBreakdown.nonGraduate}
                            />
                            <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-3 italic">Qualifications Breakdown</p>
                        </div>

                        <div className="card-glass p-4 sm:p-5 col-span-2 md:col-span-1">
                            <div>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">Ticket Allocation</p>
                                <h3 className="text-lg sm:text-2xl font-bold">{party.declaredCandidates} / {party.totalCandidates}</h3>
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-black/5 rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${party.totalCandidates > 0 ? (party.declaredCandidates / party.totalCandidates) * 100 : 0}%`,
                                        backgroundColor: party.color
                                    }}
                                />
                            </div>
                        </div>

                        {/* Tracker Section (Moved to align under the 3 boxes) */}
                        <div className="card-glass border border-[var(--color-border-light)] flex items-center justify-between col-span-2 md:col-span-3 mt-2 sm:mt-0 p-3 sm:p-5">
                            <div className="flex flex-col items-center justify-center w-1/2 border-r border-[var(--color-border-light)]">
                                <span className="text-2xl sm:text-3xl font-bold text-[var(--color-accent-green)]">{officialCount}</span>
                                <span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider mt-1 text-center">Official Candidates</span>
                            </div>
                            <div className="flex flex-col items-center justify-center w-1/2">
                                <span className="text-2xl sm:text-3xl font-bold text-[var(--color-accent-blue)]">{potentialCount}</span>
                                <span className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider mt-1 text-center">Potential Candidates</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Seat Matrix Visualization */}
                <div className="mb-12">
                    <SeatMatrix
                        constituencies={constituencies}
                        candidateMap={candidateMap}
                        onSeatClick={(id) => router.push(`/constituency/${id}`)}
                    />
                </div>

                {/* Candidates List with Sticky Header */}
                <div className="mt-16">
                    <div className="sticky top-[60px] sm:top-[72px] z-30 card-glass p-3 sm:p-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0">
                                <Filter size={14} className="sm:hidden" />
                                <Filter size={16} className="hidden sm:block" />
                                Filters
                            </h3>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] sm:text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Region:</span>
                                <select
                                    value={filterRegion}
                                    onChange={(e) => setFilterRegion(e.target.value)}
                                    className="bg-black/5 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-semibold focus:outline-none"
                                >
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => setFilterAge(!filterAge)}
                                className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all shrink-0 ${filterAge ? "bg-[var(--color-accent-blue)] text-white" : "bg-black/5 hover:bg-black/10"}`}
                            >
                                Youth
                            </button>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                            <span className="text-[10px] sm:text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <SortAsc size={14} /> Sort:
                            </span>
                            <div className="flex bg-black/5 p-1 rounded-xl">
                                {["name", "assets", "cases"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSortBy(s as "name" | "assets" | "cases")}
                                        className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all capitalize ${sortBy === s ? "bg-white text-[var(--color-accent-blue)] shadow-sm" : "opacity-60 hover:opacity-100"}`}
                                    >
                                        {s === "cases" ? "Cases" : s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((c) => (
                            <CandidateCard
                                key={c.id}
                                candidate={c}
                                maxAssets={maxAssets}
                                maxCases={maxCases}
                            />
                        ))}
                    </div>

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-20 card-glass">
                            <div className="text-tertiary mb-4 flex justify-center">
                                <AlertCircle size={48} opacity={0.2} />
                            </div>
                            <h3 className="text-lg font-bold">No candidates found</h3>
                            <p className="text-secondary text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
