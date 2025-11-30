import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { OUTLINE_SIDE_WIDTH, OUTLINE_MIN_WIDTH, OUTLINE_SIDE_GAP, STICKY_TOP_OFFSET, slugifyHeading, type OutlineItem, type OutlinePosition } from "../components/Blog/Post/constants";

type UseArticleOutlineOptions = {
	articleRef: RefObject<HTMLElement | null>;
	mounted: boolean;
	isMobileBarActive: boolean;
	isPreloaderDone: boolean;
	isTransitioning: boolean;
	postHref: string;
};

type UseArticleOutlineReturn = {
	outlineItems: OutlineItem[];
	outlineMode: "side" | "overlay";
	outlineWidth: number;
	outlinePosition: OutlinePosition;
	activeHeadingId: string | null;
	isOutlineOpen: boolean;
	handleToggleOutline: () => void;
	handleCloseOutline: () => void;
	handleNavigateFromOutline: () => void;
};

export function useArticleOutline({ articleRef, mounted, isMobileBarActive, isPreloaderDone, isTransitioning, postHref }: UseArticleOutlineOptions): UseArticleOutlineReturn {
	const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
	const [outlineMode, setOutlineMode] = useState<"side" | "overlay">("overlay");
	const [outlineWidth, setOutlineWidth] = useState<number>(OUTLINE_SIDE_WIDTH);
	const [outlinePosition, setOutlinePosition] = useState<OutlinePosition>({ top: 120, right: OUTLINE_SIDE_GAP });
	const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
	const [isOutlineOpen, setIsOutlineOpen] = useState(false);
	const outlineUserToggledRef = useRef(false);

	// Parse headings from article
	useEffect(() => {
		if (!mounted) return;
		const articleEl = articleRef.current;
		if (!articleEl) return;

		const headingNodes = Array.from(articleEl.querySelectorAll<HTMLElement>("h2, h3"));
		if (!headingNodes.length) {
			setOutlineItems([]);
			return;
		}

		const occurrences = new Map<string, number>();
		const parsed: OutlineItem[] = headingNodes.map((node) => {
			const level = node.tagName === "H2" ? 2 : 3;
			const rawTitle = node.textContent?.trim() || "Section";
			const baseId = node.id || slugifyHeading(rawTitle) || "section";
			const currentCount = occurrences.get(baseId) || 0;
			occurrences.set(baseId, currentCount + 1);
			const uniqueId = currentCount ? `${baseId}-${currentCount}` : baseId;
			if (!node.id || node.id !== uniqueId) {
				node.id = uniqueId;
			}
			return { id: uniqueId, title: rawTitle, level };
		});
		setOutlineItems(parsed);
		setActiveHeadingId(parsed[0]?.id ?? null);
	}, [mounted, postHref, articleRef]);

	// Track active heading on scroll
	useEffect(() => {
		if (!mounted || !outlineItems.length) return;

		const handleScroll = () => {
			const scrollY = window.scrollY + 140;
			let currentId: string | null = outlineItems[0]?.id ?? null;
			for (const item of outlineItems) {
				const el = document.getElementById(item.id);
				if (!el) continue;
				if (el.offsetTop <= scrollY) {
					currentId = item.id;
				} else {
					break;
				}
			}
			setActiveHeadingId(currentId);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, [mounted, outlineItems]);

	// Update outline mode and position based on viewport
	useEffect(() => {
		if (!mounted) return;

		const updateMode = () => {
			const articleEl = articleRef.current;
			if (!articleEl) return;
			const rect = articleEl.getBoundingClientRect();
			const articleTop = Math.round(rect.top);
			const availableRight = window.innerWidth - rect.right - OUTLINE_SIDE_GAP;
			const safeAvailable = Math.max(0, Math.floor(availableRight));
			const sideWidth = Math.min(OUTLINE_SIDE_WIDTH, Math.max(OUTLINE_MIN_WIDTH, safeAvailable));
			const canSitBesideArticle = window.innerWidth >= 1200 && safeAvailable >= OUTLINE_MIN_WIDTH;

			if (canSitBesideArticle) {
				setOutlineMode("side");
				setOutlineWidth(sideWidth);
				setOutlinePosition({ top: Math.max(STICKY_TOP_OFFSET, articleTop), left: Math.round(rect.right + OUTLINE_SIDE_GAP) });
				if (!outlineUserToggledRef.current) {
					setIsOutlineOpen(true);
				}
			} else {
				const overlayWidth = Math.min(320, Math.max(200, Math.floor(window.innerWidth - 36)));
				setOutlineMode("overlay");
				setOutlineWidth(overlayWidth);
				if (isMobileBarActive) {
					setOutlinePosition({ bottom: 65, left: "50%", translateX: "-50%" });
				} else {
					setOutlinePosition({ top: Math.max(STICKY_TOP_OFFSET, articleTop), right: 18 });
				}
				if (!outlineUserToggledRef.current) {
					setIsOutlineOpen(false);
				}
			}
		};

		updateMode();
		window.addEventListener("resize", updateMode);
		return () => {
			window.removeEventListener("resize", updateMode);
		};
	}, [mounted, isMobileBarActive, articleRef]);

	// Close outline during transitions
	useEffect(() => {
		if (isTransitioning) {
			setIsOutlineOpen(false);
		}
	}, [isTransitioning]);

	// Close outline before preloader is done
	useEffect(() => {
		if (!isPreloaderDone) {
			setIsOutlineOpen(false);
		}
	}, [isPreloaderDone]);

	// Auto-open outline in side mode after preloader
	useEffect(() => {
		if (!isPreloaderDone || outlineUserToggledRef.current) return;
		setIsOutlineOpen(outlineMode === "side");
	}, [isPreloaderDone, outlineMode]);

	const handleToggleOutline = useCallback(() => {
		outlineUserToggledRef.current = true;
		setIsOutlineOpen((prev) => !prev);
	}, []);

	const handleCloseOutline = useCallback(() => {
		setIsOutlineOpen(false);
	}, []);

	const handleNavigateFromOutline = useCallback(() => {
		if (outlineMode === "overlay") {
			setIsOutlineOpen(false);
		}
	}, [outlineMode]);

	return {
		outlineItems,
		outlineMode,
		outlineWidth,
		outlinePosition,
		activeHeadingId,
		isOutlineOpen,
		handleToggleOutline,
		handleCloseOutline,
		handleNavigateFromOutline,
	};
}
