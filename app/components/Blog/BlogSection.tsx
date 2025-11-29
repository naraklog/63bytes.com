"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import CategoriesNav from "./CategoriesNav";
import Articles from "./Articles";
import type { ArticleItem } from "../../types/posts";
import { useIntersectionObserver, useMediaQuery } from "../../hooks";

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
	const sectionRef = useRef<HTMLElement | null>(null);
	const hasInitializedView = useRef(false);

	// Merge forwarded ref with local ref
	const assignRefs = useCallback(
		(el: HTMLElement | null) => {
			sectionRef.current = el;
			if (typeof ref === "function") {
				ref(el);
			} else if (ref && typeof ref === "object") {
				(ref as React.MutableRefObject<HTMLElement | null>).current = el;
			}
		},
		[ref]
	);

	// Use custom hook for intersection observation
	const isInView = useIntersectionObserver(sectionRef, {
		threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
		minRatio: 0.1,
	});

	// Use custom hook for media query
	const isMobile = useMediaQuery("(max-width: 767px)");

	// Initialize view mode based on screen size (once)
	useEffect(() => {
		if (hasInitializedView.current) return;
		if (isMobile) {
			setViewMode("list");
		}
		hasInitializedView.current = true;
	}, [isMobile]);

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
