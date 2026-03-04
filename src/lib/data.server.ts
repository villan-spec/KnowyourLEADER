import fs from "fs";
import path from "path";
import { District, Constituency, Candidate, Party, PARTY_ALLIANCE, ALLOWED_PARTIES } from "./data";

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
    const allCandidates: Candidate[] = JSON.parse(raw);
    return allCandidates.filter(c => ALLOWED_PARTIES.includes(c.party));
}

export function getCandidatesByConstituency(constituencyId: string): Candidate[] {
    return getCandidates().filter((c) => c.constituencyId === constituencyId);
}

export function getCandidatesByDistrict(districtId: string): Candidate[] {
    return getCandidates().filter((c) => c.districtId === districtId);
}

export function getParties(): Party[] {
    const candidates = getCandidates();
    const partiesMap: Record<string, Party & { validDataCount: number }> = {};

    candidates.forEach(c => {
        if (!partiesMap[c.party]) {
            partiesMap[c.party] = {
                id: c.party,
                name: c.party,
                totalCandidates: 234,
                declaredCandidates: 0,
                cleanRosterPercentage: 0,
                averageAssets: 0,
                educationBreakdown: { graduate: 0, nonGraduate: 0 },
                color: c.partyColor,
                alliance: PARTY_ALLIANCE[c.party] || "Others",
                validDataCount: 0
            };
        }

        const p = partiesMap[c.party];
        p.declaredCandidates++;

        const hasData = c.declaredAssets > 0 || c.pendingCriminalCases > 0;

        if (hasData) {
            p.validDataCount++;
            if (c.pendingCriminalCases === 0) p.cleanRosterPercentage++;
            p.averageAssets += c.declaredAssets;
        }

        const edu = c.education.toLowerCase();
        if (edu.includes("graduate") || edu.includes("degree") || edu.includes("post graduate") || edu.includes("doctorate") || edu.includes("b.") || edu.includes("m.") || edu.includes("ips") || edu.includes("ias")) {
            p.educationBreakdown.graduate++;
        } else {
            p.educationBreakdown.nonGraduate++;
        }
    });

    return Object.values(partiesMap).map(p => {
        const { validDataCount, ...rest } = p;
        return {
            ...rest,
            cleanRosterPercentage: validDataCount > 0 ? Math.round((rest.cleanRosterPercentage / validDataCount) * 100) : 0,
            averageAssets: validDataCount > 0 ? Math.round(rest.averageAssets / validDataCount) : 0
        };
    });
}

export function getPartyById(id: string): Party | undefined {
    return getParties().find(p => p.id === id);
}
