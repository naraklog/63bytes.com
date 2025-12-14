"use client";

import { createPortal } from "react-dom";
import { memo, useEffect, useRef } from "react";
import { HouseIcon, MoonIcon, SunIcon, DotsThreeOutlineIcon, BooksIcon, SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import TransitionLink from "../../TransitionLink";
import { BLOG_FONT_FAMILY } from "./constants";
import { useScrollDirection, useMediaQuery } from "../../../hooks";
import { useSound } from "../../../context/SoundContext";

type MobileActionBarProps = {
	isDarkMode: boolean;
	hasOutlineItems: boolean;
	isProgressWheelVisible: boolean;
	onToggleTheme: () => void;
	onToggleProgressWheel: () => void;
};

const ICON_SIZE = 18;

function MobileActionBar({ isDarkMode, hasOutlineItems, isProgressWheelVisible, onToggleTheme, onToggleProgressWheel }: MobileActionBarProps) {
	const { scrollDirection, setScrollDirection } = useScrollDirection({ upThreshold: 100 });
	const { playSound, isMuted, toggleMute } = useSound();
	const isMobile = useMediaQuery("(max-width: 767px)");
	const isFirstRender = useRef(true);

	const isCollapsed = scrollDirection === "down";

	// Play sound when collapsed state changes (but not on initial render)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (isMobile) {
			playSound("hover");
		}
	}, [isCollapsed, isMobile, playSound]);

	if (!isMobile) return null;

	return createPortal(
		<div className="md:hidden fixed bottom-2 left-0 right-0 z-100 flex justify-center px-4" style={{ fontFamily: BLOG_FONT_FAMILY }}>
			<div className="relative">
				<motion.div
					layout
					initial={false}
					transition={{
						layout: {
							type: "spring",
							stiffness: 450,
							damping: 30,
						},
					}}
					className={`flex items-center justify-center shrink-0 border border-light-gray/50 text-off-white backdrop-blur-sm overflow-hidden ${isDarkMode ? "bg-black/50" : "bg-black/90"}`}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						{isCollapsed ? (
							<motion.button
								key="collapsed"
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15, layout: { duration: 0 } }}
								className="px-1.75"
								onClick={() => setScrollDirection("up")}
								onMouseEnter={() => playSound("hover")}
								aria-label="Expand menu"
							>
								<DotsThreeOutlineIcon size={ICON_SIZE} weight="fill" />
							</motion.button>
						) : (
							<motion.div
								key="expanded"
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15, layout: { duration: 0 } }}
								className="flex items-center gap-3 px-3 py-2 font-semi-mono text-sm whitespace-nowrap"
							>
								<TransitionLink href="/" className="flex items-center gap-2 no-underline" transitionLabel="Home" aria-label="Go to homepage">
									<HouseIcon size={ICON_SIZE} weight="duotone" />
									<span className="sr-only">Go to homepage</span>
								</TransitionLink>

								<div className="h-4 w-px shrink-0 bg-light-gray" />

								<TransitionLink href="/blog" className="flex items-center gap-2 no-underline" transitionLabel="All blogs" aria-label="View all blogs">
									<BooksIcon size={ICON_SIZE} weight="duotone" />
									<span className="sr-only">View all blogs</span>
								</TransitionLink>

								<div className="h-4 w-px shrink-0 bg-light-gray" />

								<button
									type="button"
									onClick={() => {
										toggleMute();
									}}
									onMouseEnter={() => playSound("hover")}
									className="flex items-center"
									aria-pressed={!isMuted}
									aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
								>
									{isMuted ? <SpeakerSlashIcon size={ICON_SIZE} weight="duotone" /> : <SpeakerHighIcon size={ICON_SIZE} weight="duotone" />}
									<span className="sr-only">{isMuted ? "Unmute sounds" : "Mute sounds"}</span>
								</button>

								<div className="h-4 w-px shrink-0 bg-light-gray" />

								<button
									type="button"
									onClick={() => {
										playSound("click");
										onToggleTheme();
									}}
									onMouseEnter={() => playSound("hover")}
									className="flex items-center"
									aria-pressed={isDarkMode}
									aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
								>
									{isDarkMode ? <SunIcon size={ICON_SIZE} weight="duotone" /> : <MoonIcon size={ICON_SIZE} weight="duotone" />}
									<span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
								</button>

								{hasOutlineItems && (
									<>
										<div className="h-4 w-px shrink-0 bg-light-gray" />
										<button
											type="button"
											onClick={onToggleProgressWheel}
											onMouseEnter={() => playSound("hover")}
											className="flex items-center"
											aria-pressed={isProgressWheelVisible}
											aria-label="Toggle progress wheel"
										>
											<svg viewBox="4 5 16 14" fill="none" className="h-[18px] w-[18px]">
												<path d="M13.5 18.5L9 18.5M13.5 15.5L9 15.5M13.5 9L9 9M13.5 6L9 6M16.5 12.25L6 12.25" stroke="currentColor" strokeLinecap="square" />
											</svg>
											<span className="sr-only">Toggle progress wheel</span>
										</button>
									</>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</div>,
		document.body
	);
}

export default memo(MobileActionBar);
