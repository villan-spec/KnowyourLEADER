import fs from "fs";
import path from "path";
import HeroRecordBreakers from "@/components/landing/HeroRecordBreakers";
import LiveStatsCounter from "@/components/landing/LiveStatsCounter";
import ConstituencyFinder from "@/components/landing/ConstituencyFinder";
import PartyComparisonDashboard from "@/components/landing/PartyComparisonDashboard";
import { getDistricts, getAllConstituencies, getCandidates } from "@/lib/data.server";

export default async function LandingPage() {
    const cachePath = path.join(process.cwd(), "data", "landing-cache.json");
    let stats;
    
    try {
        const raw = fs.readFileSync(cachePath, "utf-8");
        stats = JSON.parse(raw);
    } catch (e) {
        throw new Error("Landing cache not found. Please run generate-landing-stats.py");
    }

    const constituencies = getAllConstituencies();
    const districts = getDistricts();
    const candidates = getCandidates();

    return (
        <main className="min-h-screen bg-[var(--color-background)]">
            {/* Hero Section */}
            <HeroRecordBreakers recordHolders={stats.record_holders} />

            {/* Search/Finder Section - Moved below Hero Section as requested */}
            <ConstituencyFinder constituencies={constituencies} districts={districts} candidates={candidates} />

            {/* Stats Section */}
            <LiveStatsCounter stats={stats} />

            {/* Party Comparison Section */}
            <PartyComparisonDashboard partyStats={stats.party_stats} />
        </main>
    );
}
