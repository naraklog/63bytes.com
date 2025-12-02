"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { type ArticleItem } from "../../types/posts";
import { resolvePhosphorIcon } from "../../utils/icons";
import TransitionLink from "../TransitionLink";
import AuthorsList from "./AuthorsList";
import PixelIconDisplay from "../Blog/DotMatrixIcon";

type ArticleCardProps = {
	item: ArticleItem;
	isListView: boolean;
	needsRightOutline?: boolean;
};

const DRAG_THRESHOLD = 10;

export default function ArticleCard({ item, isListView, needsRightOutline = false }: ArticleCardProps) {
	const startPos = useRef<{ x: number; y: number } | null>(null);
	const [isHovered, setIsHovered] = useState(false);
	const IconComponent = resolvePhosphorIcon(item.icon);

	const handlePointerDown = (e: PointerEvent<HTMLAnchorElement>) => {
		startPos.current = { x: e.clientX, y: e.clientY };
	};

	const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
		if (startPos.current) {
			const dx = e.clientX - startPos.current.x;
			const dy = e.clientY - startPos.current.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance > DRAG_THRESHOLD) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
		startPos.current = null;
	};

	const listItemClasses = ["h-auto", !isListView ? "lg:h-[560px]" : "", needsRightOutline ? "lg:border-r lg:border-light-gray/20" : ""].filter(Boolean).join(" ");

	const contentWrapperClasses = [
		"flex h-full flex-col bg-foreground no-underline text-black transition-colors duration-200 touch-pan-y",
		isListView ? "gap-2 p-3 sm:p-4" : "gap-4 md:gap-6 px-4 py-6 md:p-8 lg:p-10",
	].join(" ");

	const excerptClasses = isListView ? "hidden" : "relative mt-3 overflow-hidden lg:flex-grow";
	const metadataClasses = "mt-4 flex items-center gap-2";

	const renderAuthors = (textClassName: string) => <AuthorsList authors={item.authors} className={textClassName} disableLinks />;

	return (
		<li className={listItemClasses}>
			<article aria-label={item.label} className="h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
				<TransitionLink href={item.href} className={contentWrapperClasses} transitionLabel={item.label} onPointerDown={handlePointerDown} onClick={handleClick}>
					{isListView ? (
						<>
							<div className="flex items-center justify-between gap-4">
								<h2 className="text-black text-lg md:text-2xl leading-tight font-bold tracking-tight">{item.label}</h2>
								<span className="border border-light-gray/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/80 bg-black/90 shrink-0">{item.category}</span>
							</div>
							<div className="flex flex-wrap items-center gap-3 justify-start text-sm text-light-gray text-right">
								<time dateTime={item.dateTime} className="text-light-gray text-left text-[0.65rem] sm:text-xs uppercase tracking-wide">
									{item.dateLabel}
								</time>
								<span className="text-light-gray/60" aria-hidden="true">
									•
								</span>
								{renderAuthors("text-light-gray text-xs sm:text-sm")}
							</div>
						</>
					) : (
						<>
							<div className="flex items-center justify-between">
								<span className="inline-flex h-16 w-16 items-center justify-center rounded-sm text-black" aria-hidden="true">
									<PixelIconDisplay
										svg={<IconComponent size={32} weight="regular" />}
										gridSize={32}
										dotScale={0.8}
										sparkleDensity={0.75}
										shape="square"
										color="black"
										sparkleEnabled={isHovered}
										className="w-full h-full"
									/>
								</span>
								<span className="border border-light-gray/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/80 bg-black/90">{item.category}</span>
							</div>
							<h2 className="mt-2 text-black text-2xl leading-tight font-bold tracking-tight">{item.label}</h2>
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
}
