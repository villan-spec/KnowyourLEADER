"use client";

interface MetricRingProps {
    value: number;
    max: number;
    label: string;
    displayValue: string;
    color: string;
    size?: number;
}

export default function MetricRing({ value, max, label, displayValue, color, size = 80 }: MetricRingProps) {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(value / max, 1);
    const offset = circumference - percentage * circumference;

    return (
        <div className="flex flex-col items-center gap-1.5">
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold" style={{ color, letterSpacing: "-0.02em" }}>
                        {displayValue}
                    </span>
                </div>
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)] font-medium text-center leading-tight">
                {label}
            </span>
        </div>
    );
}
