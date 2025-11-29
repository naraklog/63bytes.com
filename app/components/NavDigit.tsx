"use client";

import { forwardRef } from "react";
import { MorphingText } from "./MorphingText";

type NavDigitProps = {
	/** The word form of the digit (e.g., "six", "three") */
	label: string;
	/** The numeric form of the digit (e.g., "6", "3") */
	digit: string;
	/** Whether the flicker animation is currently playing */
	isFlickerPhase: boolean;
	/** Whether the morph animation is active */
	isMorphActive: boolean;
	/** Current progress of the morph animation (0-1) */
	morphProgress: number;
	/** Alignment of the digit */
	align: "left" | "right";
	/** CSS class for flicker animation targeting */
	flickerClass: string;
	/** Whether to inject SVG filters (for MorphingText) */
	injectFilters?: boolean;
	/** Blur strength for small screens */
	isSmallScreen?: boolean;
};

/**
 * A component that renders a single navbar digit with flicker and morph animations.
 * Handles three states: flickering text, morphing animation, and static digit.
 */
const NavDigit = forwardRef<HTMLSpanElement, NavDigitProps>(
	({ label, digit, isFlickerPhase, isMorphActive, morphProgress, align, flickerClass, injectFilters = true, isSmallScreen = false }, ref) => {
		const blurStrength = isSmallScreen ? 2 : 8;

		// Render flickering letters during flicker phase
		if (isFlickerPhase) {
			return (
				<span ref={ref} className="font-sans text-off-white text-[clamp(2rem,6vw,5rem)] leading-none">
					{label.split("").map((char, i) => (
						<span key={i} className={flickerClass} style={{ display: "inline-block", opacity: 0 }}>
							{char}
						</span>
					))}
				</span>
			);
		}

		// Render morphing text during morph phase
		if (isMorphActive) {
			return (
				<span ref={ref} className="font-sans text-off-white text-[clamp(2rem,6vw,5rem)] leading-none">
					<MorphingText textFrom={label} textTo={digit} progress={morphProgress} layout="inline" align={align} color="inherit" injectFilters={injectFilters} blurStrength={blurStrength} />
				</span>
			);
		}

		// Render static digit
		return (
			<span ref={ref} className="font-sans text-off-white text-[clamp(2rem,6vw,5rem)] leading-none">
				{digit}
			</span>
		);
	}
);

NavDigit.displayName = "NavDigit";

export default NavDigit;

