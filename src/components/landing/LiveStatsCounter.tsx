"use client";

import AnimatedCounter from "../shared/AnimatedCounter";
import { Users, FileSpreadsheet, Scale, HandCoins, CheckCircle2, AlertCircle } from "lucide-react";

interface LiveStatsCounterProps {
    stats: {
        total_candidates: number;
        total_wealth: number;
        clean_record_count: number;
        heavy_criminal_count: number;
        education_breakdown: {
            phd: number;
            graduate: number;
            high_school: number;
            middle: number;
            primary: number;
            na: number;
        }
    };
}

export default function LiveStatsCounter({ stats }: LiveStatsCounterProps) {
    const schoolsCanBuild = Math.floor(stats.total_wealth / 50000000); // 5 Crore per school
    const dosaPlates = Math.floor(stats.total_wealth / 50); // 50rs per dosa

    const eduTotal = stats.total_candidates || 1;
    const eduItems = [
        { label: "PhD/Postgrad", count: stats.education_breakdown.phd, color: "bg-blue-500" },
        { label: "Graduate", count: stats.education_breakdown.graduate, color: "bg-green-500" },
        { label: "High School", count: stats.education_breakdown.high_school, color: "bg-yellow-500" },
        { label: "Middle School", count: stats.education_breakdown.middle, color: "bg-[var(--color-tn-coffee)]" },
        { label: "Primary/Below", count: stats.education_breakdown.primary, color: "bg-red-400" },
        { label: "Not Available", count: stats.education_breakdown.na, color: "bg-gray-400" },
    ];

    return (
        <section className="py-8 relative z-10">
            <div className="container-app">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black flex justify-center items-center gap-2">
                        <FileSpreadsheet className="text-[var(--color-accent-blue)]" />
                        TAMIL NADU 2026: BY THE NUMBERS
                    </h2>
                    <p className="text-tamil text-[var(--color-text-secondary)] mt-1 italic font-semibold text-sm">
                        இலக்கங்களில் பார்ப்போம்
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Total Candidates */}
                    <div className="card-glass p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                            <Users size={200} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Total Candidates</p>
                            <h3 className="text-4xl sm:text-5xl font-black text-[var(--color-accent-blue)]">
                                <AnimatedCounter value={stats.total_candidates} />
                            </h3>
                        </div>
                        <div className="mt-4 border-t border-[var(--color-border-light)] pt-4">
                            <p className="font-medium text-xs text-[var(--color-text-secondary)]">Across 234 seats • 38 districts</p>
                        </div>
                    </div>

                    {/* Total Wealth */}
                    <div className="card-glass p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                            <HandCoins size={200} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Total Declared Wealth</p>
                            <h3 className="text-4xl sm:text-5xl font-black text-[var(--color-tn-temple)] font-mono">
                                ₹<AnimatedCounter value={Math.floor(stats.total_wealth / 10000000)} />
                                <span className="text-xl sm:text-2xl"> Cr</span>
                            </h3>
                        </div>
                        <div className="mt-4 border-t border-[var(--color-border-light)] pt-4">
                            <p className="font-semibold text-xs"> Enough to build {schoolsCanBuild.toLocaleString()} new schools.</p>
                            <div className="flex items-center gap-1.5 text-tamil text-[10px] text-[var(--color-text-secondary)] italic mt-0.5">
                                <span>Or buy {dosaPlates.toLocaleString()} Saravana Bhavan dosa plates</span>
                                <HandCoins size={10} />
                            </div>
                        </div>
                    </div>

                    {/* Clean Records */}
                    <div className="card-glass p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative col-span-1 md:col-span-2">
                        <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                            <FileSpreadsheet size={200} />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Verified Clean Records</p>
                            <h3 className="text-5xl sm:text-6xl font-black text-[var(--color-accent-green)]">
                                <AnimatedCounter value={stats.clean_record_count} />
                                <span className="text-xl text-[var(--color-text-tertiary)] ml-2">
                                    ({Math.round((stats.clean_record_count / stats.total_candidates) * 100)}%)
                                </span>
                            </h3>
                            <div className="mt-3 flex items-center justify-center gap-2 font-black text-[10px] text-[var(--color-accent-green)] uppercase tracking-widest">
                                <span>Verified No Criminal Cases</span>
                                <CheckCircle2 size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education Chart */}
                <div className="card-glass p-6 sm:p-8 mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-6 text-center">Education Breakdown</p>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {eduItems.filter(item => item.count > 0).map((item, idx) => {
                            const percent = Math.round((item.count / eduTotal) * 100);
                            return (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="w-1/3 text-xs sm:text-sm font-semibold">{item.label}</div>
                                    <div className="w-full sm:w-2/3 flex items-center gap-3">
                                        <div className="h-3 bg-[var(--color-border-light)] rounded-full flex-grow overflow-hidden">
                                            <div 
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.max(2, percent)}%` }}
                                                title={`${percent}%`}
                                            />
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold min-w-[60px] text-right">
                                            {item.count} <span className="text-[var(--color-text-tertiary)]">({percent}%)</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
