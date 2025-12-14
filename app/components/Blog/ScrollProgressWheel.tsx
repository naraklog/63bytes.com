"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollProgressWheelProps {
	progress: number;
	onScrub: (progress: number) => void;
	isDarkMode?: boolean;
	theme?: {
		text?: string;
		muted?: string;
		bg?: string;
		border?: string;
	};
}

export function ScrollProgressWheel({ progress, onScrub, isDarkMode, theme }: ScrollProgressWheelProps) {
	const [showTimeline, setShowTimeline] = useState(false);
	const timelineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isDragging = useRef(false);

	// Show timeline when scrolling or hovering
	useEffect(() => {
		if (isDragging.current) {
			setShowTimeline(true);
			if (timelineTimeoutRef.current) {
				clearTimeout(timelineTimeoutRef.current);
				timelineTimeoutRef.current = null;
			}
			return;
		}

		// When progress changes significantly (scrolling), show timeline
		// We can't easily detect "scrolling" event here without passing it in,
		// but checking if progress changed recently works.
		setShowTimeline(true);

		if (timelineTimeoutRef.current) {
			clearTimeout(timelineTimeoutRef.current);
		}

		timelineTimeoutRef.current = setTimeout(() => {
			if (!isDragging.current) {
				setShowTimeline(false);
			}
		}, 2000);

		return () => {
			if (timelineTimeoutRef.current) {
				clearTimeout(timelineTimeoutRef.current);
			}
		};
	}, [progress]);

	// Generate 100 ticks for 1% intervals
	const ticks = Array.from({ length: 101 }, (_, i) => ({
		value: i,
		position: i / 100, // 0 to 1
	}));

	const handleInteractionStart = (y: number, rect: DOMRect) => {
		isDragging.current = true;
		setShowTimeline(true);
		if (timelineTimeoutRef.current) {
			clearTimeout(timelineTimeoutRef.current);
			timelineTimeoutRef.current = null;
		}

		const percentage = Math.max(0, Math.min(1, y / rect.height));
		onScrub(percentage);
	};

	const handleInteractionMove = (y: number, rect: DOMRect) => {
		if (!isDragging.current) return;
		const percentage = Math.max(0, Math.min(1, y / rect.height));
		onScrub(percentage);
	};

	const handleInteractionEnd = () => {
		isDragging.current = false;
		// Start hide timer
		timelineTimeoutRef.current = setTimeout(() => {
			setShowTimeline(false);
		}, 2000);
	};

	return (
		<motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="contents">
			<div
				className={`fixed right-4 top-1/2 -translate-y-1/2 h-[70%] flex flex-col items-end select-none z-50 transition-opacity duration-300 ${
					showTimeline ? "opacity-100" : "opacity-0 md:opacity-0" // Hidden when not active
				}`}
				onMouseEnter={() => {
					setShowTimeline(true);
					if (timelineTimeoutRef.current) {
						clearTimeout(timelineTimeoutRef.current);
						timelineTimeoutRef.current = null;
					}
				}}
				onMouseLeave={() => {
					if (!isDragging.current) {
						timelineTimeoutRef.current = setTimeout(() => {
							setShowTimeline(false);
						}, 2000);
					}
				}}
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
				<div className="relative h-full w-24 cursor-pointer">
					{/* Ticks at 1% intervals */}
					{ticks.map((tick) => {
						const isMajor = tick.value % 10 === 0;
						const isMinor = !isMajor;

						// Skip some minor ticks if it gets too crowded?
						// 100 ticks in 70vh (~700px) is 7px per tick. That's fine.

						// Highlight nearby ticks
						const dist = Math.abs(progress - tick.position);
						const isActive = dist < 0.005; // Exact match roughly

						return (
							<div key={`tick-${tick.value}`} className="absolute right-0 flex items-center justify-end" style={{ top: `${tick.position * 100}%`, transform: "translateY(-50%)" }}>
								{/* Major ticks (10%) */}
								{isMajor && <div className={`h-px bg-current opacity-20 w-3 transition-all duration-300`} />}

								{/* Minor ticks (1%) - Visual only */}
								{isMinor && <div className={`h-px bg-current opacity-10 w-1.5 transition-all duration-300`} />}
							</div>
						);
					})}

					{/* Active Indicator / Handle */}
					{/* We iterate again to draw the active state on top or transform ticks? 
					    TimeMachine draws separate "Post tick marks". 
					    Here we just have one current position indicator. 
					*/}
					<div className="absolute right-0 flex items-center justify-end pointer-events-none" style={{ top: `${progress * 100}%`, transform: "translateY(-50%)" }}>
						<motion.div
							animate={{
								width: 32,
								height: 2,
								backgroundColor: "currentColor", // "rgba(0,0,0,0.8)"
								opacity: 0.8,
							}}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						/>
					</div>

					{/* Floating active label */}
					<motion.div
						className="absolute right-10 pointer-events-none"
						style={{ top: `${progress * 100}%`, transform: "translateY(-50%)" }}
						transition={{ type: "spring", stiffness: 800, damping: 35 }}
					>
						<span
							className={`text-xs font-medium font-mono px-2 py-1 border border-current/20 rounded-sm backdrop-blur-sm whitespace-nowrap ${
								isDarkMode ? "bg-black/80 text-white" : "bg-white/80 text-black"
							}`}
						>
							{Math.round(progress * 100)}%
						</span>
					</motion.div>
				</div>

				{/* Labels: Start / End */}
				<div
					className={`absolute top-0 right-10 -translate-y-1/2 text-[10px] font-medium font-mono px-2 py-0.5 border border-current/20 rounded-sm backdrop-blur-sm transition-opacity duration-200 ${
						isDarkMode ? "bg-black/90 text-white" : "bg-white/90 text-black"
					} ${progress < 0.1 ? "opacity-0" : "opacity-100"}`}
				>
					Start
				</div>
				<div
					className={`absolute bottom-0 right-10 translate-y-1/2 text-[10px] font-mono px-2 py-0.5 border border-current/20 rounded-sm backdrop-blur-sm transition-opacity duration-200 ${
						isDarkMode ? "bg-black/90 text-white" : "bg-white/90 text-light-gray"
					} ${progress > 0.9 ? "opacity-0" : "opacity-100"}`}
				>
					End
				</div>
			</div>
		</motion.div>
	);
}
