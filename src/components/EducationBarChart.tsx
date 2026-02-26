"use client";

interface EducationBarChartProps {
    graduate: number;
    nonGraduate: number;
}

export default function EducationBarChart({ graduate, nonGraduate }: EducationBarChartProps) {
    const total = graduate + nonGraduate;
    const gradWidth = (graduate / total) * 100;
    const nonGradWidth = (nonGraduate / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Education Breakdown</span>
                <span className="text-[11px] font-medium text-secondary">{graduate} Grad / {nonGraduate} Non-Grad</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-black/5">
                <div
                    className="h-full bg-accent-blue transition-all duration-1000 ease-out"
                    style={{ width: `${gradWidth}%` }}
                    title={`Graduates: ${graduate}`}
                />
                <div
                    className="h-full bg-accent-amber opacity-60 transition-all duration-1000 ease-out"
                    style={{ width: `${nonGradWidth}%` }}
                    title={`Non-Graduates: ${nonGraduate}`}
                />
            </div>
            <div className="flex justify-between mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                    <span className="text-[10px] text-secondary">Graduates</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
                    <span className="text-[10px] text-secondary">Others</span>
                </div>
            </div>
        </div>
    );
}
