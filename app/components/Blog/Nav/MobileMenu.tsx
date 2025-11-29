"use client";

import { Search, X, ChevronDown, ChevronUp, Menu, Home, LayoutGrid, List, Library } from "lucide-react";
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { RadialBlur } from "progressive-blur";
import { categoryOptions } from "../../../types/posts";
import TransitionLink from "../../TransitionLink";
import { iconComponents } from "./iconComponents";

const categories = categoryOptions;

type MobileMenuProps = {
	activeCategory: string;
	onCategoryChange: (category: string) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	showSearch: boolean;
	showHomeButton: boolean;
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;
	isMobileSearchOpen: boolean;
	setIsMobileSearchOpen: (open: boolean) => void;
};

const MobileMenu = forwardRef<HTMLInputElement, MobileMenuProps>(function MobileMenu(
	{
		activeCategory,
		onCategoryChange,
		viewMode,
		onViewModeChange,
		searchQuery,
		onSearchChange,
		showSearch,
		showHomeButton,
		isMobileMenuOpen,
		setIsMobileMenuOpen,
		isMobileSearchOpen,
		setIsMobileSearchOpen,
	},
	mobileSearchInputRef
) {
	const isListView = viewMode === "list";
	const toggleAriaLabel = isListView ? "Switch to grid view" : "Switch to list view";
	const ToggleIcon = isListView ? LayoutGrid : List;

	return createPortal(
		<>
			{/* Small screens: Floating bottom nav */}
			<div className="md:hidden fixed bottom-4 left-0 right-0 z-100 flex justify-center px-4">
				<RadialBlur steps={3.2} strength={64} falloffPercentage={120} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, zIndex: 0, pointerEvents: "none" }} />
				<div className="relative z-1 flex items-center gap-3 border border-light-gray/80 bg-black/90 backdrop-blur px-3 py-2 font-semi-mono text-sm shadow-lg">
					<button
						onClick={() => {
							setIsMobileMenuOpen(!isMobileMenuOpen);
							setIsMobileSearchOpen(false);
						}}
						className="flex items-center gap-2 text-foreground/80"
						aria-haspopup="menu"
						aria-expanded={isMobileMenuOpen}
					>
						{(() => {
							const activeCat = categories.find((cat) => cat.id === activeCategory);
							const IconComponent = activeCat ? iconComponents[activeCat.icon] ?? Menu : null;
							return (
								<>
									{IconComponent && <IconComponent size={16} />}
									<span className="max-w-[40vw] truncate">{activeCat?.label}</span>
								</>
							);
						})()}
						{isMobileMenuOpen ? <ChevronDown size={16} className="rotate-180" /> : <ChevronUp size={16} />}
					</button>
					<div className="w-px h-5 bg-foreground/20" />
					{showHomeButton && (
						<>
							<TransitionLink href="/" className="flex items-center gap-2 text-foreground/80 no-underline" transitionLabel="Home" aria-label="Go to homepage">
								<Home size={16} />
							</TransitionLink>
							<div className="w-px h-5 bg-foreground/20" />
						</>
					)}
					{showSearch ? (
						<>
							<button
								onClick={() => {
									setIsMobileSearchOpen(!isMobileSearchOpen);
									setIsMobileMenuOpen(false);
								}}
								className="flex items-center gap-2 text-foreground/80"
							>
								<Search size={16} />
							</button>
							<div className="w-px h-5 bg-foreground/20" />
						</>
					) : (
						<>
							<TransitionLink href="/blog" className="flex items-center gap-2 text-foreground/80 no-underline" transitionLabel="Blog" aria-label="View all blog posts">
								<Library size={16} />
							</TransitionLink>
							<div className="w-px h-5 bg-foreground/20" />
						</>
					)}
					<button onClick={() => onViewModeChange(isListView ? "grid" : "list")} className="flex items-center text-foreground/80" aria-label={toggleAriaLabel} title={toggleAriaLabel}>
						<ToggleIcon size={16} />
					</button>
				</div>
			</div>

			{/* Mobile: Drop-up categories panel (animated) */}
			{/* Scrim */}
			<div
				className={`md:hidden fixed inset-0 z-90 bg-black/30 transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => setIsMobileMenuOpen(false)}
				aria-hidden={!isMobileMenuOpen}
			/>
			{/* Panel */}
			<div
				className={`md:hidden fixed left-0 right-0 z-100 px-4 transition-all duration-200 ease-out ${
					isMobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
				}`}
				role="menu"
				aria-hidden={!isMobileMenuOpen}
			>
				<div className="mx-auto w-full max-w-[1080px] border border-background bg-foreground/80 backdrop-blur-sm shadow-lg font-semi-mono">
					<ul className="p-2">
						{categories.map((category) => {
							const IconComponent = iconComponents[category.icon] ?? Menu;
							return (
								<li key={`mobile-${category.id}`}>
									<button
										onClick={() => {
											onCategoryChange(category.id);
											setIsMobileMenuOpen(false);
										}}
										className={`w-full text-left px-4 py-2 transition-all duration-200 font-semi-mono flex items-center gap-2 ${
											activeCategory === category.id ? "bg-background text-foreground/80" : "text-background/80"
										}`}
										role="menuitem"
									>
										<IconComponent size={16} />
										{category.label}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			</div>

			{showSearch && (
				<>
					{/* Mobile: Bottom search panel (animated) */}
					{/* Scrim */}
					<div
						className={`md:hidden fixed inset-0 z-90 bg-black/30 transition-opacity duration-200 ${
							isMobileSearchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
						}`}
						onClick={() => setIsMobileSearchOpen(false)}
						aria-hidden={!isMobileSearchOpen}
					/>
					{/* Panel */}
					<div
						className={`md:hidden fixed left-0 right-0 z-100 px-4 transition-all duration-200 ease-out ${
							isMobileSearchOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
						}`}
						aria-hidden={!isMobileSearchOpen}
					>
						<div className="mx-auto w-full max-w-[1080px] border border-background bg-foreground/80 backdrop-blur-sm shadow-lg p-3 flex items-center gap-2">
							<input
								type="text"
								placeholder="Search articles..."
								ref={mobileSearchInputRef}
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="flex-1 px-3 py-2 text-background/80 placeholder:text-background/60 focus:outline-none font-semi-mono text-sm"
							/>
							<button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-background/70" aria-label="Close search">
								<X size={16} />
							</button>
						</div>
					</div>
				</>
			)}
		</>,
		document.body
	);
});

export default MobileMenu;
