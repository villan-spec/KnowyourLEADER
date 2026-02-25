import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllConstituencies, getConstituencyBySlug, getCandidatesByConstituency } from "@/lib/data";
import ComparisonView from "@/components/ComparisonView";
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
    return {
        title: `${constituency.name} Candidates — Know Your Leader`,
        description: `Compare candidates running for ${constituency.name} constituency in ${constituency.districtName} district. Tamil Nadu 2026 Elections.`,
    };
}

export default async function ConstituencyPage({ params }: Props) {
    const { slug } = await params;
    const constituency = getConstituencyBySlug(slug);
    if (!constituency) notFound();

    const candidates = getCandidatesByConstituency(slug);

    return (
        <div className="container-app py-10">
            {/* Breadcrumb */}
            <nav className="breadcrumb flex items-center gap-1.5 text-sm mb-8 flex-wrap">
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
