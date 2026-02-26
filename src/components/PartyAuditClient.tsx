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
import { Party, Candidate, Constituency } from "@/lib/data";

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

    const partyCandidates = useMemo(() => {
        return allCandidates.filter(c => c.party === party.id);
    }, [allCandidates, party.id]);

    const filteredCandidates = useMemo(() => {
        let list = [...partyCandidates];

        if (filterRegion !== "All") {
            list = list.filter(c => getRegionByDistrictId(c.districtId) === filterRegion);
        }

        if (filterAge) {
            list = list.filter(c => c.age < 40 && c.age > 0);
        }

        list.sort((a, b) => {
            if (sortBy === "assets") return b.declaredAssets - a.declaredAssets;
            if (sortBy === "cases") return b.pendingCriminalCases - a.pendingCriminalCases;
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent-blue mb-8 hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft size={16} /> Back to Parties
                </Link>

                {/* Hero / Header Audit Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-1 card-glass p-8 flex flex-col items-center justify-center text-center">
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
                        <h1 className="text-4xl font-black mb-1">{party.id}</h1>
                        <p className="text-xs font-bold text-secondary uppercase tracking-widest">{party.alliance} Alliance</p>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card-glass p-6 flex flex-col justify-between">
                            <div>
                                <div className="p-2 w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green mb-4 flex items-center justify-center">
                                    <TrendingUp size={20} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Average Wealth</p>
                                <h3 className="text-2xl font-bold">{formatAssets(party.averageAssets)}</h3>
                            </div>
                            <p className="text-xs text-secondary mt-4 italic">Declared Assets per Candidate</p>
                        </div>

                        <div className="card-glass p-6 flex flex-col justify-between">
                            <EducationBarChart
                                graduate={party.educationBreakdown.graduate}
                                nonGraduate={party.educationBreakdown.nonGraduate}
                            />
                            <p className="text-xs text-secondary mt-4 italic">Qualifications Breakdown</p>
                        </div>

                        <div className="card-glass p-6 flex flex-col justify-between">
                            <div>
                                <div className="p-2 w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue mb-4 flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Ticket Allocation</p>
                                <h3 className="text-2xl font-bold">{party.declaredCandidates} / {party.totalCandidates}</h3>
                            </div>
                            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-4">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${(party.declaredCandidates / party.totalCandidates) * 100}%`,
                                        backgroundColor: party.color
                                    }}
                                />
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
                <div>
                    <div className="sticky top-[72px] z-30 card-glass p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <h3 className="font-bold flex items-center gap-2">
                                <Filter size={16} /> Filters
                            </h3>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Region:</span>
                                <select
                                    value={filterRegion}
                                    onChange={(e) => setFilterRegion(e.target.value)}
                                    className="bg-black/5 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
                                >
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => setFilterAge(!filterAge)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filterAge ? "bg-accent-blue text-white" : "bg-black/5 hover:bg-black/10"}`}
                            >
                                Show Youth (Under 40)
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1">
                                <SortAsc size={14} /> Sort By:
                            </span>
                            <div className="flex bg-black/5 p-1 rounded-xl">
                                {["name", "assets", "cases"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSortBy(s as any)}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${sortBy === s ? "bg-white text-accent-blue shadow-sm" : "opacity-60 hover:opacity-100"}`}
                                    >
                                        {s === "cases" ? "Criminal Cases" : s}
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
