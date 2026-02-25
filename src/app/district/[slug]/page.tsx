import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistricts, getDistrictBySlug, getCandidatesByDistrict } from "@/lib/data";
import ConstituencyList from "@/components/ConstituencyList";
import { ChevronRight, MapPin } from "lucide-react";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getDistricts().map((d) => ({ slug: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const district = getDistrictBySlug(slug);
    if (!district) return {};
    return {
        title: `${district.name} — Know Your Leader`,
        description: `View all constituencies and candidates in ${district.name} district for Tamil Nadu 2026 Elections.`,
    };
}

export default async function DistrictPage({ params }: Props) {
    const { slug } = await params;
    const district = getDistrictBySlug(slug);
    if (!district) notFound();

    const candidates = getCandidatesByDistrict(slug);
    const candidateCounts: Record<string, number> = {};
    for (const c of candidates) {
        candidateCounts[c.constituencyId] = (candidateCounts[c.constituencyId] || 0) + 1;
    }

    return (
        <div className="container-app py-10">
            {/* Breadcrumb */}
            <nav className="breadcrumb flex items-center gap-1.5 text-sm mb-8">
                <Link href="/">Districts</Link>
                <ChevronRight size={12} strokeWidth={2.5} className="text-[var(--color-text-tertiary)]" />
                <span className="text-[var(--color-text-primary)] font-medium">{district.name}</span>
            </nav>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-blue)]/8 flex items-center justify-center">
                    <MapPin size={22} className="text-[var(--color-accent-blue)]" strokeWidth={1.8} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{district.name}</h1>
                    <p className="text-tamil text-sm text-[var(--color-text-tertiary)]">{district.nameTamil}</p>
                </div>
                <div className="ml-auto">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] font-medium">
                        {district.constituencies.length} constituencies
                    </span>
                </div>
            </div>

            {/* Constituency grid */}
            <ConstituencyList
                constituencies={district.constituencies}
                candidateCounts={candidateCounts}
            />
        </div>
    );
}
