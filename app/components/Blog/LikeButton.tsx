"use client";
import { useState, useEffect } from "react";
import { HeartStraightIcon } from "@phosphor-icons/react";
import posthog from "posthog-js";
import { useSound } from "../../context/SoundContext";
import { ScrambleText } from "../ScrambleText";
import PixelIconDisplay from "./DotMatrixIcon";

type Theme = {
	gridLine: string;
	muted: string;
	[key: string]: any;
};

export default function LikeButton({ slug, title, theme }: { slug: string; title: string; theme?: Theme }) {
	const [liked, setLiked] = useState<boolean | null>(null); // null = loading
	const [isExiting, setIsExiting] = useState(false);
	const { playSound } = useSound();

	// Load state from local storage on mount
	useEffect(() => {
		const hasLiked = localStorage.getItem(`liked_${slug}`);
		setLiked(hasLiked === "true");
	}, [slug]);

	const handleLike = () => {
		if (isExiting) return;

		playSound("unlock");
		setIsExiting(true);
		localStorage.setItem(`liked_${slug}`, "true");

		posthog.capture("post_liked", {
			post_slug: slug,
			post_title: title,
			location: "blog_footer",
		});

		// Wait for scramble animation to complete before hiding
		setTimeout(() => {
			setLiked(true);
		}, 1500);
	};

	const borderColor = theme?.gridLine || "border-gray-200/50 dark:border-gray-800/50";

	// Don't render anything if already liked or still loading
	if (liked === null || liked === true) {
		return null;
	}

	return (
		<div className={`w-full flex items-center justify-center pt-6 border-t ${borderColor} transition-opacity duration-500 ${isExiting ? "opacity-50" : "opacity-100"}`}>
			<button
				onClick={handleLike}
				disabled={isExiting}
				className={`
					group inline-flex items-center justify-center gap-3 px-4 py-2
					transition-all duration-300
					text-xs font-mono uppercase tracking-[0.2em]
					${theme?.muted || "text-gray-500 dark:text-gray-400"}
					${isExiting ? "cursor-default" : ""}
				`}
				aria-label={isExiting ? "Post liked" : "Like this post"}
			>
				<span className={`w-5 h-5 transition-transform duration-300  ${isExiting ? "scale-100" : "group-hover:scale-110"}`}>
					<PixelIconDisplay
						svg={<HeartStraightIcon size={20} weight="fill" />}
						gridSize={24}
						dotScale={0.85}
						sparkleDensity={0.5}
						shape="square"
						color="currentColor"
						sparkleEnabled={true}
					/>
				</span>
				<span>{isExiting ? <ScrambleText text="Liked" scrambleOnMount /> : "Like this post"}</span>
			</button>
		</div>
	);
}
