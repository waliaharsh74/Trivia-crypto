import React, { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";

interface FancyButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const FancyButton: React.FC<FancyButtonProps> = ({ children, onClick, className = "",disabled }) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const flairRef = useRef<HTMLSpanElement | null>(null);

    const xSet = useRef<((value: number) => void) | null>(null);
    const ySet = useRef<((value: number) => void) | null>(null);

    useEffect(() => {
        const button = buttonRef.current;
        const flair = flairRef.current;

        if (!button || !flair || disabled) return;

        xSet.current = gsap.quickSetter(flair, "xPercent") as (value: number) => void;
        ySet.current = gsap.quickSetter(flair, "yPercent") as (value: number) => void;

        const getXY = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = gsap.utils.pipe(
                gsap.utils.mapRange(0, rect.width, 0, 100),
                gsap.utils.clamp(0, 100)
            )(e.clientX - rect.left);

            const y = gsap.utils.pipe(
                gsap.utils.mapRange(0, rect.height, 0, 100),
                gsap.utils.clamp(0, 100)
            )(e.clientY - rect.top);

            return { x, y };
        };

        const handleEnter = (e: MouseEvent) => {
            const { x, y } = getXY(e);
            xSet.current?.(x);
            ySet.current?.(y);
            gsap.to(flair, {
                scale: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        };

        const handleMove = (e: MouseEvent) => {
            const { x, y } = getXY(e);
            gsap.to(flair, {
                xPercent: x,
                yPercent: y,
                duration: 0.4,
                ease: "power2",
            });
        };

        const handleLeave = (e: MouseEvent) => {
            const { x, y } = getXY(e);
            gsap.killTweensOf(flair);
            gsap.to(flair, {
                xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
                yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
                scale: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        button.addEventListener("mouseenter", handleEnter);
        button.addEventListener("mousemove", handleMove);
        button.addEventListener("mouseleave", handleLeave);

        return () => {
            button.removeEventListener("mouseenter", handleEnter);
            button.removeEventListener("mousemove", handleMove);
            button.removeEventListener("mouseleave", handleLeave);
        };
    }, [disabled]);

    return (
        <button
            ref={buttonRef}
            onClick={disabled ? undefined : onClick}
            className={`relative inline-flex items-center justify-center px-6 py-3 text-[#f7f7d9] font-semibold text-lg border-2 border-[#f7f7d9] rounded-full overflow-hidden transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-black"
                } ${className}`}
            disabled={disabled}
        >
           { !disabled &&<span
                ref={flairRef}
                className="absolute inset-0 scale-0 pointer-events-none will-change-transform origin-top-left"
            >
                <span className="absolute top-0 left-0 w-[170%] aspect-square bg-[#f7f7d9] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            </span>}
            <span className="relative z-10">{children}</span>
        </button>
    );
};

export default FancyButton;
