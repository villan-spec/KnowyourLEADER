"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "disclaimerSeen";

export default function DisclaimerModal() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setVisible(true);
        }
    }, []);

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
        >
            <div
                className="disclaimer-card relative w-full max-w-lg bg-white/90 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <X size={16} strokeWidth={2.5} className="text-gray-500" />
                </button>

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 pr-8">
                        Know Your Leader
                    </h2>

                    {/* English Section */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1.5 tracking-wide uppercase">
                            Goal
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600">
                            Most of us vote for a Chief Minister and ignore our local MLA.
                            This independent tool changes the game. Compare your candidates
                            using objective facts—from criminal records to assets and local
                            promises. Don&apos;t just follow the crowd; choose the person who
                            will actually serve your neighborhood.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5" />

                    {/* Tamil Section */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1.5 text-tamil">
                            நோக்கம்:
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600 text-tamil">
                            பெரிய தலைவர்களைப் பார்த்து ஓட்டு போடுறது சரிதான், ஆனா நம்ம
                            ஊர் பிரச்சினையைத் தீர்க்கப்போறது நம்ம ஊர் M.L.A தான். அவங்க
                            கொடுத்த வாக்குறுதி என்ன? பின்னணி என்ன? எல்லாத்தையும் இங்கே
                            ஒப்பிட்டுப் பார்த்துட்டு அப்புறம் ஓட்டுப் போடுங்க.
                        </p>
                    </div>

                    {/* Legal Footer */}
                    <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
                        *Data is aggregated from media reports and official ECI affidavits.
                        Not affiliated with any political party or the government.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={dismiss}
                        className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                            boxShadow: "0 4px 15px rgba(15, 52, 96, 0.3)",
                        }}
                    >
                        I Understand / நான் புரிந்துகொண்டேன்
                    </button>
                </div>
            </div>

            <style jsx>{`
                .disclaimer-card {
                    animation: modal-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes modal-enter {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
