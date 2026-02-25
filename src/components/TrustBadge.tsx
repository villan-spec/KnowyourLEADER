import { ShieldCheck, Newspaper } from "lucide-react";

interface TrustBadgeProps {
    source: "news" | "official";
}

export default function TrustBadge({ source }: TrustBadgeProps) {
    if (source === "official") {
        return (
            <span className="badge-official">
                <ShieldCheck size={12} strokeWidth={2.5} />
                Official Candidate
            </span>
        );
    }

    return (
        <span className="badge-news">
            <Newspaper size={12} strokeWidth={2.5} />
            News-Sourced
        </span>
    );
}
