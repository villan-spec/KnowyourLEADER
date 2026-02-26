import { ShieldCheck, Newspaper, UserCheck, ExternalLink } from "lucide-react";

interface TrustBadgeProps {
    source: "news" | "official" | "potential";
    href?: string;
}

export default function TrustBadge({ source, href }: TrustBadgeProps) {
    const content = source === "official" ? (
        <>
            <ShieldCheck size={12} strokeWidth={2.5} />
            Official Candidate
            {href && <ExternalLink size={10} strokeWidth={2.5} className="opacity-60" />}
        </>
    ) : source === "potential" ? (
        <>
            <UserCheck size={12} strokeWidth={2.5} />
            Potential Candidate
            {href && <ExternalLink size={10} strokeWidth={2.5} className="opacity-60" />}
        </>
    ) : (
        <>
            <Newspaper size={12} strokeWidth={2.5} />
            News-Sourced
            {href && <ExternalLink size={10} strokeWidth={2.5} className="opacity-60" />}
        </>
    );

    const badgeClass =
        source === "official" ? "badge-official" :
            source === "potential" ? "badge-potential" :
                "badge-news";

    const title =
        source === "official" ? "Confirmed by Election Commission for 2026" :
            source === "potential" ? "Based on 2021 data & news — not yet confirmed for 2026" :
                "Sourced from news reports";

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={badgeClass}
                style={{ textDecoration: "none", cursor: "pointer" }}
                title={title}
            >
                {content}
            </a>
        );
    }

    return (
        <span className={badgeClass} title={title}>
            {content}
        </span>
    );
}
