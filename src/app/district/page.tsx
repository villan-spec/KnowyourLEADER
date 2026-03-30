import { getDistricts, getCandidates } from "@/lib/data.server";
import { DATA_SOURCES } from "@/lib/data";
import DistrictHubClient from "@/components/DistrictHubClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Browse Districts | 2026 Tamil Nadu Election",
    description: "Explore all 38 districts and 234 constituencies of Tamil Nadu. View candidate lists and verified data for the 2026 Assembly Elections.",
};

export default async function DistrictsPage() {
    const districts = getDistricts();
    const candidates = getCandidates();

    return (
        <main className="min-h-screen bg-[var(--color-background)]">
            <DistrictHubClient 
                districts={districts} 
                candidates={candidates} 
                dataSources={DATA_SOURCES} 
            />
        </main>
    );
}
