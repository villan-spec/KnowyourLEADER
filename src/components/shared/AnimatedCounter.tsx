"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    formatValue?: (val: number) => string;
}

export default function AnimatedCounter({ value, duration = 2000, formatValue }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    let startTime: number;
                    const animate = (currentTime: number) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        // Easing function: easeOutExpo
                        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        setCount(Math.floor(easeOutExpo * value));
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(value);
                            setHasAnimated(true);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [value, duration, hasAnimated]);

    return (
        <span ref={elementRef}>
            {formatValue ? formatValue(count) : count.toLocaleString()}
        </span>
    );
}
