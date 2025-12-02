"use client";

import { HouseIcon, BooksIcon, DotsThreeOutlineIcon, XIcon, MagnifyingGlassIcon, RowsIcon, SquaresFourIcon, StackIcon } from "@phosphor-icons/react";
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type CategoryOption } from "../../../types/posts";
import TransitionLink from "../../TransitionLink";
import { resolvePhosphorIcon } from "../../../utils/icons";
import { useScrollDirection, useMediaQuery } from "../../../hooks";
import { useSound } from "../../../context/SoundContext";

const ICON_SIZE = 18;

type MobileMenuProps = {
	categories: CategoryOption[];
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
	/** When true, the menu will not collapse on scroll */
	disableCollapse?: boolean;
	/** When true, shows minimal UI: hides category/view toggles, shows "All Posts" label */
	minimalMode?: boolean;
};

const MobileMenu = forwardRef<HTMLInputElement, MobileMenuProps>(function MobileMenu(
	{
		categories,
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
		disableCollapse = false,
		minimalMode = false,
	},
	mobileSearchInputRef
) {
	const { scrollDirection, setScrollDirection } = useScrollDirection({ upThreshold: 100 });
	const { playSound } = useSound();
	const isMobile = useMediaQuery("(max-width: 767px)");

	if (!isMobile) return null;

	const isCollapsed = !disableCollapse && scrollDirection === "down";
	const isListView = viewMode === "list";
	const toggleAriaLabel = isListView ? "Switch to grid view" : "Switch to list view";
	const ToggleIcon = isListView ? RowsIcon : SquaresFourIcon;

	return createPortal(
		<div className="mobile-nav-portal">
			{/* Small screens: Floating bottom nav */}
			<div className="md:hidden fixed bottom-2 left-0 right-0 z-100 flex justify-center px-4">
				<div className="relative">
					<motion.div
						layout
						initial={false}
						transition={{
							layout: {
								type: "spring",
								stiffness: 450,
								damping: 30,
							},
						}}
						className="flex items-center justify-center shrink-0 border border-light-gray/50 text-off-white backdrop-blur-sm overflow-hidden bg-black/90"
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{isCollapsed ? (
								<motion.button
									key="collapsed"
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15, layout: { duration: 0 } }}
									onAnimationComplete={disableCollapse ? undefined : () => playSound("hover")}
									className="px-1.75"
									onClick={() => {
										playSound("click");
										setScrollDirection("up");
									}}
									onMouseEnter={() => playSound("hover")}
									aria-label="Expand menu"
								>
									<DotsThreeOutlineIcon size={ICON_SIZE} weight="fill" />
								</motion.button>
							) : (
								<motion.div
									key="expanded"
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15, layout: { duration: 0 } }}
									onAnimationComplete={disableCollapse ? undefined : () => playSound("hover")}
									className="flex items-center gap-3 px-3 py-2 font-semi-mono text-sm whitespace-nowrap"
								>
									{!minimalMode && (
										<>
											<button
												onClick={() => {
													playSound("click");
													setIsMobileMenuOpen(!isMobileMenuOpen);
													setIsMobileSearchOpen(false);
												}}
												onMouseEnter={() => playSound("hover")}
												className="flex items-center gap-2"
												data-no-morph
												aria-haspopup="menu"
												aria-expanded={isMobileMenuOpen}
											>
												{(() => {
													const activeCat = categories.find((cat) => cat.id === activeCategory);
													const IconComponent = resolvePhosphorIcon(activeCat?.icon ?? "StackIcon");
													return (
														<>
															{IconComponent && <IconComponent size={16} weight="duotone" />}
															<span className="max-w-[40vw] truncate">{activeCat?.label}</span>
														</>
													);
												})()}
											</button>

											<div className="h-4 w-px shrink-0 bg-light-gray" />
										</>
									)}

									{showHomeButton && (
										<>
											<TransitionLink href="/" className="flex items-center gap-2 no-underline" transitionLabel="Home" aria-label="Go to homepage">
												<HouseIcon size={ICON_SIZE} weight="duotone" />
											</TransitionLink>
											<div className="h-4 w-px shrink-0 bg-light-gray" />
										</>
									)}

									{showSearch ? (
										<button
											onClick={() => {
												playSound("click");
												setIsMobileSearchOpen(!isMobileSearchOpen);
												setIsMobileMenuOpen(false);
											}}
											onMouseEnter={() => playSound("hover")}
											className="flex items-center gap-2"
											data-no-morph
										>
											<MagnifyingGlassIcon size={ICON_SIZE} weight="duotone" />
										</button>
									) : (
										<TransitionLink href="/blog" className="flex items-center gap-2 no-underline" transitionLabel="Blog" aria-label="View all blog posts">
											<BooksIcon size={ICON_SIZE} weight="duotone" />
											{minimalMode && <span>All Posts</span>}
										</TransitionLink>
									)}

									{!minimalMode && <div className="h-4 w-px shrink-0 bg-light-gray" />}

									{!minimalMode && (
										<>
											<button
												onClick={() => {
													playSound("click");
													onViewModeChange(isListView ? "grid" : "list");
												}}
												onMouseEnter={() => playSound("hover")}
												className="flex items-center"
												data-no-morph
												aria-label={toggleAriaLabel}
												title={toggleAriaLabel}
											>
												<ToggleIcon size={ICON_SIZE} weight="duotone" />
											</button>
										</>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
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
							const IconComponent = resolvePhosphorIcon(category.icon);
							return (
								<li key={`mobile-${category.id}`}>
									<button
										onClick={() => {
											playSound("click");
											onCategoryChange(category.id);
											setIsMobileMenuOpen(false);
										}}
										onMouseEnter={() => playSound("hover")}
										className={`w-full text-left px-4 py-2 transition-all duration-200 font-semi-mono flex items-center gap-2 ${
											activeCategory === category.id ? "bg-background text-foreground/80" : "text-background/80"
										}`}
										role="menuitem"
									>
										<IconComponent size={16} weight="duotone" />
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
							<button
								onClick={() => {
									playSound("click");
									setIsMobileSearchOpen(false);
								}}
								onMouseEnter={() => playSound("hover")}
								className="p-2 text-background/70"
								data-no-morph
								aria-label="Close search"
							>
								<XIcon size={ICON_SIZE} weight="duotone" />
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
