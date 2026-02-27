"use client";

import { useState, useMemo } from "react";
import DistrictCard from "@/components/DistrictCard";
import { Search, MapPin, Users, Vote, ShieldCheck, Newspaper, ExternalLink } from "lucide-react";

// Import data at build time via page wrapper
interface District {
    id: string;
    name: string;
    nameTamil: string;
    constituencies: { id: string; name: string; nameTamil: string; districtId: string }[];
}

interface Candidate {
    districtId: string;
    source: "official" | "news" | "potential";
}

interface DataSource {
    name: string;
    url: string;
    description: string;
    type: "official" | "news" | "potential";
}

interface DistrictHubClientProps {
    districts: District[];
    candidates: Candidate[];
    dataSources: DataSource[];
}

export default function DistrictHubClient({ districts, candidates, dataSources }: DistrictHubClientProps) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return districts;
        const q = search.toLowerCase();
        return districts.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.nameTamil.includes(search) ||
                d.constituencies.some((c) => c.name.toLowerCase().includes(q))
        );
    }, [search, districts]);

    const candidateCountByDistrict = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const c of candidates) {
            counts[c.districtId] = (counts[c.districtId] || 0) + 1;
        }
        return counts;
    }, [candidates]);

    const totalConstituencies = districts.reduce((sum, d) => sum + d.constituencies.length, 0);
    const officialCount = candidates.filter(c => c.source === "official").length;
    const potentialCount = candidates.filter(c => c.source === "potential" || c.source === "news").length;

    return (
        <div className="container-app py-10 sm:py-16">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-light)] text-xs font-medium text-[var(--color-text-secondary)] mb-4">
                    <Vote size={12} strokeWidth={2.5} />
                    Tamil Nadu Assembly Elections 2026
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    Know Your Leader
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed px-2">
                    Compare candidates running for your constituency based on objective facts — declared assets, criminal records, and local issues addressed.
                </p>
            </div>

            {/* Tracker Section */}
            <div className="max-w-md mx-auto mb-8 sm:mb-10 p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-light)] flex items-center justify-between">
                <div className="flex flex-col items-center justify-center w-1/2 border-r border-[var(--color-border-light)]">
                    <span className="text-3xl font-bold text-[var(--color-accent-green)]">{officialCount}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)] font-medium mt-1">Official Candidates</span>
                </div>
                <div className="flex flex-col items-center justify-center w-1/2">
                    <span className="text-3xl font-bold text-[var(--color-accent-blue)]">{potentialCount}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)] font-medium mt-1">Potential Candidates</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin size={14} className="text-[var(--color-accent-blue)]" strokeWidth={2} />
                    <span className="font-semibold text-[var(--color-text-primary)]">{districts.length}</span> Districts
                </div>
                <div className="w-px h-4 bg-[var(--color-border)]" />
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Users size={14} className="text-[var(--color-accent-green)]" strokeWidth={2} />
                    <span className="font-semibold text-[var(--color-text-primary)]">{totalConstituencies}</span> Constituencies
                </div>
                <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" />
                <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="font-semibold text-[var(--color-text-primary)]">{candidates.length}</span> Candidates Tracked
                </div>
            </div>


            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8 sm:mb-10">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                    strokeWidth={2}
                />
                <input
                    type="text"
                    placeholder="Search districts or constituencies..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <MapPin size={40} strokeWidth={1.2} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
                    <p className="text-sm text-[var(--color-text-secondary)]">No districts match your search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filtered.map((district, i) => (
                        <DistrictCard
                            key={district.id}
                            id={district.id}
                            name={district.name}
                            nameTamil={district.nameTamil}
                            constituencyCount={district.constituencies.length}
                            candidateCount={candidateCountByDistrict[district.id] || 0}
                            index={i}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
