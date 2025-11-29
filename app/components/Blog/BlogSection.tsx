"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import CategoriesNav from "./CategoriesNav";
import Articles from "./Articles";
import type { ArticleItem } from "../../types/posts";

type BlogSectionProps = {
	limit?: number;
	showViewAllButton?: boolean;
	header?: React.ReactNode;
	items?: ArticleItem[];
	onLayoutChange?: () => void;
	showSearch?: boolean;
};

const BlogSection = forwardRef<HTMLElement, BlogSectionProps>(({ limit = 6, showViewAllButton = true, header, items = [], onLayoutChange, showSearch = true }, ref) => {
	const [activeCategory, setActiveCategory] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [isInView, setIsInView] = useState(false);
	const sectionRef = useRef<HTMLElement | null>(null);
	const hasInitializedView = useRef(false);

	// Merge forwarded ref with local ref
	function assignRefs(el: HTMLElement | null) {
		sectionRef.current = el;
		if (typeof ref === "function") {
			ref(el);
		} else if (ref && typeof ref === "object") {
			(ref as React.MutableRefObject<HTMLElement | null>).current = el;
		}
	}

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.target === el) {
						setIsInView(entry.isIntersecting && entry.intersectionRatio > 0.1);
					}
				}
			},
			{ threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (hasInitializedView.current) return;
		if (typeof window === "undefined") return;
		const media = window.matchMedia("(max-width: 767px)");
		if (media.matches) {
			setViewMode((prev) => (prev === "list" ? prev : "list"));
		}
		hasInitializedView.current = true;
	}, []);

	useEffect(() => {
		onLayoutChange?.();
	}, [viewMode, onLayoutChange]);

	const effectiveSearchQuery = showSearch ? searchQuery : "";

	return (
		<section ref={assignRefs} className="relative w-full min-h-screen p-8 sm:p-20 bg-foreground text-background">
			<div
				className="flex flex-col items-stretch justify-start max-w-[1080px] mx-auto pt-[51px] pb-[85px] lg:pt-[30px] lg:pb-[58px]
    px-0 sm:py-4 md:py-8 lg:py-[20px] xl:py-[30px]
    gap-0"
			>
				{header ? (
					<div className="mb-10 flex justify-center">
						<div className="relative flex w-full max-w-[1080px] min-w-[368px] mt-px ml-px flex-col">{header}</div>
					</div>
				) : null}
				<CategoriesNav
					activeCategory={activeCategory}
					onCategoryChange={setActiveCategory}
					showFloating={isInView}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					searchQuery={effectiveSearchQuery}
					onSearchChange={setSearchQuery}
					showSearch={showSearch}
				/>
				<Articles activeCategory={activeCategory} limit={limit} showViewAllButton={showViewAllButton} items={items} viewMode={viewMode} searchQuery={effectiveSearchQuery} />
			</div>
		</section>
	);
});

BlogSection.displayName = "BlogSection";
export default BlogSection;
