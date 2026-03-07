"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

type Language = "en" | "ta";

interface LanguageContextValue {
    lang: Language;
    toggle: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "kyl-lang";

// ─── Translations ────────────────────────────────────────
// Tanglish: conversational Tamil written in the English alphabet.

const translations: Record<string, Record<Language, string>> = {
    // Header & Nav
    "Know Your Leader": { en: "Know Your Leader", ta: "Unga Thalaivara Therinjikonga" },
    "Tamil Nadu 2026 Assembly Election": { en: "Tamil Nadu 2026 Assembly Election", ta: "Tamil Nadu 2026 Sattamanra Therthal" },
    "Districts": { en: "Districts", ta: "Maavattangal" },
    "Party Audit": { en: "Party Audit", ta: "Katchi Vivarangal" },
    "Pulse": { en: "Pulse", ta: "Thudippu" },
    "Constituencies": { en: "Constituencies", ta: "Thoguthigal" },
    "Alliance Tracker": { en: "Alliance Tracker", ta: "Kootani Tracker" },
    "Key Battlegrounds": { en: "Key Battlegrounds", ta: "Muppoattu Thogudhigal" },
    "Manifesto Comparator": { en: "Manifesto Comparator", ta: "Vaakkurudhi Opeettu" },

    // Home / DistrictHub
    "Tamil Nadu Assembly Elections 2026": { en: "Tamil Nadu Assembly Elections 2026", ta: "Tamil Nadu Sattamanra Therthal 2026" },
    "Compare candidates running for your constituency based on objective facts — declared assets, criminal records, and local issues addressed.": {
        en: "Compare candidates running for your constituency based on objective facts — declared assets, criminal records, and local issues addressed.",
        ta: "Unga thoguthiyil potti poduravangala unmai thagavalgal vazhiyaa oppidungal — sothuthagal, kutra vazhakkugal, matrum oor piracchanaikal."
    },
    "Official Candidates": { en: "Official Candidates", ta: "Aathipoormana Vaettpaalargal" },
    "Potential Candidates": { en: "Potential Candidates", ta: "Ethirpaarkkappadum Vaettpaalargal" },
    "Candidates Tracked": { en: "Candidates Tracked", ta: "Kandakaanikkappatta Vaettpaalargal" },
    "Search districts or constituencies...": { en: "Search districts or constituencies...", ta: "Maavattam alladu thoguthiyai thedunga..." },
    "No districts match your search": { en: "No districts match your search", ta: "Unga thedalukku porundhiya maavattangal illai" },

    // Party Audit Page
    "Explore the transparency and profile of political parties contesting in the Tamil Nadu 2026 Elections. View aggregated data on wealth, criminal records, and candidate demographics.": {
        en: "Explore the transparency and profile of political parties contesting in the Tamil Nadu 2026 Elections. View aggregated data on wealth, criminal records, and candidate demographics.",
        ta: "Tamil Nadu 2026 therthalil potti podum katchikalin velippadiththanmaiyaiyum vivaranaiyum ariyungal. Selvam, kutra vazhakkugal, vaettpaalargal vivarangalai parunangal."
    },

    // CandidateCard
    "Education:": { en: "Education:", ta: "Kalvi:" },
    "Assets": { en: "Assets", ta: "Sothuthagal" },
    "Cases": { en: "Cases", ta: "Vazhakkugal" },
    "Issues": { en: "Issues", ta: "Piracchanaikal" },
    "Local Issues Addressed": { en: "Local Issues Addressed", ta: "Theerppa Pattha Oor Piracchanaikal" },
    "Source": { en: "Source", ta: "Aatharam" },
    "Awaiting announcement": { en: "Awaiting announcement", ta: "Arivippu edhirpaarkkapppadugiradhu" },
    "case pending": { en: "case pending", ta: "vazhakku niluvaiyil" },
    "cases pending": { en: "cases pending", ta: "vazhakkugal niluvaiyil" },

    // Alliance Tracker
    "Coalition Tracker": { en: "Coalition Tracker", ta: "Kootani Tracker" },
    "Alliance Matrix": { en: "Alliance Matrix", ta: "Kootani Amaippu" },
    "Track coalition structures, seat-sharing agreements, and projected outcomes for the 2026 Tamil Nadu Assembly Elections.": {
        en: "Track coalition structures, seat-sharing agreements, and projected outcomes for the 2026 Tamil Nadu Assembly Elections.",
        ta: "2026 Tamil Nadu sattamanra therthalukkaana kootani amaippugal, idangal pangiduval, matrum munnilaippaduththiya mudivugalai kandakaaniyungal."
    },
    "Projected Seat Distribution (234 Total)": { en: "Projected Seat Distribution (234 Total)", ta: "Munnilaippaduththiya Idangal Pankirvu (234 Moththam)" },
    "CM Candidate": { en: "CM Candidate", ta: "CM Vaettpaalargal" },
    "Vote Share": { en: "Vote Share", ta: "Vaakku Veedham" },
    "Proj. Seats": { en: "Proj. Seats", ta: "Ethirpaarkkappadum Idangal" },
    "Seat Distribution": { en: "Seat Distribution", ta: "Idangal Pankirvu" },
    "seats": { en: "seats", ta: "idangal" },

    // Battlegrounds
    "Hot Seats": { en: "Hot Seats", ta: "Mukkiya Idangal" },
    "The most-watched constituencies in the 2026 election — featuring CM matchups, TVK debuts, and margin thrillers.": {
        en: "The most-watched constituencies in the 2026 election — featuring CM matchups, TVK debuts, and margin thrillers.",
        ta: "2026 therthalil migavum kavanikkapppadum thogudhigal — CM mottalgal, TVK arangaetrangal, matrum margin parapparappu."
    },
    "Key Contestants": { en: "Key Contestants", ta: "Mukkiya Pottiyaalargal" },
    "Incumbent": { en: "Incumbent", ta: "Nilavai Pathiviyalar" },
    "2021 Margin": { en: "2021 Margin", ta: "2021 Vaakku Viththiyaasam" },
    "votes": { en: "votes", ta: "vaakkugal" },

    // Manifesto Comparator
    "Promise Tracker": { en: "Promise Tracker", ta: "Vaakkurudhi Tracker" },
    "Compare verified policy promises side-by-side across all major parties contesting the 2026 elections.": {
        en: "Compare verified policy promises side-by-side across all major parties contesting the 2026 elections.",
        ta: "2026 therthalil podhipodum ellaa mukkiya katchikalin urapadiyaana kolgai vaakkurudhigalai pakkapakkamaa oppidungal."
    },
    "All Sectors": { en: "All Sectors", ta: "Ellaa Thuuraigalum" },
    "All Parties": { en: "All Parties", ta: "Ellaa Katchiagalum" },
    "No promises found for this filter combination": { en: "No promises found for this filter combination", ta: "Indha vadikattalukku vaakkurudhigal illai" },
    "Status Legend": { en: "Status Legend", ta: "Nilai Vivaranai" },
    "Manifesto": { en: "Manifesto", ta: "Therdhalneri" },
    "Policy": { en: "Policy", ta: "Kolgai" },
    "Rally Promise": { en: "Rally Promise", ta: "Koottha Vaakkurudhi" },

    // Sector labels
    "Women": { en: "Women", ta: "Pengal" },
    "Youth & Jobs": { en: "Youth & Jobs", ta: "Ilaignar & Velai" },
    "Agriculture": { en: "Agriculture", ta: "Vivasaayam" },
    "Infrastructure": { en: "Infrastructure", ta: "Adipppadai Vasendhigal" },
    "Education": { en: "Education", ta: "Kalvi" },
    "Healthcare": { en: "Healthcare", ta: "Sugaadharam" },
    "Economy": { en: "Economy", ta: "Porulaadhaaram" },

    // Footer
    "Data Sources:": { en: "Data Sources:", ta: "Thagaval Aadharangal:" },
    "Built for citizens, by citizens.": { en: "Built for citizens, by citizens.", ta: "Makkalukkaga, makkalaal uraakkappattathu." },

    // Disclaimer
    "Goal": { en: "Goal", ta: "Nokkam" },
    "I Understand": { en: "I Understand", ta: "Purinjikkiteen" },
};

// ─── Provider ────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>("en");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (stored === "ta" || stored === "en") {
            setLang(stored);
        }
    }, []);

    const toggle = useCallback(() => {
        setLang(prev => {
            const next = prev === "en" ? "ta" : "en";
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    const t = useCallback((key: string): string => {
        const entry = translations[key];
        if (!entry) return key; // fallback to original key if no translation exists
        return entry[lang];
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, toggle, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
