"use client";

import { createPortal } from "react-dom";
import { HouseIcon, BookOpenIcon, BookmarksSimpleIcon, SunIcon, MoonIcon } from "@phosphor-icons/react";
import { RadialBlur } from "progressive-blur";
import TransitionLink from "../../TransitionLink";
import { BLOG_FONT_FAMILY } from "./constants";

type MobileActionBarProps = {
	isDarkMode: boolean;
	hasOutlineItems: boolean;
	isOutlineOpen: boolean;
	onToggleTheme: () => void;
	onToggleOutline: () => void;
};

export default function MobileActionBar({ isDarkMode, hasOutlineItems, isOutlineOpen, onToggleTheme, onToggleOutline }: MobileActionBarProps) {
	return createPortal(
		<div className="md:hidden fixed bottom-4 left-0 right-0 z-100 flex justify-center px-4" style={{ fontFamily: BLOG_FONT_FAMILY }}>
			<div className="relative">
				<RadialBlur
					className="absolute inset-0 pointer-events-none"
					strength={16}
					steps={8}
					falloffPercentage={120}
					style={{ zIndex: -1, marginTop: "-0.75rem", marginBottom: "-0.75rem", marginLeft: "-3.5rem", marginRight: "-3.5rem" }}
				/>
				<div className={`flex items-center gap-6 px-3 py-2 font-semi-mono text-sm shrink-0 ${isDarkMode ? "text-off-white" : "text-black"}`}>
					<TransitionLink href="/" className="flex items-center gap-2 no-underline" transitionLabel="Home" aria-label="Go to homepage">
						<HouseIcon size={20} weight="fill" />
						<span className="sr-only">Go to homepage</span>
					</TransitionLink>
					<TransitionLink href="/blog" className="flex items-center gap-2 no-underline" transitionLabel="All blogs" aria-label="View all blogs">
						<BookOpenIcon size={20} weight="fill" />
						<span className="sr-only">View all blogs</span>
					</TransitionLink>
					<button type="button" onClick={onToggleTheme} className="flex items-center" aria-pressed={isDarkMode} aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
						{isDarkMode ? <SunIcon size={20} weight="fill" /> : <MoonIcon size={20} weight="fill" />}
						<span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
					</button>
					{hasOutlineItems && (
						<button type="button" onClick={onToggleOutline} className="flex items-center" aria-pressed={isOutlineOpen} aria-label="Toggle page outline">
							<BookmarksSimpleIcon size={20} weight="fill" />
							<span className="sr-only">Toggle page outline</span>
						</button>
					)}
				</div>
			</div>
		</div>,
		document.body
	);
}
