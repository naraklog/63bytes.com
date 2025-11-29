"use client";

import TransitionLink from "../TransitionLink";
import Dither from "../Dither";
import { ScrambleText } from "../ScrambleText";
import { formatFullDate } from "../../utils/date";
import { ArticleItem } from "../../types/posts";

type LatestPostPreviewProps = {
	latestPost: ArticleItem;
};

export const LatestPostPreview = ({ latestPost }: LatestPostPreviewProps) => {
	return (
		<TransitionLink
			href={latestPost.href}
			transitionLabel={latestPost.label}
			className="flex relative w-full border border-light-gray/25 bg-background overflow-hidden group text-left mb-4 md:mb-12 order-1 md:order-2"
		>
			<div className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100 mix-blend-screen">
				<Dither waveColor={[0.7, 0.7, 0.7]} colorNum={6} pixelSize={1.2} enableMouseInteraction={false} />
			</div>
			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/85 via-black/70 to-transparent" />

			<div className="relative z-10 flex flex-col gap-3 p-4 md:p-6 w-full">
				<div className="flex items-center justify-between text-[10px] md:text-xs uppercase tracking-wide text-light-gray/60">
					<span className="bg-white/10 px-2 py-0.5 text-off-white">{latestPost.category}</span>
					<span>{formatFullDate(latestPost.dateTime)}</span>
				</div>

				<h3 className="text-lg md:text-xl font-medium text-off-white line-clamp-2" title={latestPost.label}>
					<span aria-label={latestPost.label}>
						<ScrambleText text={latestPost.label} scrambleOnHover />
					</span>
				</h3>

				<div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-off-white/50 pt-1 mt-auto">
					<span className="group-hover:text-off-white transition-colors">READ POST</span>
					<span className="transition-transform group-hover:translate-x-1">→</span>
				</div>
			</div>
		</TransitionLink>
	);
};

