"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import BlogSection from "./components/Blog/BlogSection";
import { ARTICLES_PER_LOAD } from "./components/Blog/Articles";
import LandingSection from "./components/Landing";
import type { ArticleItem } from "./types/posts";
import { useLayoutContext } from "./context/LayoutContext";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

type HomeClientProps = {
	articles: ArticleItem[];
};

export default function HomeClient({ articles }: HomeClientProps) {
	const sortedArticles = [...articles].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
	const [latestArticle, ...restArticles] = sortedArticles;
	const fallbackItems = latestArticle ? restArticles : sortedArticles;

	const mainRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const section1Ref = useRef<HTMLElement>(null);
	const section2Ref = useRef<HTMLElement>(null);

	const { leftDigitRef, rightDigitRef, setMorphEnabled, setMorphProgress } = useLayoutContext();

	useLayoutEffect(() => {
		// Reset state on mount
		setMorphEnabled(false);
		setMorphProgress(0);

		if (!containerRef.current || !section1Ref.current || !section2Ref.current) return;

		const ctx = gsap.context(() => {
			const leftDigit = leftDigitRef.current;
			const rightDigit = rightDigitRef.current;
			const digits: HTMLElement[] = [leftDigit, rightDigit].filter(Boolean) as HTMLElement[];

			const smoother = ScrollSmoother.create({
				smooth: 2,
				effects: true,
				normalizeScroll: true,
			});
			gsap.set(section2Ref.current, { yPercent: 100, zIndex: 10 });
			gsap.set(section1Ref.current, { zIndex: 1 });
			gsap.set([leftDigit, rightDigit], { force3D: false });
			const digitStartScale = 4;
			if (leftDigit) gsap.set(leftDigit, { scale: digitStartScale, transformOrigin: "left top" });
			if (rightDigit) gsap.set(rightDigit, { scale: digitStartScale, transformOrigin: "right top" });

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top",
					end: "+=100%",
					scrub: 1,
					pin: true,
					anticipatePin: 1,
					onEnter: () => {
						setMorphEnabled(true);
					},
					onLeave: () => {
						smoother.paused(true);
						setTimeout(() => smoother.paused(false), 200);
						setMorphEnabled(false);
					},
					onEnterBack: () => {
						smoother.paused(false);
						setMorphEnabled(true);
					},
					onLeaveBack: () => {
						setMorphEnabled(false);
					},
				},
			});

			tl.eventCallback("onUpdate", () => {
				const progress = tl.progress();
				setMorphProgress(progress);
			});
			tl.to(section2Ref.current, { yPercent: 0, ease: "power2.inOut" }).to(section1Ref.current, { scale: 0.8, ease: "power2.inOut" }, 0).to(digits, { scale: 1, ease: "power2.inOut" }, 0);
		}, mainRef);

		return () => {
			ctx.revert();
			setMorphEnabled(false);
			setMorphProgress(0);
		};
	}, [leftDigitRef, rightDigitRef, setMorphEnabled, setMorphProgress]);

	return (
		<main ref={mainRef}>
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<div ref={containerRef} className="relative min-h-screen">
						<LandingSection ref={section1Ref} latestPost={latestArticle} />

						<BlogSection ref={section2Ref} limit={ARTICLES_PER_LOAD} items={fallbackItems} onLayoutChange={() => ScrollTrigger.refresh()} showSearch={false} />
					</div>
				</div>
			</div>
		</main>
	);
}
