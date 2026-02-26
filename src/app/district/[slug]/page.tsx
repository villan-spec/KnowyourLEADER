import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistricts, getDistrictBySlug, getCandidatesByDistrict } from "@/lib/data.server";
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

    const title = `${district.name} District — ${district.constituencies.length} Constituencies | 2026 TN Election`;
    const description = `View all ${district.constituencies.length} constituencies and MLA candidates in ${district.name} (${district.nameTamil}) district for Tamil Nadu 2026 Assembly Elections.`;

    return {
        title,
        description,
        keywords: [
            district.name,
            district.nameTamil,
            `${district.name} district election`,
            `${district.name} MLA candidates 2026`,
            "TN Election 2026",
            "தமிழ்நாடு தேர்தல் 2026",
            ...district.constituencies.map((c) => c.name),
        ],
        openGraph: {
            title,
            description,
            type: "website",
            images: [{ url: "/images/tn-election-og.png", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/images/tn-election-og.png"],
        },
        alternates: {
            canonical: `https://knowyourleader.in/district/${slug}`,
        },
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
        <div className="container-app py-10 sm:py-16">
            {/* Breadcrumb */}
            <nav className="breadcrumb flex items-center gap-1.5 text-sm mb-6 sm:mb-8">
                <Link href="/">Districts</Link>
                <ChevronRight size={12} strokeWidth={2.5} className="text-[var(--color-text-tertiary)]" />
                <span className="text-[var(--color-text-primary)] font-medium">{district.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-blue)]/8 flex items-center justify-center">
                    <MapPin size={22} className="text-[var(--color-accent-blue)]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold">{district.name}</h1>
                    <p className="text-tamil text-sm text-[var(--color-text-tertiary)]">{district.nameTamil}</p>
                </div>
                <div className="sm:ml-auto">
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
