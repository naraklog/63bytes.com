"use client";

import { forwardRef, useRef, useEffect } from "react";
import { MorphingText, MorphingTextHandle } from "./MorphingText";
import { useLayoutContext } from "../context/LayoutContext";

type NavDigitProps = {
	/** The word form of the digit (e.g., "six", "three") */
	label: string;
	/** The numeric form of the digit (e.g., "6", "3") */
	digit: string;
	/** Whether the flicker animation is currently playing */
	isFlickerPhase: boolean;
	/** Whether the morph animation is active */
	isMorphActive: boolean;
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
 * 
 * Uses imperative updates for scroll progress to avoid React re-renders on every frame.
 */
const NavDigit = forwardRef<HTMLSpanElement, NavDigitProps>(
	({ label, digit, isFlickerPhase, isMorphActive, align, flickerClass, injectFilters = true, isSmallScreen = false }, ref) => {
		const blurStrength = isSmallScreen ? 2 : 8;
		const morphingTextRef = useRef<MorphingTextHandle>(null);
		const { subscribe, getSnapshot } = useLayoutContext();

		// Subscribe to progress updates and imperatively update MorphingText
		useEffect(() => {
			if (!isMorphActive) return;

			// Set initial progress
			const initialState = getSnapshot();
			morphingTextRef.current?.setProgress(initialState.progress);

			const unsubscribe = subscribe((state) => {
				morphingTextRef.current?.setProgress(state.progress);
			});

			return unsubscribe;
		}, [isMorphActive, subscribe, getSnapshot]);

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
					<MorphingText
						ref={morphingTextRef}
						textFrom={label}
						textTo={digit}
						layout="inline"
						align={align}
						color="inherit"
						injectFilters={injectFilters}
						blurStrength={blurStrength}
					/>
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
