"use client";

import Link from "next/link";
import { Party, formatAssets } from "@/lib/data";

interface PartyCardProps {
    party: Party;
}

export default function PartyCard({ party }: PartyCardProps) {
    return (
        <Link
            href={`/party/${party.id}`}
            className="group relative overflow-hidden card-glass p-6 min-h-[180px] flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
            {/* Subtle Watermark Logo Background */}
            <div
                className="absolute -right-4 -bottom-8 text-8xl font-black opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500"
                style={{ color: party.color }}
            >
                {party.id}
            </div>

            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1 leading-tight break-words line-clamp-2 min-h-[3.5rem] flex items-center">
                        {party.id}
                    </h2>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider opacity-60">
                        {party.alliance} Alliance
                    </p>
                </div>
                <div
                    className="w-3 h-12 rounded-full"
                    style={{ backgroundColor: party.color }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Clean Roster</p>
                    <p className="text-lg font-semibold text-accent-green">{party.cleanRosterPercentage}%</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">Avg Assets</p>
                    <p className="text-lg font-semibold">{formatAssets(party.averageAssets)}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden mr-3">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${(party.declaredCandidates / party.totalCandidates) * 100}%`,
                            backgroundColor: party.color
                        }}
                    />
                </div>
                <span className="text-[11px] font-bold text-tertiary whitespace-nowrap">
                    {party.declaredCandidates} / {party.totalCandidates}
                </span>
            </div>
        </Link>
    );
}
