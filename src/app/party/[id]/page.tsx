import { notFound } from "next/navigation";
import { getPartyById, getCandidates, getAllConstituencies, getParties } from "@/lib/data.server";
import PartyAuditClient from "@/components/PartyAuditClient";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return getParties().map((p) => ({ id: p.id }));
}

export default async function PartyAuditPage({ params }: Props) {
    const { id } = await params;
    const party = getPartyById(id);

    if (!party) notFound();

    const allCandidates = getCandidates();
    const constituencies = getAllConstituencies();

    return (
        <PartyAuditClient
            party={party}
            allCandidates={allCandidates}
            constituencies={constituencies}
        />
    );
}
