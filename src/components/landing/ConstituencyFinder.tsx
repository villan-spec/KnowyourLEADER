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

interface ConstituencyFinderProps {
    constituencies: Constituency[];
    districts: { id: string; name: string }[];
}

export default function ConstituencyFinder({ constituencies, districts }: ConstituencyFinderProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return constituencies.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) || 
            c.nameTamil.includes(query) ||
            c.id.includes(lowerQuery)
        ).slice(0, 8);
    }, [query, constituencies]);

    const handleRandom = () => {
        const random = constituencies[Math.floor(Math.random() * constituencies.length)];
        router.push(`/constituency/${random.id}`);
    };

    return (
        <section className="py-16 bg-[var(--color-background)]">
            <div className="container-app">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black flex justify-center items-center gap-2">
                        <MapPin className="text-[var(--color-accent-blue)]" />
                        FIND YOUR CONSTITUENCY
                    </h2>
                    <p className="text-tamil text-[var(--color-text-secondary)] mt-2 italic font-semibold">
                        உங்கள் தொகுதியை கண்டறியுங்கள்
                    </p>
                </div>

                <div className="max-w-2xl mx-auto relative mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={20} />
                        <input
                            type="text"
                            placeholder="Type your constituency... (e.g. Kolathur or கொளத்தூர்)"
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
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[var(--color-border-light)] overflow-hidden z-50 animate-fade-in">
                            {filtered.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => router.push(`/constituency/${c.id}`)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-accent-blue)]/5 transition-colors text-left border-b border-[var(--color-border-light)] last:border-0 group"
                                >
                                    <div>
                                        <p className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)]">{c.name}</p>
                                        <p className="text-tamil text-xs text-[var(--color-text-tertiary)]">{c.nameTamil}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="card p-6 text-center group cursor-pointer hover:border-[var(--color-accent-blue)]" onClick={() => router.push('/district')}>
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-blue)]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MapPin className="text-[var(--color-accent-blue)]" />
                        </div>
                        <h4 className="font-bold mb-1">BROWSE BY DISTRICT</h4>
                        <p className="text-xs text-[var(--color-text-tertiary)]">See all 38 districts</p>
                    </div>

                    <div className="card p-6 text-center group cursor-pointer hover:border-[#FACC15]" onClick={() => router.push('/funny-random')}>
                        <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                            <Shuffle className="text-[#FACC15]" size={24} />
                        </div>
                        <h4 className="font-bold mb-1">RANDOM SURPRISE</h4>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Feeling adventurous?</p>
                    </div>

                    <div className="card p-6 text-center opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <MapPin className="text-gray-400" />
                        </div>
                        <h4 className="font-bold mb-1 text-gray-400">USE MY LOCATION</h4>
                        <p className="text-xs text-gray-400 italic">Coming soon!</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
