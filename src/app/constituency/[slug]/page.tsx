import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllConstituencies, getConstituencyBySlug, getCandidatesByConstituency } from "@/lib/data.server";
import ComparisonView from "@/components/ComparisonView";
import JsonLd from "@/components/JsonLd";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllConstituencies().map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const constituency = getConstituencyBySlug(slug);
    if (!constituency) return {};

    const candidates = getCandidatesByConstituency(slug);
    const title = `${constituency.name} MLA Candidates 2026 | ${constituency.districtName} Election`;
    const description = `Compare 2026 MLA candidates for ${constituency.name} (${constituency.nameTamil}). View verified assets, criminal records, and stances on local issues before you vote.`;

    return {
        title,
        description,
        keywords: [
            constituency.name,
            constituency.nameTamil,
            constituency.districtName,
            `${constituency.name} MLA`,
            `${constituency.name} candidates 2026`,
            "TN Election 2026",
            "MLA candidates list",
            "தமிழ்நாடு தேர்தல் 2026",
            "சட்டமன்றத் தேர்தல்",
            ...candidates.map((c) => c.name),
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
            canonical: `https://knowyourleader.in/constituency/${slug}`,
        },
    };
}

export default async function ConstituencyPage({ params }: Props) {
    const { slug } = await params;
    const constituency = getConstituencyBySlug(slug);
    if (!constituency) notFound();

    const candidates = getCandidatesByConstituency(slug);

    // JSON-LD structured data
    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: `${constituency.name} MLA Candidates 2026`,
        description: `Candidates contesting for ${constituency.name} constituency in Tamil Nadu 2026 Assembly Elections`,
        mainEntity: candidates.slice(0, 10).map((c) => ({
            "@type": "Person",
            name: c.name,
            affiliation: {
                "@type": "Organization",
                name: c.party,
            },
            jobTitle: `MLA Candidate — ${constituency.name}`,
            description: `${c.party} candidate for ${constituency.name} constituency, ${constituency.districtName} district`,
        })),
    };

    return (
        <div className="container-app py-10 sm:py-16">
            <JsonLd data={jsonLdData} />

            {/* Breadcrumb */}
            <nav className="breadcrumb flex items-center gap-1.5 text-sm mb-6 sm:mb-8 flex-wrap">
                <Link href="/">Districts</Link>
                <ChevronRight size={12} strokeWidth={2.5} className="text-[var(--color-text-tertiary)]" />
                <Link href={`/district/${constituency.districtId}`}>{constituency.districtName}</Link>
                <ChevronRight size={12} strokeWidth={2.5} className="text-[var(--color-text-tertiary)]" />
                <span className="text-[var(--color-text-primary)] font-medium">{constituency.name}</span>
            </nav>

            {/* Comparison View */}
            <ComparisonView
                candidates={candidates}
                constituencyName={constituency.name}
                constituencyNameTamil={constituency.nameTamil}
            />
        </div>
    );
}
