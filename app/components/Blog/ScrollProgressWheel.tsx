"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LinearBlur } from "progressive-blur";
import { useSound } from "../../context/SoundContext";

// Article max-width (1080px) + scroll wheel width (~180px on each side) = ~1440px
// Below this width, the scroll wheel overlaps with article content
const BLUR_THRESHOLD_WIDTH = 1440;

export interface SectionMarker {
	id: string;
	title: string;
	level: 2 | 3;
	position: number;
}

interface ScrollProgressWheelProps {
	onScrub: (progress: number) => void;
	onClose?: () => void;
	isDarkMode?: boolean;
	theme?: {
		text?: string;
		muted?: string;
		bg?: string;
		border?: string;
	};
	sections?: SectionMarker[];
}

export function ScrollProgressWheel({ onScrub, onClose, isDarkMode, theme, sections }: ScrollProgressWheelProps) {
	const [progress, setProgress] = useState(0);
	const roundedProgress = Math.round(progress * 100);
	const isDragging = useRef(false);
	const { playSound } = useSound();
	const prevProgressRef = useRef<number | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (isDragging.current) return;
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight;
			const winHeight = window.innerHeight;
			const scrollable = Math.max(1, docHeight - winHeight);
			const scrollPercent = Math.min(1, Math.max(0, scrollTop / scrollable));
			setProgress(scrollPercent);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);
		handleScroll();
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	// Track if scroll wheel overlaps with article content
	const [isOverlapping, setIsOverlapping] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.innerWidth < BLUR_THRESHOLD_WIDTH;
	});

	useEffect(() => {
		const checkOverlap = () => {
			setIsOverlapping(window.innerWidth < BLUR_THRESHOLD_WIDTH);
		};
		checkOverlap();
		window.addEventListener("resize", checkOverlap);
		return () => window.removeEventListener("resize", checkOverlap);
	}, []);

	// Play tick sound on every 10% progress step
	useEffect(() => {
		const currentTenth = Math.floor(roundedProgress / 10);
		// Skip initial render
		if (prevProgressRef.current === null) {
			prevProgressRef.current = currentTenth;
			return;
		}
		// Play tick when crossing a 10% boundary
		if (prevProgressRef.current !== currentTenth) {
			playSound("tick");
			prevProgressRef.current = currentTenth;
		}
	}, [roundedProgress, playSound]);

	// Calculate active section based on scroll progress position
	const activeSection = useMemo(() => {
		if (!sections?.length) return null;

		// Find the last section whose position we've scrolled past
		let active: string | null = null;
		for (const section of sections) {
			if (section.position <= progress) {
				active = section.id;
			} else {
				break; // sections are ordered, so we can stop early
			}
		}
		return active;
	}, [sections, progress]);

	// Generate 100 ticks for 1% intervals
	const ticks = Array.from({ length: 101 }, (_, i) => i);

	// Check if current position overlaps with a section marker
	const isAtSectionMarker = sections?.some((section) => Math.round(section.position * 100) === roundedProgress) ?? false;

	const handleInteractionStart = (y: number, rect: DOMRect) => {
		isDragging.current = true;
		window.dispatchEvent(new CustomEvent("app:scrub-start"));
		const percentage = Math.max(0, Math.min(1, y / rect.height));
		setProgress(percentage);
		onScrub(percentage);
	};

	const handleInteractionMove = (y: number, rect: DOMRect) => {
		if (!isDragging.current) return;
		const percentage = Math.max(0, Math.min(1, y / rect.height));
		setProgress(percentage);
		onScrub(percentage);
	};

	const handleInteractionEnd = () => {
		isDragging.current = false;
		window.dispatchEvent(new CustomEvent("app:scrub-end"));
	};

	// Calculate scale for magnification effect
	const currentPercent = progress * 100;
	const MAX_SCALE = 2;
	const MAJOR_TICK_WIDTH = 16; // w-4 = 16px

	const getScale = (position: number) => {
		const distance = Math.abs(position - currentPercent);
		const range = 6; // Range of effect in percent
		if (distance > range) return 1;

		// Cosine interpolation for smooth bell curve
		const scale = 1 + (MAX_SCALE - 1) * Math.cos((distance / range) * (Math.PI / 2));
		return scale;
	};

	return (
		<motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="contents">
			{/* Clickable backdrop to close wheel when blur is active */}
			{isOverlapping && onClose && <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />}
			{/* Linear blur background for entire right side - only when overlapping with article */}
			{isOverlapping && (
				<div className="fixed right-0 top-0 bottom-0 w-[150%] pointer-events-none z-40">
					<LinearBlur side="right" strength={40} style={{ width: "100%", height: "100%" }} />
				</div>
			)}

			<div
				className="fixed right-4 top-[55%] -translate-y-1/2 h-[85%] flex flex-col items-end select-none z-50"
				onMouseDown={(e) => {
					e.preventDefault();
					const rect = e.currentTarget.getBoundingClientRect();
					handleInteractionStart(e.clientY - rect.top, rect);

					const handleDrag = (moveEvent: MouseEvent) => {
						handleInteractionMove(moveEvent.clientY - rect.top, rect);
					};
					const handleUp = () => {
						handleInteractionEnd();
						window.removeEventListener("mousemove", handleDrag);
						window.removeEventListener("mouseup", handleUp);
					};
					window.addEventListener("mousemove", handleDrag);
					window.addEventListener("mouseup", handleUp);
				}}
				onTouchStart={(e) => {
					if (e.touches.length !== 1) return;
					e.preventDefault(); // Prevent scroll while scrubbing
					const rect = e.currentTarget.getBoundingClientRect();
					handleInteractionStart(e.touches[0].clientY - rect.top, rect);

					const handleTouchDrag = (moveEvent: TouchEvent) => {
						if (moveEvent.touches.length !== 1) return;
						moveEvent.preventDefault();
						handleInteractionMove(moveEvent.touches[0].clientY - rect.top, rect);
					};
					const handleTouchEnd = () => {
						handleInteractionEnd();
						window.removeEventListener("touchmove", handleTouchDrag);
						window.removeEventListener("touchend", handleTouchEnd);
						window.removeEventListener("touchcancel", handleTouchEnd);
					};
					window.addEventListener("touchmove", handleTouchDrag, { passive: false });
					window.addEventListener("touchend", handleTouchEnd);
					window.addEventListener("touchcancel", handleTouchEnd);
				}}
			>
				{/* Timeline track */}
				<div className="relative h-full w-32 cursor-pointer">
					{/* Ticks at 1% intervals */}
					{ticks.map((tick) => {
						const isMajor = tick % 10 === 0;
						const isMinor = !isMajor;
						const isAbove = tick < roundedProgress;
						// Hide tick if there's a section marker at this position
						const hasSection = sections?.some((s) => Math.round(s.position * 100) === tick);
						if (hasSection) return null;

						const scale = getScale(tick);

						return (
							<div
								key={`tick-${tick}`}
								className="absolute right-0 flex items-center justify-end origin-right"
								style={{
									top: `${tick}%`,
									transform: `translateY(-50%) scale(${scale})`,
									zIndex: Math.round(scale * 100),
								}}
							>
								{/* Major ticks (10%) */}
								{isMajor && (
									<div data-morph data-morph-width="20px" data-morph-height="1px" data-morph-align="right" className="group py-2 w-32 flex items-center justify-end cursor-pointer">
										<div className={`h-px bg-current w-4 transition-all duration-300 group-hover:opacity-0 ${isAbove ? "opacity-25" : "opacity-60"}`} />
									</div>
								)}

								{/* Minor ticks (1%) - Visual only */}
								{isMinor && (
									<div data-morph data-morph-width="12px" data-morph-height="1px" data-morph-align="right" className="group py-2 w-32 flex items-center justify-end cursor-pointer">
										<div className={`h-px bg-current w-2 transition-all duration-300 group-hover:opacity-0 ${isAbove ? "opacity-10" : "opacity-25"}`} />
									</div>
								)}
							</div>
						);
					})}

					{/* Section markers */}
					{sections?.map((section) => {
						const isActive = section.id === activeSection;
						const sectionPercent = Math.round(section.position * 100);
						const isAbove = sectionPercent < roundedProgress;

						return (
							<div
								key={section.id}
								className="group absolute right-0 flex items-center justify-end"
								style={{
									top: `${sectionPercent}%`,
									transform: "translateY(-50%)",
									zIndex: 1000,
								}}
							>
								{/* Section tick - more prominent than regular ticks */}
								<div
									data-morph
									data-morph-width={isActive ? "32px" : "20px"}
									data-morph-height="1px"
									data-morph-align="right"
									className="py-4 w-64 flex items-center justify-end cursor-pointer"
								>
									<motion.div
										className="h-px bg-current group-hover:opacity-0"
										animate={{
											width: isActive ? MAJOR_TICK_WIDTH * MAX_SCALE : 16,
											opacity: isActive ? 0.9 : isAbove ? 0.2 : 0.4,
										}}
										transition={{ type: "spring", stiffness: 400, damping: 25 }}
									/>
								</div>
								{/* Section label */}
								<span
									className={`absolute right-12 text-sm font-mono whitespace-nowrap truncate max-w-40 transition-all duration-200 pointer-events-none ${
										section.level === 3 ? "text-[10px] group-hover:text-sm" : ""
									} ${isActive ? "opacity-100 font-medium" : isAbove ? "opacity-30" : "opacity-50"} ${!isActive ? "text-xs group-hover:text-sm" : ""}`}
								>
									{section.title}
								</span>
							</div>
						);
					})}

					{/* Active Indicator / Handle */}
					<div className="absolute right-0 flex items-center justify-end pointer-events-none" style={{ top: `${roundedProgress}%`, transform: "translateY(-50%)" }}>
						<motion.div
							animate={{
								width: MAJOR_TICK_WIDTH * MAX_SCALE,
								height: 2.5,
								backgroundColor: "currentColor",
								opacity: 0.8,
							}}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						/>
					</div>

					{/* Floating active label - hidden when at a section marker */}
					{!isAtSectionMarker && (
						<motion.div
							className="absolute right-12 pointer-events-none"
							style={{ top: `${roundedProgress}%`, transform: "translateY(-50%)" }}
							transition={{ type: "spring", stiffness: 800, damping: 35 }}
						>
							<span className={`text-xs font-medium font-mono whitespace-nowrap ${isDarkMode ? "text-white" : "text-black"}`}>{roundedProgress / 100}</span>
						</motion.div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
