"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { type ArticleItem, type IconKey } from "../../types/posts";
import { StackIcon, CpuIcon, GitBranchIcon, NewspaperIcon, DatabaseIcon, ShieldIcon, FileCodeIcon, DiamondsFourIcon, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import TransitionLink from "../TransitionLink";
import AuthorsList from "./AuthorsList";
import PixelIconDisplay from "../Blog/DotMatrixIcon";

const iconComponents: Record<IconKey, PhosphorIcon> = {
	newspaper: NewspaperIcon,
	gitBranch: GitBranchIcon,
	shield: ShieldIcon,
	database: DatabaseIcon,
	fileCode: FileCodeIcon,
	component: DiamondsFourIcon,
	menu: StackIcon,
	cpu: CpuIcon,
};

type ArticleCardProps = {
	item: ArticleItem;
	isListView: boolean;
	needsRightOutline?: boolean;
};

const DRAG_THRESHOLD = 10;

export default function ArticleCard({ item, isListView, needsRightOutline = false }: ArticleCardProps) {
	const startPos = useRef<{ x: number; y: number } | null>(null);
	const [isHovered, setIsHovered] = useState(false);
	const IconComponent = iconComponents[item.icon] ?? NewspaperIcon;

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

	const contentWrapperClasses = ["flex h-full flex-col gap-6 bg-foreground no-underline text-black transition-colors duration-200 touch-pan-y", isListView ? "p-4 md:p-6" : "p-8 lg:p-10"].join(" ");

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
								<div className="flex items-center gap-3">
									<span className="inline-flex h-16 w-16 items-center justify-center rounded-sm text-black" aria-hidden="true">
										<PixelIconDisplay
											svg={<IconComponent size={32} weight="regular" />}
											gridSize={24}
											dotScale={0.8}
											sparkleDensity={0.75}
											shape="square"
											color="black"
											sparkleEnabled={isHovered}
											className="w-full h-full"
										/>
									</span>
									<h2 className="text-black text-lg sm:text-xl md:text-2xl leading-tight font-bold tracking-tight">{item.label}</h2>
								</div>
								<span className="border border-light-gray/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-white/80 bg-black/90">{item.category}</span>
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
							<div className="flex items-center justify-between">
								<span className="inline-flex h-16 w-16 items-center justify-center rounded-sm text-black" aria-hidden="true">
									<PixelIconDisplay
										svg={<IconComponent size={32} weight="regular" />}
										gridSize={24}
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
}
