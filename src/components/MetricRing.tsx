"use client";

import { ExternalLink } from "lucide-react";

interface MetricRingProps {
    value: number;
    max: number;
    label: string;
    displayValue: string;
    color: string;
    size?: number;
    href?: string;
}

export default function MetricRing({ value, max, label, displayValue, color, size = 80, href }: MetricRingProps) {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(value / max, 1);
    const offset = circumference - percentage * circumference;

    // Scale font size based on ring size and text length
    const baseFontSize = size * 0.17;
    const fontSize = displayValue.length > 5 ? Math.min(baseFontSize, 11) : baseFontSize;

    const labelElement = href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] sm:text-xs text-[var(--color-text-tertiary)] font-medium text-center leading-tight hover:text-[var(--color-accent-blue)] transition-colors inline-flex items-center gap-0.5"
            style={{ textDecoration: "none" }}
            title={`View source for ${label}`}
        >
            {label}
            <ExternalLink size={8} strokeWidth={2.5} className="opacity-50 shrink-0" />
        </a>
    ) : (
        <span className="text-[9px] sm:text-xs text-[var(--color-text-tertiary)] font-medium text-center leading-tight">
            {label}
        </span>
    );

    return (
        <div className="flex flex-col items-center gap-1.5" style={{ minWidth: size }}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="metric-ring" width={size} height={size}>
                    <circle
                        className="metric-ring-track"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                    />
                    <circle
                        className="metric-ring-fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            "--ring-circumference": circumference,
                            "--ring-offset": offset,
                        } as React.CSSProperties}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center px-1">
                    <span
                        className="font-semibold text-center leading-none whitespace-nowrap"
                        style={{ color, letterSpacing: "-0.02em", fontSize: `${fontSize}px` }}
                    >
                        {displayValue}
                    </span>
                </div>
            </div>
            {labelElement}
        </div>
    );
}
