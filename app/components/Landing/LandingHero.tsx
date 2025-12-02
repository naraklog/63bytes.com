"use client";

import { TerminalIcon } from "@phosphor-icons/react";
import { ScrambleText } from "../ScrambleText";
import { CONTENT } from "../../utils/content";
import { useSound } from "../../context/SoundContext";

type LandingHeroProps = {
	isLoaded: boolean;
};

export function LandingHero({ isLoaded }: LandingHeroProps) {
	const { playSound } = useSound();

	return (
		<div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-12 w-full max-w-2xl">
			<h1 className="text-sm md:text-lg font-sans tracking-tighter leading-tighter text-off-white/70">
				<ScrambleText text={CONTENT.hero.tagline} scrambleOnMount={isLoaded} />
			</h1>

			<div className="flex flex-col gap-4 w-full">
				<div className="w-full h-px bg-light-gray/20" />
				<div className="flex justify-between items-center text-xs md:text-sm font-mono text-off-white/60 tracking-tighter uppercase">
					<span className="flex items-center gap-2">
						<TerminalIcon size={16} />
						<ScrambleText text="naraklog" scrambleOnMount={isLoaded} scrambleOnHover />
					</span>
					<a href={CONTENT.links.contact.href} className="hover:text-off-white transition-colors cursor-pointer" onMouseEnter={() => playSound("hover")} onClick={() => playSound("click")}>
						<ScrambleText text="CONTACT [+]" scrambleOnMount={isLoaded} scrambleOnHover />
					</a>
				</div>
			</div>
		</div>
	);
}
