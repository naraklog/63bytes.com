"use client";

import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import BlogSection from "./components/Blog/BlogSection";
import { ARTICLES_PER_LOAD } from "./components/Blog/Articles";
import LandingSection from "./components/Landing";
import type { ArticleItem, CategoryOption } from "./types/posts";
import { useLayoutContext } from "./context/LayoutContext";
import { useHomeScroll } from "./hooks";

type HomeClientProps = {
	articles: ArticleItem[];
	categories: CategoryOption[];
};

export default function HomeClient({ articles, categories }: HomeClientProps) {
	const sortedArticles = [...articles].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
	const latestArticle = sortedArticles[0];

	const mainRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const section1Ref = useRef<HTMLElement>(null);
	const section2Ref = useRef<HTMLElement>(null);

	const { leftDigitRef, rightDigitRef, setMorphEnabled, setMorphProgress } = useLayoutContext();

	useHomeScroll({
		mainRef,
		containerRef,
		section1Ref,
		section2Ref,
		leftDigitRef,
		rightDigitRef,
		setMorphEnabled,
		setMorphProgress,
	});

	return (
		<main ref={mainRef}>
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<div ref={containerRef} className="relative min-h-screen">
						<LandingSection ref={section1Ref} latestPost={latestArticle} />

						<BlogSection
							ref={section2Ref}
							limit={ARTICLES_PER_LOAD}
							items={sortedArticles}
							categories={categories}
							onLayoutChange={() => ScrollTrigger.refresh()}
							showSearch={false}
							useThemeColorOnly
							disableCollapse
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
