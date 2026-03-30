"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Shuffle, ChevronRight, X } from "lucide-react";

interface Constituency {
    id: string;
    name: string;
    nameTamil: string;
    districtId: string;
}

interface Candidate {
    id: string;
    name: string;
    nameTamil: string;
    party: string;
    constituencyId: string;
}

interface ConstituencyFinderProps {
    constituencies: Constituency[];
    districts: { id: string; name: string }[];
    candidates: Candidate[];
}

export default function ConstituencyFinder({ constituencies, districts, candidates }: ConstituencyFinderProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();

        // 1. Search Constituencies
        const consMatches = constituencies.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) || 
            c.nameTamil.includes(query)
        ).map(c => ({ ...c, type: 'constituency' as const }));

        // 2. Search Candidates
        const candMatches = candidates.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) || 
            c.nameTamil.includes(query)
        ).map(c => ({ ...c, type: 'candidate' as const }));

        return [...consMatches, ...candMatches].slice(0, 10);
    }, [query, constituencies, candidates]);

    const handleResultClick = (item: any) => {
        if (item.type === 'constituency') {
            router.push(`/constituency/${item.id}`);
        } else {
            // Navigate to constituency page but could theoretically deep link to candidate
            router.push(`/constituency/${item.constituencyId}`);
        }
        setIsOpen(false);
    };

    return (
        <section className="py-8 bg-[var(--color-background)]">
            <div className="container-app">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black flex justify-center items-center gap-2">
                        <MapPin className="text-[var(--color-accent-blue)]" />
                        FIND YOUR CONSTITUENCY OR CANDIDATE
                    </h2>
                    <p className="text-tamil text-xs text-[var(--color-text-secondary)] mt-1 italic font-semibold">
                        உங்கள் தொகுதி அல்லது வேட்பாளரை தேடுங்கள்
                    </p>
                </div>

                <div className="max-w-2xl mx-auto relative mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={20} />
                        <input
                            type="text"
                            placeholder="Type name (e.g. Kolathur or Stalin)"
                            className="search-input py-4 pl-12 pr-12 text-lg shadow-lg border-2 focus:border-[var(--color-accent-blue)]"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                        />
                        {query && (
                            <button 
                                onClick={() => setQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {isOpen && filtered.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[var(--color-border-light)] overflow-hidden z-50 animate-fade-in max-h-[400px] overflow-y-auto">
                            {filtered.map((item, idx) => (
                                <button
                                    key={`${item.type}-${item.id}-${idx}`}
                                    onClick={() => handleResultClick(item)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-accent-blue)]/5 transition-colors text-left border-b border-[var(--color-border-light)] last:border-0 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'candidate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.type === 'candidate' ? '👤' : '📍'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)]">
                                                {item.name}
                                                {item.type === 'candidate' && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 uppercase">{item.party}</span>}
                                            </p>
                                            <p className="text-tamil text-xs text-[var(--color-text-tertiary)]">
                                                {item.nameTamil} 
                                                {item.type === 'candidate' && <span className="ml-1 text-[10px] opacity-70 italic text-[var(--color-text-secondary)]">• {item.constituencyId}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="card p-4 text-center group cursor-pointer hover:border-[var(--color-accent-blue)]" onClick={() => router.push('/district')}>
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-blue)]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                            <MapPin className="text-[var(--color-accent-blue)]" size={20} />
                        </div>
                        <h4 className="font-bold mb-0.5 text-sm uppercase">BROWSE BY DISTRICT</h4>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">See all 38 districts</p>
                    </div>

                    <div className="card p-4 text-center group cursor-pointer hover:border-[#FACC15]" onClick={() => router.push('/funny-random')}>
                        <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                            <Shuffle className="text-[#FACC15]" size={20} />
                        </div>
                        <h4 className="font-bold mb-0.5 text-sm uppercase">RANDOM SURPRISE</h4>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">Feeling adventurous?</p>
                    </div>

                    <div className="card p-4 text-center opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <MapPin className="text-gray-400" size={20} />
                        </div>
                        <h4 className="font-bold mb-0.5 text-sm uppercase text-gray-400">USE MY LOCATION</h4>
                        <p className="text-[10px] text-gray-400 italic">Coming soon!</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
