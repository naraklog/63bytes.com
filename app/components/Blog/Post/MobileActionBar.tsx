"use client";

import { createPortal } from "react-dom";
import { HouseIcon, TreeViewIcon, MoonIcon, SunIcon, DotsThreeOutlineIcon, BooksIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import TransitionLink from "../../TransitionLink";
import { BLOG_FONT_FAMILY } from "./constants";
import { useScrollDirection } from "../../../hooks";

type MobileActionBarProps = {
	isDarkMode: boolean;
	hasOutlineItems: boolean;
	isOutlineOpen: boolean;
	onToggleTheme: () => void;
	onToggleOutline: () => void;
};

const ICON_SIZE = 18;

export default function MobileActionBar({ isDarkMode, hasOutlineItems, isOutlineOpen, onToggleTheme, onToggleOutline }: MobileActionBarProps) {
	const { scrollDirection, setScrollDirection } = useScrollDirection({ upThreshold: 100 });
	const isCollapsed = scrollDirection === "down";

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
									onClick={onToggleTheme}
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
										<button type="button" onClick={onToggleOutline} className="flex items-center" aria-pressed={isOutlineOpen} aria-label="Toggle page outline">
											<TreeViewIcon size={ICON_SIZE} weight="duotone" />
											<span className="sr-only">Toggle page outline</span>
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
