"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { type ArticleItem, type IconKey } from "../../types/posts";
import { Newspaper, GitBranch, Shield, Database, FileCode, Component, Menu, Cpu, type LucideIcon } from "lucide-react";
import TransitionLink from "../TransitionLink";
import AuthorsList from "./AuthorsList";

const iconComponents: Record<IconKey, LucideIcon> = {
	newspaper: Newspaper,
	gitBranch: GitBranch,
	shield: Shield,
	database: Database,
	fileCode: FileCode,
	component: Component,
	menu: Menu,
	cpu: Cpu,
};

type ArticlesProps = {
	activeCategory: string;
	items?: ArticleItem[];
	limit?: number;
	showViewAllButton?: boolean;
	viewMode?: "grid" | "list";
	searchQuery?: string;
};

export const ARTICLES_PER_LOAD = 9;
const LOAD_DELAY_MS = 1000;
const LOADING_TEXT = "Loading more...";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrambleTextPlugin);
}

const chunkArticles = (items: ArticleItem[], size = 3) => {
	const chunks: ArticleItem[][] = [];
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size));
	}
	return chunks;
};

export default function Articles({ activeCategory, items = [], limit, showViewAllButton = true, viewMode = "grid", searchQuery = "" }: ArticlesProps) {
	const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_LOAD);
	const [isLoading, setIsLoading] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const loadTimeoutRef = useRef<number | null>(null);
	const isLoadingRef = useRef(false);
	const loadingTextRef = useRef<HTMLSpanElement | null>(null);
	const scrambleTimelineRef = useRef<gsap.core.Timeline | null>(null);
	const normalizedCategory = activeCategory.toLowerCase();
	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filteredItems = useMemo(() => {
		const filteredByCategory = normalizedCategory === "all" ? items : items.filter((item) => item.category.toLowerCase() === normalizedCategory);
		return filteredByCategory.filter((item) => {
			if (!normalizedQuery) return true;
			const haystack = [item.label, item.intro, item.category, item.authors.map((author) => author.name).join(" ")].join(" ").toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	}, [items, normalizedCategory, normalizedQuery]);

	const cappedItems = typeof limit === "number" ? filteredItems.slice(0, limit) : filteredItems;
	const visibleItems = cappedItems.slice(0, Math.min(visibleCount, cappedItems.length));
	const hasMore = visibleItems.length < cappedItems.length;
	const isListView = viewMode === "list";
	const rows = isListView ? (visibleItems.length ? [visibleItems] : []) : chunkArticles(visibleItems);

	useEffect(() => {
		setVisibleCount(Math.min(ARTICLES_PER_LOAD, cappedItems.length));
		setIsLoading(false);
		isLoadingRef.current = false;
		if (loadTimeoutRef.current !== null) {
			window.clearTimeout(loadTimeoutRef.current);
			loadTimeoutRef.current = null;
		}
	}, [normalizedCategory, normalizedQuery, limit, cappedItems.length]);

	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target) return;
		if (!hasMore) return;
		let cancelled = false;

		const clearDelay = () => {
			if (loadTimeoutRef.current !== null) {
				window.clearTimeout(loadTimeoutRef.current);
				loadTimeoutRef.current = null;
			}
		};

		const loadNextBatch = () => {
			if (isLoadingRef.current) return;
			setIsLoading(true);
			isLoadingRef.current = true;

			const delayPromise = new Promise<void>((resolve) => {
				loadTimeoutRef.current = window.setTimeout(() => {
					loadTimeoutRef.current = null;
					resolve();
				}, LOAD_DELAY_MS);
			});

			// Placeholder for background fetch; runs in parallel with the delay so UX delay never stacks on network time.
			const dataReadyPromise = Promise.resolve();

			Promise.all([delayPromise, dataReadyPromise]).then(() => {
				if (cancelled) return;
				setVisibleCount((prev) => Math.min(prev + ARTICLES_PER_LOAD, cappedItems.length));
				setIsLoading(false);
				isLoadingRef.current = false;
			});
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) loadNextBatch();
				}
			},
			{ rootMargin: "400px 0px" }
		);

		observer.observe(target);
		return () => {
			cancelled = true;
			observer.disconnect();
			clearDelay();
		};
	}, [cappedItems.length, hasMore]);

	useEffect(() => {
		if (!hasMore) {
			setIsLoading(false);
			isLoadingRef.current = false;
		}
	}, [hasMore]);

	useEffect(() => {
		scrambleTimelineRef.current?.kill();
		scrambleTimelineRef.current = null;
		const loadingElement = loadingTextRef.current;

		if (!isLoading) {
			if (loadingElement) loadingElement.textContent = LOADING_TEXT;
			return;
		}

		const el = loadingElement;
		if (!el) return;

		const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
		tl.set(el, { textContent: "" });
		tl.to(el, {
			duration: 0.9,
			ease: "none",
			scrambleText: {
				text: LOADING_TEXT,
				chars: "upperAndLowerCase",
				speed: 0.55,
				revealDelay: 0,
			},
		});
		tl.set(el, { textContent: LOADING_TEXT }, ">+0.2");

		scrambleTimelineRef.current = tl;

		return () => {
			tl.kill();
			if (loadingElement) loadingElement.textContent = LOADING_TEXT;
		};
	}, [isLoading]);

	return (
		<div className="flex justify-center items-center">
			<div className="relative flex w-full max-w-[1080px] min-w-[368px] mt-px ml-px flex-col">
				{rows.map((row, rowIndex) => {
					const listIsFirst = rowIndex === 0;
					const listIsLast = rowIndex === rows.length - 1;
					const wrapperClasses = [listIsFirst ? "ul-cross" : "", "w-full"].filter(Boolean).join(" ");
					const listClasses = [
						isListView
							? "flex flex-col w-full border border-light-gray/15 divide-y divide-light-gray/20"
							: "grid grid-cols-1 lg:grid-cols-3 w-full border border-light-gray/15 divide-y lg:divide-y-0 lg:divide-x divide-light-gray/20",
						!listIsFirst ? "border-t-0" : "",
						listIsLast && !showViewAllButton ? "ul-cross-br" : "",
					]
						.filter(Boolean)
						.join(" ");

					return (
						<div key={`row-${rowIndex}`} className={wrapperClasses}>
							<ul className={listClasses}>
								{row.map((item, itemIndex) => {
									const IconComponent = iconComponents[item.icon] ?? Newspaper;
									const needsRightOutline = !isListView && row.length < 3 && itemIndex === row.length - 1;
									const listItemClasses = ["h-auto", !isListView ? "lg:h-[560px]" : "", needsRightOutline ? "lg:border-r lg:border-light-gray/20" : ""].filter(Boolean).join(" ");
									const contentWrapperClasses = [
										"flex h-full flex-col gap-4 bg-foreground no-underline text-black transition-colors duration-200",
										isListView ? "p-4 md:p-6" : "p-8 lg:p-10",
									].join(" ");
									const excerptClasses = isListView ? "hidden" : "relative mt-3 overflow-hidden lg:flex-grow";
									const metadataClasses = "mt-4 flex items-center gap-2";
									const renderAuthors = (textClassName: string) => <AuthorsList authors={item.authors} className={textClassName} disableLinks />;
									return (
										<li key={item.href} className={listItemClasses}>
											<article aria-label={item.label} className="h-full">
												<TransitionLink href={item.href} className={contentWrapperClasses} transitionLabel={item.label}>
													{isListView ? (
														<>
															<div className="flex items-center justify-between gap-4">
																<div className="flex items-center gap-3">
																	<span className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-black" aria-hidden="true">
																		<IconComponent size={200} strokeWidth={2} />
																	</span>
																	<h2 className="text-black text-lg sm:text-xl md:text-2xl leading-tight font-bold tracking-tight">{item.label}</h2>
																</div>
																<span className="border border-light-gray/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/80 bg-black/90">
																	{item.category}
																</span>
															</div>
															<div className="flex flex-wrap items-center gap-3 justify-end text-sm text-light-gray text-right">
																{renderAuthors("text-light-gray text-xs sm:text-sm")}
																<span className="text-light-gray/60" aria-hidden="true">
																	•
																</span>
																<time dateTime={item.dateTime} className="text-light-gray text-[0.65rem] sm:text-xs uppercase tracking-wide">
																	{item.dateLabel}
																</time>
															</div>
														</>
													) : (
														<>
															<div className="flex items-start justify-between">
																<span className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-black" aria-hidden="true">
																	<IconComponent size={200} strokeWidth={2} />
																</span>
																<span className="border border-light-gray/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/80 bg-black/90">
																	{item.category}
																</span>
															</div>
															<h2 className="mt-2 text-black text-lg md:text-2xl leading-tight font-bold tracking-tight">{item.label}</h2>
															<div className={excerptClasses}>
																<p className="text-light-gray text-sm leading-6">{item.intro}</p>
																<div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-b from-transparent to-foreground" />
															</div>
															<div className={metadataClasses}>
																{renderAuthors("text-light-gray text-xs sm:text-sm")}
																<time dateTime={item.dateTime} className="ml-auto text-light-gray text-[0.7rem] md:text-[0.8rem] leading-4 text-right">
																	{item.dateLabel}
																</time>
															</div>
														</>
													)}
												</TransitionLink>
											</article>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}

				{isLoading ? (
					<div className="flex flex-col items-center gap-3 py-6 text-[0.7rem] font-mono uppercase tracking-[0.12em] text-light-gray/80" role="status" aria-live="polite">
						<div className="flex items-center gap-1.5">
							{[0, 1, 2, 3].map((i) => (
								<span key={`pixel-${i}`} className="block h-3 w-3 rounded-[2px] bg-white/80" style={{ animation: `pixelBlink 0.9s ease-in-out ${i * 0.12}s infinite` }} />
							))}
						</div>
						<span ref={loadingTextRef}>{LOADING_TEXT}</span>
					</div>
				) : null}

				<div ref={loadMoreRef} className="h-1 w-full" aria-hidden />

				{showViewAllButton ? (
					<ul className="ul-cross-br flex w-full justify-center border border-light-gray/15 border-t-0 py-12 bg-foreground">
						<li className="w-full flex justify-center">
							<TransitionLink href="/blog" className="w-4/5 border border-black bg-transparent px-4 py-2 text-center font-semibold font-mono text-black" transitionLabel="Blog">
								View All Posts
							</TransitionLink>
						</li>
					</ul>
				) : null}
			</div>
			<style jsx>{`
				@keyframes pixelBlink {
					0%,
					100% {
						opacity: 0.35;
						transform: translateY(0);
					}
					50% {
						opacity: 1;
						transform: translateY(-3px);
					}
				}
			`}</style>
		</div>
	);
}
