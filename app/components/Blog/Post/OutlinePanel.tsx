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

	const baseClasses = ["border", borderClass, textClass, "backdrop-blur-sm", isDarkMode ? "bg-black/85" : "bg-white/80"].filter(Boolean).join(" ");

	const { top, left } = position;

	const aside = (
		<aside
			className={`fixed z-90 flex flex-col gap-3 ${baseClasses}`}
			style={{
				top: typeof top === "number" ? top : undefined,
				left: typeof left === "number" || typeof left === "string" ? left : undefined,
				width,
				maxHeight: "72vh",
			}}
		>
			<div className="flex items-center gap-2 px-4 pt-3">
				<div className="flex items-center gap-2 font-semi-mono text-[0.75rem] uppercase tracking-[0.16em]">
					<TreeViewIcon size={16} weight="duotone" aria-hidden="true" />
					On This Page
				</div>
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
										onClick={() => {
											playSound("click");
											onNavigate();
										}}
										onMouseEnter={() => playSound("hover")}
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
