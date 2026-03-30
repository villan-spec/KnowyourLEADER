import { getCandidates } from "@/lib/data.server";
import FunnyCandidateView from "@/components/FunnyCandidateView";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Random Candidate Surprise 🎲 | 2026 TN Election",
    description: "Meet a random candidate from the Tamil Nadu 2026 elections with a humorous twist. See the wealth, the cases, and the verdict.",
};

export default async function FunnyRandomPage() {
    const candidates = getCandidates();
    const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];

    return (
        <main className="min-h-screen bg-[var(--color-background)]">
            <FunnyCandidateView candidate={randomCandidate} />
        </main>
    );
}
