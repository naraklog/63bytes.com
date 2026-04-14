"use client";

import { createPortal } from "react-dom";
import { TreeViewIcon } from "@phosphor-icons/react";
import type { OutlineItem, OutlinePosition } from "./constants";
import { useSound } from "../../../context/SoundContext";

type OutlinePanelProps = {
	isOpen: boolean;
	mode: "side";
	width: number;
	position: OutlinePosition;
	borderClass: string;
	textClass: string;
	items: OutlineItem[];
	activeId: string | null;
	onClose: () => void;
	onNavigate: () => void;
	isDarkMode: boolean;
};

export default function OutlinePanel({ isOpen, width, position, borderClass, textClass, items, activeId, onNavigate, isDarkMode }: OutlinePanelProps) {
	const { playSound } = useSound();

	if (!isOpen || !items.length) return null;

	const { top, left } = position;

	const separatorClass = isDarkMode ? "border-white/10" : "border-black/10";

	const aside = (
		<aside
			data-no-morph
			className={`fixed inset-y-0 z-90 flex flex-col ${textClass} border-r ${separatorClass}`}
			style={{
				left: typeof left === "number" || typeof left === "string" ? left : undefined,
				width,
			}}
		>
			<div className="flex items-center gap-2 px-4 pb-3" style={{ paddingTop: typeof top === "number" ? top : undefined }}>
				<div className="flex items-center gap-2 font-semi-mono text-[0.75rem] uppercase tracking-[0.16em]">
					<TreeViewIcon size={16} weight="duotone" aria-hidden="true" />
					On This Page
				</div>
			</div>
			<div className="flex-1 overflow-y-auto px-2">
				<nav aria-label="Page outline">
					<ul className="flex flex-col gap-1.5 font-mono uppercase">
						{items.map((item) => {
							const isActive = item.id === activeId;
							return (
								<li key={item.id}>
									<a
										href={`#${item.id}`}
										onClick={() => {
											playSound("click");
											onNavigate();
										}}
										onMouseEnter={() => playSound("hover")}
									className={`group flex items-center gap-2 px-2 py-1.5 leading-snug transition-colors ${item.level === 3 ? "pl-6" : "pl-2"} ${
										isActive ? `font-medium text-[10px] xl:text-xs 2xl:text-sm ${isDarkMode ? "text-white" : "text-black"}` : `text-[9px] xl:text-[10px] 2xl:text-xs opacity-80`
									}`}
									>
										<span
											className={`font-mono text-xs transition-all duration-200 ${
												isActive ? (isDarkMode ? "text-white" : "text-black") : "text-current opacity-50 group-hover:opacity-90"
											}`}
											aria-hidden="true"
										>
											{item.level === 3 ? "–" : "+"}
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
