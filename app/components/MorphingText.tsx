"use client";

import { useEffect, useRef, useMemo } from "react";

interface MorphingTextProps {
	textFrom: string;
	textTo: string;
	progress: number;
	className?: string;
	color?: string;
	opacity?: number;
	filterMode?: "auto" | "always" | "never";
	layout?: "block" | "inline";
	align?: "left" | "right" | "center";
	injectFilters?: boolean;
	blurStrength?: number;
}

// Generate unique ID for filters to avoid collisions
const useUniqueId = (prefix: string) => {
	const id = useMemo(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`, [prefix]);
	return id;
};

export const MorphingText: React.FC<MorphingTextProps> = ({
	textFrom,
	textTo,
	progress,
	className,
	color = "var(--off-white)",
	opacity = 1,
	filterMode = "auto",
	layout = "block",
	align = "left",
	injectFilters: _injectFilters = true, // Kept for API compatibility, but now handled internally per instance
	blurStrength = 8,
}) => {
	const filterId = useUniqueId("morph-filter");
	const blur1Id = useUniqueId("blur1");
	const blur2Id = useUniqueId("blur2");

	void _injectFilters;

	const text1Ref = useRef<SVGTextElement>(null);
	const text2Ref = useRef<SVGTextElement>(null);

	// Refs for filter primitives
	const matrixRef = useRef<SVGFEColorMatrixElement>(null);
	const blur1Ref = useRef<SVGFEGaussianBlurElement>(null);
	const blur2Ref = useRef<SVGFEGaussianBlurElement>(null);

	// Update styles based on progress
	useEffect(() => {
		if (!text1Ref.current || !text2Ref.current) return;
		const el1 = text1Ref.current;
		const el2 = text2Ref.current;

		// Update text content
		if (el1.textContent !== textFrom) el1.textContent = textFrom;
		if (el2.textContent !== textTo) el2.textContent = textTo;

		const fraction = progress;

		// Ensure refs are available
		if (!blur1Ref.current || !blur2Ref.current) return;

		if (fraction <= 0) {
			blur1Ref.current.setAttribute("stdDeviation", "0");
			el1.style.opacity = "1";
			blur2Ref.current.setAttribute("stdDeviation", "0");
			el2.style.opacity = "0";
			return;
		}

		if (fraction >= 1) {
			blur1Ref.current.setAttribute("stdDeviation", "0");
			el1.style.opacity = "0";
			blur2Ref.current.setAttribute("stdDeviation", "0");
			el2.style.opacity = "1";
			return;
		}

		const blur2Val = Math.min(blurStrength / fraction - blurStrength, 100);
		const opacity2 = Math.pow(fraction, 0.4);
		blur2Ref.current.setAttribute("stdDeviation", `${blur2Val} 0`); // Horizontal blur only looks better for text sometimes, but using uniform for consistency
		// Actually, standard CSS blur is uniform. Let's use uniform stdDeviation.
		blur2Ref.current.setAttribute("stdDeviation", blur2Val.toString());
		el2.style.opacity = opacity2.toString();

		const invertedFraction = 1 - fraction;
		const blur1Val = Math.min(blurStrength / invertedFraction - blurStrength, 100);
		const opacity1 = Math.pow(invertedFraction, 0.4);
		blur1Ref.current.setAttribute("stdDeviation", blur1Val.toString());
		el1.style.opacity = opacity1.toString();
	}, [progress, textFrom, textTo, blurStrength]);

	// Update threshold filter
	useEffect(() => {
		const feColorMatrix = matrixRef.current;
		if (!feColorMatrix) return;

		let multiplier = 255;
		let offset = -100;
		const transitionDuration = 0.05;

		if (filterMode === "auto") {
			if (progress < transitionDuration) {
				const p = progress / transitionDuration;
				multiplier = 1 + p * 254;
				offset = p * -100;
			} else if (progress > 1 - transitionDuration) {
				const p = (1 - progress) / transitionDuration;
				multiplier = 1 + p * 254;
				offset = p * -100;
			}
		}

		const values = `1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${multiplier} ${offset}`;
		feColorMatrix.setAttribute("values", values.replace(/\s+/g, " "));
	}, [progress, filterMode]);

	const isThresholdActive = filterMode === "always" || (filterMode === "auto" && progress > 0 && progress < 1);
	const isInline = layout === "inline";

	// For SVG implementation, we use a container div that holds the SVG
	// This maintains the layout behavior while using SVG for rendering
	const baseClass = isInline
		? "relative inline-block leading-none antialiased align-top"
		: "relative mx-auto h-16 w-full max-w-screen-md text-center font-sans text-[40pt] font-bold leading-none antialiased md:h-24 lg:text-[6rem]";

	// Calculate approximate width for inline layout
	const inlineSizerText = textFrom.length >= textTo.length ? textFrom : textTo;

	// Alignment for SVG text
	let textAnchor: "start" | "middle" | "end" = "start";
	let xPos = "0%";

	if (align === "center") {
		textAnchor = "middle";
		xPos = "50%";
	} else if (align === "right") {
		textAnchor = "end";
		xPos = "100%";
	}

	// Common text props
	const textProps = {
		x: xPos,
		y: "50%",
		dy: ".39em", // Vertical center adjustment
		textAnchor,
		fill: "currentColor",
		style: { willChange: "opacity", fontKerning: "none" } as React.CSSProperties,
	};

	return (
		<div className={`${baseClass} ${className}`} style={{ color, opacity }}>
			{/* Hidden sizer for inline layout to maintain width */}
			{isInline && (
				<span aria-hidden="true" className="invisible block whitespace-pre">
					{inlineSizerText}
				</span>
			)}

			<svg
				width="100%"
				height="100%"
				className={`absolute inset-0 overflow-visible ${isInline ? "" : "mx-auto"}`}
				style={{
					// We apply the threshold filter to the entire group.
					// But individual blurs are now handled by separate filters on the text elements.
					// Wait, we need the threshold to apply AFTER the blurs.
					// So we can keep the container filter, and inside we use text elements with their own blur filters.
					filter: isThresholdActive ? `url(#${filterId})` : "none",
					// Force hardware acceleration for Safari
					transform: "translate3d(0,0,0)",
					WebkitTransform: "translate3d(0,0,0)",
				}}
			>
				<defs>
					<filter id={filterId}>
						<feColorMatrix ref={matrixRef} in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -100" />
					</filter>
					<filter id={blur1Id}>
						<feGaussianBlur ref={blur1Ref} in="SourceGraphic" stdDeviation="0" />
					</filter>
					<filter id={blur2Id}>
						<feGaussianBlur ref={blur2Ref} in="SourceGraphic" stdDeviation="0" />
					</filter>
				</defs>

				<text ref={text1Ref} {...textProps} filter={`url(#${blur1Id})`} />
				<text ref={text2Ref} {...textProps} filter={`url(#${blur2Id})`} />
			</svg>
		</div>
	);
};
