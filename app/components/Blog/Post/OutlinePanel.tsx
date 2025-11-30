"use client";

import { createPortal } from "react-dom";
import { ListTree, X } from "lucide-react";
import type { OutlineItem, OutlinePosition } from "./constants";

type OutlinePanelProps = {
	isOpen: boolean;
	mode: "side" | "overlay";
	width: number;
	position: OutlinePosition;
	useHighlightBackground: boolean;
	borderClass: string;
	textClass: string;
	items: OutlineItem[];
	activeId: string | null;
	onClose: () => void;
	onNavigate: () => void;
	isDarkMode: boolean;
};

export default function OutlinePanel({ isOpen, mode, width, position, useHighlightBackground, borderClass, textClass, items, activeId, onClose, onNavigate, isDarkMode }: OutlinePanelProps) {
	if (!isOpen || !items.length) return null;

	const blurClass = useHighlightBackground ? "backdrop-blur-lg" : "backdrop-blur-sm";
	const baseClasses = [
		"border",
		borderClass,
		textClass,
		blurClass,
		useHighlightBackground ? "" : isDarkMode ? "bg-black/85" : "bg-white/80",
		mode === "overlay" ? (isDarkMode ? "shadow-2xl" : "shadow-[0_12px_50px_rgba(0,0,0,0.12)]") : "",
	]
		.filter(Boolean)
		.join(" ");

	const { top, right, bottom, left, translateX } = position;
	const highlightBg = isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)";

	const aside = (
		<aside
			className={`fixed z-90 flex flex-col gap-3 ${baseClasses}`}
			style={{
				top: typeof top === "number" ? top : undefined,
				right: typeof right === "number" ? right : undefined,
				left: typeof left === "number" || typeof left === "string" ? left : undefined,
				bottom: typeof bottom === "number" ? bottom : undefined,
				transform: translateX ? `translateX(${translateX})` : undefined,
				width,
				maxHeight: mode === "side" ? "72vh" : "70vh",
				backgroundColor: useHighlightBackground ? highlightBg : undefined,
			}}
		>
			<div className="flex items-center justify-between gap-2 px-4 pt-3">
				<div className="flex items-center gap-2 font-semi-mono text-[0.75rem] uppercase tracking-[0.16em]">
					<ListTree className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
					On This Page
				</div>
				<button type="button" onClick={onClose} className="flex items-center gap-1 text-xs font-mono uppercase tracking-tight opacity-80 transition-opacity" aria-label="Close outline">
					<X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
				</button>
			</div>
			<div className="flex-1 overflow-y-auto px-2 pb-2">
				<nav aria-label="Page outline">
					<ul className="flex flex-col gap-1.5 text-sm">
						{items.map((item) => {
							const isActive = item.id === activeId;
							return (
								<li key={item.id}>
									<a
										href={`#${item.id}`}
										onClick={onNavigate}
										className={`group flex items-center gap-2 px-2 py-1.5 leading-snug transition-colors ${item.level === 3 ? "pl-6 text-[0.9em]" : "pl-2"} ${
											isActive ? (isDarkMode ? "text-white" : "text-black") : "opacity-80"
										}`}
									>
										<span
											className={`font-mono text-xs transition-all duration-200 ${
												isActive ? (isDarkMode ? "text-white" : "text-black") : "text-current opacity-50 group-hover:opacity-90"
											}`}
											aria-hidden="true"
										>
											+
										</span>
										<span className="block overflow-hidden text-ellipsis">{item.title}</span>
									</a>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</aside>
	);

	return createPortal(aside, document.body);
}
