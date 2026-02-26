"use client";

import { Constituency } from "@/lib/data";
import { useState } from "react";

interface SeatMatrixProps {
    constituencies: Constituency[];
    candidateMap: Record<string, { partyColor: string; party: string }>;
    onSeatClick: (id: string) => void;
}

export default function SeatMatrix({ constituencies, candidateMap, onSeatClick }: SeatMatrixProps) {
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

    return (
        <div className="card-glass p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold">234 Seat Matrix</h3>
                    <p className="text-xs text-secondary">Live grid of Tamil Nadu assembly seats</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-dmk" />
                        <span className="text-[10px] font-bold">DMK</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-aiadmk" />
                        <span className="text-[10px] font-bold">AIADMK</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-bjp" />
                        <span className="text-[10px] font-bold">BJP</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-13 gap-1 md:gap-1.5">
                {constituencies.map((c) => {
                    const candidate = candidateMap[c.id];
                    const color = candidate ? candidate.partyColor : "rgba(0,0,0,0.05)";

                    return (
                        <button
                            key={c.id}
                            onMouseEnter={() => setHoveredSeat(c.name)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            onClick={() => onSeatClick(c.id)}
                            className="aspect-square rounded-[2px] md:rounded-[4px] transition-all duration-200 hover:scale-125 hover:z-10 focus:outline-none"
                            style={{ backgroundColor: color }}
                            title={c.name}
                        />
                    );
                })}
            </div>

            {hoveredSeat && (
                <div className="mt-4 text-center animate-fade-in">
                    <span className="text-xs font-bold text-accent-blue bg-accent-blue/5 px-3 py-1 rounded-full uppercase tracking-widest">
                        {hoveredSeat}
                    </span>
                </div>
            )}
        </div>
    );
}
