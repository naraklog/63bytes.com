"use client";

import { BookOpenIcon, RowsIcon, SquaresFourIcon, StackIcon, HouseIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
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
	const ToggleIcon = isListView ? SquaresFourIcon : RowsIcon;

	return createPortal(
		<div className="mobile-nav-portal">
			{/* Small screens: Floating bottom nav */}
			{/* Icon bar with radial blur background */}
			<div className="md:hidden fixed bottom-4 left-0 right-0 z-100 flex justify-center px-4">
				<div className="relative">
					{/* Radial blur background */}
					<RadialBlur
						className="absolute inset-0 pointer-events-none"
						strength={16}
						steps={8}
						falloffPercentage={120}
						style={{ zIndex: -1, marginTop: "-0.75rem", marginBottom: "-0.75rem", marginLeft: "-3.5rem", marginRight: "-3.5rem" }}
					/>
					<div className="flex items-center gap-4 px-3 py-2 font-semi-mono text-sm shrink-0">
						<button
							onClick={() => {
								setIsMobileMenuOpen(!isMobileMenuOpen);
								setIsMobileSearchOpen(false);
							}}
							className="flex items-center gap-2 text-black"
							data-no-morph
							aria-haspopup="menu"
							aria-expanded={isMobileMenuOpen}
						>
							{(() => {
								const activeCat = categories.find((cat) => cat.id === activeCategory);
								const IconComponent = activeCat ? iconComponents[activeCat.icon] ?? StackIcon : null;
								return (
									<>
										{IconComponent && <IconComponent size={20} weight="fill" />}
										<span className="max-w-[40vw] truncate">{activeCat?.label}</span>
									</>
								);
							})()}
						</button>
						<div style={{ width: 1, height: 20, backgroundColor: "#000", opacity: 0.5 }} />
						{showHomeButton && (
							<>
								<TransitionLink href="/" className="flex items-center gap-2 text-black no-underline" transitionLabel="Home" aria-label="Go to homepage">
									<HouseIcon size={20} weight="fill" />
								</TransitionLink>
							</>
						)}
						<button
							onClick={() => onViewModeChange(isListView ? "grid" : "list")}
							className="flex items-center text-black"
							data-no-morph
							aria-label={toggleAriaLabel}
							title={toggleAriaLabel}
						>
							<ToggleIcon size={20} weight="fill" />
						</button>
						{showSearch ? (
							<>
								<button
									onClick={() => {
										setIsMobileSearchOpen(!isMobileSearchOpen);
										setIsMobileMenuOpen(false);
									}}
									className="flex items-center gap-2 text-black"
									data-no-morph
								>
									<MagnifyingGlassIcon size={20} weight="bold" />
								</button>
							</>
						) : (
							<>
								<TransitionLink href="/blog" className="flex items-center gap-2 text-black no-underline" transitionLabel="Blog" aria-label="View all blog posts">
									<BookOpenIcon weight="fill" size={20} />
								</TransitionLink>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Mobile: Drop-up categories panel (animated) */}
			{/* Panel */}
			<div
				className={`md:hidden fixed bottom-20 left-0 right-0 z-100 px-4 transition-all duration-200 ease-out ${
					isMobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
				}`}
				role="menu"
				aria-hidden={!isMobileMenuOpen}
			>
				<div className="mx-auto w-full max-w-[1080px] border border-background bg-foreground/80 backdrop-blur-sm shadow-lg font-semi-mono">
					<ul className="p-2">
						{categories.map((category) => {
							const IconComponent = iconComponents[category.icon] ?? StackIcon;
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
										<IconComponent size={20} weight="fill" />
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
					{/* Panel */}
					<div
						className={`md:hidden fixed bottom-20 left-0 right-0 z-100 px-4 transition-all duration-200 ease-out ${
							isMobileSearchOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
						}`}
						aria-hidden={!isMobileSearchOpen}
					>
						<div className="mx-auto w-full max-w-[1080px] border border-background bg-foreground shadow-lg p-3 flex items-center gap-2">
							<input
								type="text"
								placeholder="Search articles..."
								ref={mobileSearchInputRef}
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="flex-1 px-3 py-2 text-background/80 placeholder:text-background/60 focus:outline-none font-semi-mono text-sm"
							/>
							<button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-background/70" data-no-morph aria-label="Close search">
								<XIcon size={20} weight="bold" />
							</button>
						</div>
					</div>
				</>
			)}
		</div>,
		document.body
	);
});

export default MobileMenu;
