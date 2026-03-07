/**
 * election-pulse-data.ts
 *
 * Static, verified data for the "2026 Pulse" section.
 * This file is the ONLY source for the new Pulse features.
 * It NEVER reads or modifies the XLSX/CSV source files.
 *
 * Sources: Verified news reports as of March 2026.
 */

// ─── Types ───────────────────────────────────────────────

export interface AllianceMember {
    partyId: string;
    partyName: string;
    color: string;
    seatsContesting: number;
    seatShareConfirmed: boolean;
    sourceUrl: string;
}

export interface Alliance {
    id: string;
    name: string;
    shortName: string;
    color: string; // gradient anchor
    leaderParty: string;
    cmCandidate: string;
    members: AllianceMember[];
    projectedVoteShare: number; // % from recent opinion poll
    projectedSeats: number;
    pollSource: string;
    pollSourceUrl: string;
}

export interface Battleground {
    constituencyId: string;
    constituencyName: string;
    districtId: string;
    tag: string;          // e.g., "CM Seat", "TVK Debut", "Tight Race"
    tagColor: string;
    description: string;
    keyContestants: {
        name: string;
        party: string;
        partyColor: string;
        isIncumbent?: boolean;
    }[];
    margin2021?: number; // votes margin in last election
    sourceUrl: string;
}

export interface ManifestoPromise {
    id: string;
    partyId: string;
    partyName: string;
    partyColor: string;
    sector: "women" | "youth" | "agriculture" | "infrastructure" | "education" | "healthcare" | "economy";
    promise: string;
    status: "official_manifesto" | "rally_promise" | "policy_announcement";
    sourceUrl: string;
}

// ─── Alliance Data ──────────────────────────────────────

export const ALLIANCES: Alliance[] = [
    {
        id: "spa",
        name: "Secular Progressive Alliance",
        shortName: "SPA (DMK-led)",
        color: "#E31E24",
        leaderParty: "DMK",
        cmCandidate: "M. K. Stalin",
        projectedVoteShare: 36.1,
        projectedSeats: 101,
        pollSource: "Opinionsandratings.com Survey",
        pollSourceUrl: "https://opinionsandratings.com",
        members: [
            { partyId: "DMK", partyName: "DMK", color: "#E31E24", seatsContesting: 175, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "INC", partyName: "Congress (INC)", color: "#19AAED", seatsContesting: 28, seatShareConfirmed: true, sourceUrl: "https://www.deccanherald.com/india/tamil-nadu" },
            { partyId: "VCK", partyName: "VCK", color: "#888888", seatsContesting: 6, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "CPI", partyName: "CPI", color: "#FF0000", seatsContesting: 5, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "CPM", partyName: "CPI(M)", color: "#CC0000", seatsContesting: 5, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "MDMK", partyName: "MDMK", color: "#00AA00", seatsContesting: 4, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "MNM", partyName: "MNM", color: "#4B0082", seatsContesting: 3, seatShareConfirmed: true, sourceUrl: "https://indianexpress.com/section/cities/chennai/" },
            { partyId: "IUML", partyName: "IUML", color: "#006400", seatsContesting: 3, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "DMDK", partyName: "DMDK", color: "#FFAA00", seatsContesting: 5, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
        ],
    },
    {
        id: "nda-aiadmk",
        name: "AIADMK-BJP Alliance",
        shortName: "AIADMK-NDA",
        color: "#006B3F",
        leaderParty: "AIADMK",
        cmCandidate: "Edappadi K. Palaniswami",
        projectedVoteShare: 37.5,
        projectedSeats: 108,
        pollSource: "Opinionsandratings.com Survey",
        pollSourceUrl: "https://opinionsandratings.com",
        members: [
            { partyId: "AIADMK", partyName: "AIADMK", color: "#006B3F", seatsContesting: 170, seatShareConfirmed: true, sourceUrl: "https://indianexpress.com/section/cities/chennai/" },
            { partyId: "BJP", partyName: "BJP", color: "#FF6B00", seatsContesting: 30, seatShareConfirmed: true, sourceUrl: "https://indianexpress.com/section/cities/chennai/" },
            { partyId: "PMK", partyName: "PMK", color: "#FFD700", seatsContesting: 20, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
            { partyId: "AMMK", partyName: "AMMK", color: "#800080", seatsContesting: 10, seatShareConfirmed: true, sourceUrl: "https://www.oneindia.com/" },
            { partyId: "PT", partyName: "Puthiya Tamilagam", color: "#666666", seatsContesting: 4, seatShareConfirmed: true, sourceUrl: "https://www.oneindia.com/" },
        ],
    },
    {
        id: "tvk",
        name: "TVK Alliance",
        shortName: "TVK (Vijay-led)",
        color: "#0044CC",
        leaderParty: "TVK",
        cmCandidate: "Vijay (Joseph Vijay)",
        projectedVoteShare: 19.2,
        projectedSeats: 20,
        pollSource: "Opinionsandratings.com Survey",
        pollSourceUrl: "https://opinionsandratings.com",
        members: [
            { partyId: "TVK", partyName: "Tamilaga Vettri Kazhagam", color: "#0044CC", seatsContesting: 234, seatShareConfirmed: true, sourceUrl: "https://www.indiatoday.in/" },
        ],
    },
    {
        id: "ntk",
        name: "NTK (Independent)",
        shortName: "NTK",
        color: "#8B0000",
        leaderParty: "NTK",
        cmCandidate: "Seeman",
        projectedVoteShare: 5.0,
        projectedSeats: 2,
        pollSource: "Opinionsandratings.com Survey",
        pollSourceUrl: "https://opinionsandratings.com",
        members: [
            { partyId: "NTK", partyName: "Naam Tamilar Katchi", color: "#8B0000", seatsContesting: 234, seatShareConfirmed: true, sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/" },
        ],
    },
];

// ─── Battleground Data ──────────────────────────────────

export const BATTLEGROUNDS: Battleground[] = [
    {
        constituencyId: "virugambakkam",
        constituencyName: "Virugambakkam",
        districtId: "chennai",
        tag: "TVK Debut",
        tagColor: "#0044CC",
        description: "Actor Vijay reportedly planning to contest from Virugambakkam, making it one of the most-watched seats.",
        keyContestants: [
            { name: "Vijay", party: "TVK", partyColor: "#0044CC" },
            { name: "TBA (DMK)", party: "DMK", partyColor: "#E31E24" },
            { name: "TBA (AIADMK)", party: "AIADMK", partyColor: "#006B3F" },
        ],
        sourceUrl: "https://www.indiatoday.in/",
    },
    {
        constituencyId: "trichy-east",
        constituencyName: "Trichy East",
        districtId: "trichy",
        tag: "TVK Debut",
        tagColor: "#0044CC",
        description: "Another constituency where Vijay is reportedly considering contesting, putting the spotlight on the Trichy region.",
        keyContestants: [
            { name: "Vijay", party: "TVK", partyColor: "#0044CC" },
            { name: "TBA (DMK)", party: "DMK", partyColor: "#E31E24" },
            { name: "TBA (AIADMK)", party: "AIADMK", partyColor: "#006B3F" },
        ],
        sourceUrl: "https://www.indiatoday.in/",
    },
    {
        constituencyId: "kolathur",
        constituencyName: "Kolathur",
        districtId: "chennai",
        tag: "CM Seat",
        tagColor: "#E31E24",
        description: "Chief Minister M. K. Stalin's constituency since 2011. Key test of DMK's urban performance.",
        keyContestants: [
            { name: "M. K. Stalin", party: "DMK", partyColor: "#E31E24", isIncumbent: true },
            { name: "TBA (AIADMK)", party: "AIADMK", partyColor: "#006B3F" },
            { name: "TBA (TVK)", party: "TVK", partyColor: "#0044CC" },
        ],
        margin2021: 84000,
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
    {
        constituencyId: "edappadi",
        constituencyName: "Edappadi",
        districtId: "salem",
        tag: "Opposition Leader",
        tagColor: "#006B3F",
        description: "Edappadi K. Palaniswami's home turf in Salem district — a litmus test for AIADMK's strength in the West.",
        keyContestants: [
            { name: "Edappadi K. Palaniswami", party: "AIADMK", partyColor: "#006B3F", isIncumbent: true },
            { name: "TBA (DMK)", party: "DMK", partyColor: "#E31E24" },
            { name: "TBA (TVK)", party: "TVK", partyColor: "#0044CC" },
        ],
        margin2021: 62000,
        sourceUrl: "https://indianexpress.com/section/cities/chennai/",
    },
    {
        constituencyId: "coimbatore-south",
        constituencyName: "Coimbatore South",
        districtId: "coimbatore",
        tag: "Tight Race",
        tagColor: "#FF9F0A",
        description: "A historically competitive seat with strong BJP and DMK presence in the industrial heartland.",
        keyContestants: [
            { name: "TBA (BJP)", party: "BJP", partyColor: "#FF6B00" },
            { name: "TBA (DMK)", party: "DMK", partyColor: "#E31E24" },
            { name: "TBA (TVK)", party: "TVK", partyColor: "#0044CC" },
        ],
        sourceUrl: "https://www.ndtv.com/tamil-nadu",
    },
    {
        constituencyId: "thousand-lights",
        constituencyName: "Thousand Lights",
        districtId: "chennai",
        tag: "High Profile",
        tagColor: "#19AAED",
        description: "A prestigious urban Chennai seat. Historically a Congress stronghold under the DMK alliance.",
        keyContestants: [
            { name: "TBA (INC)", party: "INC", partyColor: "#19AAED" },
            { name: "TBA (AIADMK)", party: "AIADMK", partyColor: "#006B3F" },
            { name: "TBA (TVK)", party: "TVK", partyColor: "#0044CC" },
        ],
        sourceUrl: "https://www.deccanherald.com/india/tamil-nadu",
    },
];

// ─── Manifesto / Promise Data ───────────────────────────

export const MANIFESTO_SECTORS = [
    { id: "women", label: "Women", icon: "users" },
    { id: "youth", label: "Youth & Jobs", icon: "briefcase" },
    { id: "agriculture", label: "Agriculture", icon: "sprout" },
    { id: "infrastructure", label: "Infrastructure", icon: "building" },
    { id: "education", label: "Education", icon: "graduation-cap" },
    { id: "healthcare", label: "Healthcare", icon: "heart-pulse" },
    { id: "economy", label: "Economy", icon: "trending-up" },
] as const;

export const MANIFESTO_PROMISES: ManifestoPromise[] = [
    // TVK Promises
    {
        id: "tvk-women-1",
        partyId: "TVK",
        partyName: "TVK",
        partyColor: "#0044CC",
        sector: "women",
        promise: "₹2,500 monthly financial assistance to women heads of households",
        status: "rally_promise",
        sourceUrl: "https://www.indiatvnews.com/",
    },
    {
        id: "tvk-women-2",
        partyId: "TVK",
        partyName: "TVK",
        partyColor: "#0044CC",
        sector: "women",
        promise: "1 gold sovereign and silk saree as wedding gift for women",
        status: "rally_promise",
        sourceUrl: "https://www.hindustantimes.com/",
    },
    {
        id: "tvk-women-3",
        partyId: "TVK",
        partyName: "TVK",
        partyColor: "#0044CC",
        sector: "women",
        promise: "6 free LPG cylinders per year for all households",
        status: "rally_promise",
        sourceUrl: "https://www.indiatvnews.com/",
    },
    {
        id: "tvk-youth-1",
        partyId: "TVK",
        partyName: "TVK",
        partyColor: "#0044CC",
        sector: "youth",
        promise: "Free laptop scheme for college students",
        status: "rally_promise",
        sourceUrl: "https://www.indiatoday.in/",
    },
    // DMK Promises
    {
        id: "dmk-women-1",
        partyId: "DMK",
        partyName: "DMK",
        partyColor: "#E31E24",
        sector: "women",
        promise: "₹1,000/month Kalaignar Magalir Urimai Thogai scheme (ongoing)",
        status: "policy_announcement",
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
    {
        id: "dmk-education-1",
        partyId: "DMK",
        partyName: "DMK",
        partyColor: "#E31E24",
        sector: "education",
        promise: "Naan Mudhalvan skill development program expansion",
        status: "policy_announcement",
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
    {
        id: "dmk-infra-1",
        partyId: "DMK",
        partyName: "DMK",
        partyColor: "#E31E24",
        sector: "infrastructure",
        promise: "Chennai Metro Phase 2 completion by 2028",
        status: "policy_announcement",
        sourceUrl: "https://indianexpress.com/section/cities/chennai/",
    },
    {
        id: "dmk-healthcare-1",
        partyId: "DMK",
        partyName: "DMK",
        partyColor: "#E31E24",
        sector: "healthcare",
        promise: "Makkalai Thedi Maruthuvam (healthcare at doorstep) continuation",
        status: "policy_announcement",
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
    // AIADMK Promises
    {
        id: "aiadmk-women-1",
        partyId: "AIADMK",
        partyName: "AIADMK",
        partyColor: "#006B3F",
        sector: "women",
        promise: "Amma Unavagam (canteen) expansion across rural areas",
        status: "rally_promise",
        sourceUrl: "https://indianexpress.com/section/cities/chennai/",
    },
    {
        id: "aiadmk-agri-1",
        partyId: "AIADMK",
        partyName: "AIADMK",
        partyColor: "#006B3F",
        sector: "agriculture",
        promise: "Complete farm loan waiver for small and marginal farmers",
        status: "rally_promise",
        sourceUrl: "https://www.ndtv.com/tamil-nadu",
    },
    {
        id: "aiadmk-economy-1",
        partyId: "AIADMK",
        partyName: "AIADMK",
        partyColor: "#006B3F",
        sector: "economy",
        promise: "Attract ₹10 lakh crore industrial investments",
        status: "rally_promise",
        sourceUrl: "https://www.ndtv.com/tamil-nadu",
    },
    // BJP Promises
    {
        id: "bjp-infra-1",
        partyId: "BJP",
        partyName: "BJP",
        partyColor: "#FF6B00",
        sector: "infrastructure",
        promise: "Chennai-Bangalore high-speed rail acceleration",
        status: "rally_promise",
        sourceUrl: "https://www.ndtv.com/tamil-nadu",
    },
    {
        id: "bjp-economy-1",
        partyId: "BJP",
        partyName: "BJP",
        partyColor: "#FF6B00",
        sector: "economy",
        promise: "Special economic zone for electronics manufacturing in Tamil Nadu",
        status: "rally_promise",
        sourceUrl: "https://indianexpress.com/section/cities/chennai/",
    },
    // NTK Promises
    {
        id: "ntk-agri-1",
        partyId: "NTK",
        partyName: "NTK",
        partyColor: "#8B0000",
        sector: "agriculture",
        promise: "Ban on corporate farming to protect small farmers",
        status: "official_manifesto",
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
    {
        id: "ntk-education-1",
        partyId: "NTK",
        partyName: "NTK",
        partyColor: "#8B0000",
        sector: "education",
        promise: "Tamil-medium instruction priority in all government schools",
        status: "official_manifesto",
        sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/",
    },
];
