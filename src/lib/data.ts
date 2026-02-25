import fs from "fs";
import path from "path";

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
    source: "news" | "official";
    declaredAssets: number;
    pendingCriminalCases: number;
    localIssues: string[];
    education: string;
    age: number;
    lastUpdated: string;
}

const dataDir = path.join(process.cwd(), "data");

export function getDistricts(): District[] {
    const raw = fs.readFileSync(path.join(dataDir, "districts.json"), "utf-8");
    return JSON.parse(raw);
}

export function getDistrictBySlug(slug: string): District | undefined {
    return getDistricts().find((d) => d.id === slug);
}

export function getAllConstituencies(): Constituency[] {
    return getDistricts().flatMap((d) => d.constituencies);
}

export function getConstituencyBySlug(slug: string): (Constituency & { districtName: string; districtNameTamil: string }) | undefined {
    for (const d of getDistricts()) {
        const c = d.constituencies.find((c) => c.id === slug);
        if (c) return { ...c, districtName: d.name, districtNameTamil: d.nameTamil };
    }
    return undefined;
}

export function getCandidates(): Candidate[] {
    const raw = fs.readFileSync(path.join(dataDir, "candidates.json"), "utf-8");
    return JSON.parse(raw);
}

export function getCandidatesByConstituency(constituencyId: string): Candidate[] {
    return getCandidates().filter((c) => c.constituencyId === constituencyId);
}

export function getCandidatesByDistrict(districtId: string): Candidate[] {
    return getCandidates().filter((c) => c.districtId === districtId);
}

export function formatAssets(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
}
