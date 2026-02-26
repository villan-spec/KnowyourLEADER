export interface Constituency {
    id: string;
    name: string;
    nameTamil: string;
    districtId: string;
}

export interface District {
    id: string;
    name: string;
    nameTamil: string;
    constituencies: Constituency[];
}

export interface Candidate {
    id: string;
    name: string;
    nameTamil: string;
    party: string;
    partyColor: string;
    constituencyId: string;
    districtId: string;
    photo: string | null;
    source: "news" | "official" | "potential";
    sourceUrl?: string;
    assetsSourceUrl?: string;
    casesSourceUrl?: string;
    declaredAssets: number;
    pendingCriminalCases: number;
    localIssues: string[];
    education: string;
    age: number;
    lastUpdated: string;
}

export type Alliance = "INDIA" | "NDA" | "AIADMK-plus" | "TVK-led" | "Others";

export interface Party {
    id: string; // e.g., "DMK"
    name: string;
    totalCandidates: number;
    declaredCandidates: number;
    cleanRosterPercentage: number;
    averageAssets: number;
    educationBreakdown: {
        graduate: number;
        nonGraduate: number;
    };
    color: string;
    alliance: Alliance;
}

export const REGION_MAPPING: Record<string, string> = {
    "chennai": "Chennai",
    "chengalpattu": "Chennai",
    "tiruvallur": "Chennai",
    "kancheepuram": "Chennai",
    "coimbatore": "West (Kongu)",
    "tiruppur": "West (Kongu)",
    "erode": "West (Kongu)",
    "nilgiris": "West (Kongu)",
    "salem": "West (Kongu)",
    "namakkal": "West (Kongu)",
    "dharmapuri": "West (Kongu)",
    "krishnagiri": "West (Kongu)",
    "madurai": "South",
    "theni": "South",
    "dindigul": "South",
    "sivaganga": "South",
    "ramanathapuram": "South",
    "virudhunagar": "South",
    "tirunelveli": "South",
    "tenkasi": "South",
    "thiruvannamalai": "North",
    "vellore": "North",
    "ranipet": "North",
    "tirupathur": "North",
    "villupuram": "North",
    "kallakurichi": "North",
    "cuddalore": "North",
    "thanjavur": "Central (Delta)",
    "thiruvarur": "Central (Delta)",
    "nagapattinam": "Central (Delta)",
    "mayiladuthurai": "Central (Delta)",
    "trichy": "Central (Delta)",
    "pudukkottai": "Central (Delta)",
    "perambalur": "Central (Delta)",
    "ariyalur": "Central (Delta)",
    "karur": "Central (Delta)"
};

export const PARTY_ALLIANCE: Record<string, Alliance> = {
    "DMK": "INDIA",
    "INC": "INDIA",
    "VCK": "INDIA",
    "CPI": "INDIA",
    "CPM": "INDIA",
    "MDMK": "INDIA",
    "IUML": "INDIA",
    "AIADMK": "AIADMK-plus",
    "DMDK": "AIADMK-plus",
    "BJP": "NDA",
    "PMK": "NDA",
    "AMMK": "NDA",
    "TVK": "TVK-led",
    "NTK": "Others",
    "MNM": "INDIA"
};

export interface DataSource {
    name: string;
    url: string;
    description: string;
    type: "official" | "news" | "potential";
}

export const DATA_SOURCES: DataSource[] = [
    { name: "MyNeta.info (ECI)", url: "https://myneta.info", description: "Election Commission verified candidate data — assets, criminal cases, education", type: "official" },
    { name: "The Hindu", url: "https://www.thehindu.com/news/national/tamil-nadu/", description: "Tamil Nadu election news & analysis", type: "news" },
    { name: "Times of India", url: "https://timesofindia.indiatimes.com/india/tamil-nadu", description: "Tamil Nadu news coverage", type: "news" },
    { name: "NDTV", url: "https://www.ndtv.com/tamil-nadu", description: "Tamil Nadu political news", type: "news" },
    { name: "Indian Express", url: "https://indianexpress.com/section/cities/chennai/", description: "Chennai & Tamil Nadu coverage", type: "news" },
    { name: "Deccan Herald", url: "https://www.deccanherald.com/india/tamil-nadu", description: "Tamil Nadu news reports", type: "news" },
];

export function getSourceUrl(candidate: Candidate): string {
    if (candidate.sourceUrl) return candidate.sourceUrl;
    if (candidate.source === "official" || candidate.source === "potential") {
        return `https://myneta.info/TamilNadu2021/index.php?action=summary&subAction=winner_analyzed&sort=default`;
    }
    return `https://news.google.com/search?q=${encodeURIComponent(candidate.name + " Tamil Nadu 2026 election")}`;
}

export function getAssetsSourceUrl(candidate: Candidate): string {
    if (candidate.assetsSourceUrl) return candidate.assetsSourceUrl;
    if (candidate.sourceUrl) return candidate.sourceUrl;
    if (candidate.source === "official" || candidate.source === "potential") {
        return "https://myneta.info/TamilNadu2021/index.php?action=summary&subAction=winner_analyzed&sort=asset";
    }
    return getSourceUrl(candidate);
}

export function getCriminalCasesSourceUrl(candidate: Candidate): string {
    if (candidate.casesSourceUrl) return candidate.casesSourceUrl;
    if (candidate.sourceUrl) return candidate.sourceUrl;
    if (candidate.source === "official" || candidate.source === "potential") {
        return "https://myneta.info/TamilNadu2021/index.php?action=summary&subAction=winner_analyzed&sort=criminal";
    }
    return getSourceUrl(candidate);
}

export function getIssuesSourceUrl(candidate: Candidate): string {
    return `https://news.google.com/search?q=${encodeURIComponent(candidate.localIssues.join(" ") + " " + candidate.name + " Tamil Nadu")}`;
}

export function formatAssets(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
}

export function getRegions(): string[] {
    return Array.from(new Set(Object.values(REGION_MAPPING)));
}

export function getRegionByDistrictId(districtId: string): string {
    return REGION_MAPPING[districtId.toLowerCase()] || "Other";
}
