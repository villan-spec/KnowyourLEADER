"use client";

import { useState } from "react";
import { formatAssets } from "@/lib/data";
import { Gavel, TrendingUp, GraduationCap } from "lucide-react";

interface PartyStats {
    total: number;
    avg_cases: number;
    clean_percent: number;
    avg_assets: number;
}

interface PartyComparisonDashboardProps {
    partyStats: Record<string, PartyStats>;
}

const PARTY_COLORS: Record<string, string> = {
    'DMK': '#E41E26',
    'AIADMK': '#138808',
    'BJP': '#FF9933',
    'INC': '#19AAED',
    'PMK': '#FFED00',
    'DMDK': '#FFD700',
    'NTK': '#8B0000',
    'TVK': '#FFD700',
    'Others': '#808080'
};

const PARTY_NAMES: Record<string, { en: string, ta: string }> = {
    'DMK': { en: 'DMK', ta: 'திமுக' },
    'AIADMK': { en: 'AIADMK', ta: 'அதிமுக' },
    'BJP': { en: 'BJP', ta: 'பாஜக' },
    'INC': { en: 'INC', ta: 'காங்கிரஸ்' },
    'PMK': { en: 'PMK', ta: 'பாமக' },
    'DMDK': { en: 'DMDK', ta: 'தேமுதிக' },
    'NTK': { en: 'NTK', ta: 'நாம் தமிழர்' },
    'TVK': { en: 'TVK', ta: 'தமிழக வெற்றிக் கழகம்' },
    'Others': { en: 'Others', ta: 'மற்றவை' }
};

type Metric = 'cases' | 'clean' | 'assets';

export default function PartyComparisonDashboard({ partyStats }: PartyComparisonDashboardProps) {
    const [activeMetric, setActiveMetric] = useState<Metric>('clean');

    const sortedParties = Object.keys(partyStats).sort((a, b) => {
        if (activeMetric === 'clean') return partyStats[b].clean_percent - partyStats[a].clean_percent;
        if (activeMetric === 'cases') return partyStats[b].avg_cases - partyStats[a].avg_cases;
        return partyStats[b].avg_assets - partyStats[a].avg_assets;
    });

    const getHumorTooltip = (party: string, val: number) => {
        if (activeMetric === 'clean') {
            if (val >= 70) return "Top of the class!";
            if (val >= 60) return "Passing grade.";
            return "Room for improvement...";
        }
        if (activeMetric === 'cases') {
            if (val < 1) return "Squeaky clean!";
            if (val < 3) return "Common occurrence.";
            return "Professional litigant territory.";
        }
        return `Avg: ${formatAssets(val)}`;
    };

    const tabs = [
        { id: 'clean', label: 'Clean Roster', icon: <TrendingUp size={16} /> },
        { id: 'cases', label: 'Criminal Cases', icon: <Gavel size={16} /> },
        { id: 'assets', label: 'Candidate Wealth', icon: <GraduationCap size={16} /> },
    ];

    return (
        <section className="py-12 bg-white">
            <div className="container-app">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black flex justify-center items-center gap-3">
                        <TrendingUp className="text-[var(--color-accent-blue)]" />
                        PARTY COMPARISON AT A GLANCE
                    </h2>
                    <p className="text-tamil text-xs text-[var(--color-text-secondary)] mt-1 italic font-semibold">
                        கட்சி ஒப்பீடு ஒரே பார்வையில்
                    </p>
                </div>

                <div className="flex flex-wrap justify-center mb-8 gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMetric(tab.id as Metric)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border ${activeMetric === tab.id ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)]" : "bg-white hover:bg-gray-50 border-gray-100"}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {sortedParties.map((p) => {
                        const stats = partyStats[p];
                        let value = 0;
                        let maxValues = { clean: 100, cases: 10, assets: 250000000 };
                        
                        if (activeMetric === 'clean') value = stats.clean_percent;
                        else if (activeMetric === 'cases') value = stats.avg_cases;
                        else value = stats.avg_assets;

                        const barWidth = Math.min(100, (value / maxValues[activeMetric]) * 100);

                        return (
                            <div key={p} className="relative group px-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-20 font-black text-xs uppercase opacity-80">{PARTY_NAMES[p]?.en || p}</div>
                                    <div className="flex-grow h-4 bg-gray-50 rounded-full overflow-hidden relative border border-gray-100">
                                        <div 
                                            className="h-full transition-all duration-1000 ease-out relative"
                                            style={{ 
                                                width: `${Math.max(2, barWidth)}%`,
                                                backgroundColor: PARTY_COLORS[p] || '#888888'
                                            }}
                                        />
                                    </div>
                                    <div className="w-14 text-right font-black text-xs">
                                        {activeMetric === 'clean' ? `${value}%` : activeMetric === 'cases' ? value : formatAssets(value).replace('₹', '')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
