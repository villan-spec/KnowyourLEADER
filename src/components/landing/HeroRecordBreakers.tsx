import Link from "next/link";
import { formatAssets } from "@/lib/data";
import { Crown, BookOpen, Scale, Award } from "lucide-react";

interface RecordHolder {
    id: string;
    name: string;
    party: string;
    constituencyId: string;
    declaredAssets: number;
    pendingCriminalCases: number;
    education: string;
}

interface HeroRecordBreakersProps {
    recordHolders: {
        richest: RecordHolder;
        poorest: RecordHolder;
        most_criminal: RecordHolder;
        most_educated: RecordHolder;
    };
}

export default function HeroRecordBreakers({ recordHolders }: HeroRecordBreakersProps) {
    const { richest, poorest, most_criminal, most_educated } = recordHolders;

    const dosaPlates = Math.floor(richest.declaredAssets / 50).toLocaleString("en-IN");
    
    // For education special, finding nearest match from poorest
    const isUnderdogEducated = poorest.education.toLowerCase().includes("5th") || poorest.education.toLowerCase().includes("8th");
    const poorestTitle = isUnderdogEducated ? "EDUCATION SPECIAL" : "THE PEOPLE'S CHAMP";
    const poorestHumorEn = "Actually understands auto-rickshaw fare negotiations!";
    const poorestHumorTa = "ஆட்டோ கட்டண பேச்சுவார்த்தை தெரியும்";

    const casesCount = most_criminal.pendingCriminalCases;

    const cards = [
        {
            id: "assets",
            title: "ASSET KING",
            titleTa: "சொத்து சக்ரவர்த்தி",
            value: formatAssets(richest.declaredAssets),
            name: richest.name,
            party: richest.party,
            constituency: richest.constituencyId,
            humorEn: `That's enough to buy ${dosaPlates} masala dosas!`,
            humorTa: "சரவண பவன் தோசை சாப்பிடலாம்!",
            icon: <Crown size={32} className="text-[#FFD700]" />,
            borderColor: "border-[#FFD700]",
            bgColor: "bg-[#FFD700]/5",
            slug: richest.constituencyId
        },
        {
            id: "education",
            title: poorestTitle,
            titleTa: "எளிய வேட்பாளர்",
            value: poorest.education || "Unknown",
            name: poorest.name,
            party: poorest.party,
            constituency: poorest.constituencyId,
            humorEn: poorestHumorEn,
            humorTa: poorestHumorTa,
            icon: <BookOpen size={32} className="text-[#3B82F6]" />,
            borderColor: "border-[#3B82F6]",
            bgColor: "bg-[#3B82F6]/5",
            slug: poorest.constituencyId
        },
        {
            id: "legal",
            title: "LEGAL CHAMPION",
            titleTa: "வழக்கு வீரர்",
            value: `${casesCount} Cases`,
            name: most_criminal.name,
            party: most_criminal.party,
            constituency: most_criminal.constituencyId,
            humorEn: "More pending cases than pending assembly bills",
            humorTa: "சட்டசபையை விட நீதிமன்றத்தில் அதிக நேரம்",
            icon: <Scale size={32} className="text-[#EF4444]" />,
            borderColor: "border-[#EF4444]",
            bgColor: "bg-[#EF4444]/5",
            slug: most_criminal.constituencyId
        },
        {
            id: "scholar",
            title: "SCHOLAR CHAMP",
            titleTa: "படிப்பாளி",
            value: most_educated.education || "Postgraduate",
            name: most_educated.name,
            party: most_educated.party,
            constituency: most_educated.constituencyId,
            humorEn: "When one degree isn't enough to serve the public",
            humorTa: "மக்கள் சேவைக்கு இத்தனை பட்டங்களா!",
            icon: <Award size={32} className="text-[#10B981]" />,
            borderColor: "border-[#10B981]",
            bgColor: "bg-[#10B981]/5",
            slug: most_educated.constituencyId
        }
    ];

    return (
        <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 overflow-hidden">
            {/* Background Image / Pattern */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none scale-110" 
                style={{ 
                    backgroundImage: 'url("/images/hero-pattern.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} 
            />
            
            {/* Funny Floating Illustrations */}
            <div className="absolute top-[10%] -left-10 w-40 h-40 opacity-20 hover:opacity-50 transition-opacity hidden xl:block animate-pulse pointer-events-none">
                <img src="/images/cartoon-wealth.png" alt="Humor 1" className="rotate-[-15deg]" />
            </div>
            <div className="absolute top-[15%] -right-10 w-56 h-56 opacity-20 hover:opacity-50 transition-opacity hidden xl:block animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
                <img src="/images/cartoon-transparency.png" alt="Humor 2" className="rotate-[12deg]" />
            </div>
            
            <div className="container-app relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-8 animate-fade-in delay-100">
                    <div className="mb-3 flex justify-center">
                        <div className="px-3 py-1 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] text-[10px] font-black uppercase tracking-widest border border-[var(--color-accent-blue)]/20 shadow-sm">
                           🎯 MISSION: CLEAN ASSEMBLY 2026
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2">
                        <span className="block text-[var(--color-text-secondary)] text-sm sm:text-base font-bold mb-1">
                            தமிழ்நாடு உங்களை அழைக்கிறது
                        </span>
                        Tamil Nadu's Election
                        <span className="block text-[var(--color-accent-blue)]">Hall of Records</span>
                    </h1>
                    <div className="flex flex-col items-center mt-3">
                         <p className="text-base sm:text-lg text-[var(--color-text-secondary)] italic max-w-lg leading-snug">
                            "1,045 candidates. Some impressive. Some... well, let's just say they have 'big personalities'."
                         </p>
                         <div className="mt-2 flex gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-tertiary)] opacity-60">
                             <span>#DataMeetsHumor</span>
                             <span>•</span>
                             <span>#VoterIsKing</span>
                             <span>•</span>
                             <span>#TN2026</span>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div 
                            key={card.id}
                            className={`card p-6 flex flex-col justify-between group animate-slide-up opacity-0 border-t-4 ${card.borderColor} ${card.bgColor} hover:bg-white`}
                            style={{ animationDelay: `${200 + (i * 100)}ms`, animationFillMode: "forwards" }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        {card.icon}
                                    </div>
                                </div>
                                
                                <h3 className="text-xs font-black tracking-widest uppercase text-[var(--color-text-tertiary)] flex flex-col gap-1 mb-3">
                                    <span>{card.title}</span>
                                    <span className="text-tamil text-[10px]">{card.titleTa}</span>
                                </h3>
                                
                                <p className="text-2xl font-black mb-4 min-h-[4rem] flex items-center">
                                    {card.value}
                                </p>
                                
                                <div className="border-l-2 border-[var(--color-border)] pl-3 py-0.5 mb-4">
                                    <p className="font-bold text-xs text-[var(--color-text-primary)]">{card.name}</p>
                                    <p className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{card.party}</p>
                                </div>
                                
                                <div className="bg-black/5 rounded-lg p-2.5 mb-4 relative">
                                    <p className="text-[10px] font-medium italic text-center">
                                        {card.humorEn}
                                    </p>
                                </div>
                            </div>
                            
                            <Link href={`/constituency/${card.slug}`} className="block w-full text-center py-2 rounded-lg bg-white border border-[var(--color-border-light)] text-[10px] font-bold hover:bg-[var(--color-accent-blue)] hover:text-white transition-all">
                                VIEW CANDIDATE
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
