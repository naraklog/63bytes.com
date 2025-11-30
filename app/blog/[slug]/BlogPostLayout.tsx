"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClockFading, ListTree, AtSign, Home, Sun, Moon } from "lucide-react";

import CopyLinkButton from "../../components/CopyLinkButton";
import AuthorsList from "../../components/Blog/AuthorsList";
import Dither from "../../components/Dither";
import { ScrambleText } from "../../components/ScrambleText";
import { usePageTransition } from "../../components/PageTransitionProvider";
import TransitionLink from "../../components/TransitionLink";
import { OutlinePanel, MobileActionBar, SocialLinkItem, CONTROL_BUTTON_BASE, THEME_PRESETS, BLOG_FONT_FAMILY, CONTACT_EMAIL, SOCIAL_LINKS } from "../../components/Blog/Post";
import { useArticleOutline, useThemeSync } from "../../hooks";
import type { BlogPostMetadata } from "../../utils/mdx";
import { hasPreloaderRun } from "../../utils/preloader";
import { useLayoutContext } from "../../context/LayoutContext";

type BlogPostLayoutProps = {
	metadata: BlogPostMetadata;
	readTimeLabel: string;
	formattedDate: string;
	children: ReactNode;
};

export default function BlogPostLayout({ metadata, readTimeLabel, formattedDate, children }: BlogPostLayoutProps) {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);
	const articleRef = useRef<HTMLElement | null>(null);
	const [isMobileBarActive, setIsMobileBarActive] = useState(false);
	const [isPreloaderDone, setIsPreloaderDone] = useState<boolean>(() => hasPreloaderRun());
	const { startTransition, isTransitioning } = usePageTransition();
	const { setMorphEnabled, setMorphProgress } = useLayoutContext();

	const { outlineItems, outlineMode, outlineWidth, outlinePosition, activeHeadingId, isOutlineOpen, handleToggleOutline, handleCloseOutline, handleNavigateFromOutline } = useArticleOutline({
		articleRef,
		mounted,
		isMobileBarActive,
		isPreloaderDone,
		isTransitioning,
		postHref: metadata.href,
	});

	useThemeSync({ isDarkMode, mounted });

	useEffect(() => {
		setMorphEnabled(false);
		setMorphProgress(0);
		setMorphEnabled(true);

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight;
			const winHeight = window.innerHeight;
			const scrollable = Math.max(1, docHeight - winHeight);
			const scrollPercent = Math.min(1, Math.max(0, scrollTop / scrollable));

			setMorphProgress(scrollPercent);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
			setMorphEnabled(false);
			setMorphProgress(0);
		};
	}, [setMorphEnabled, setMorphProgress]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const theme = useMemo(() => (isDarkMode ? THEME_PRESETS.dark : THEME_PRESETS.light), [isDarkMode]);

	const handleToggleTheme = useCallback(() => {
		const next = !isDarkMode;
		setIsDarkMode(next);
	}, [isDarkMode]);

	const handleBackToBlog = useCallback(() => {
		if (isTransitioning) return;
		startTransition({ href: "/blog", label: "Blog" });
	}, [isTransitioning, startTransition]);

	const handleGoHome = useCallback(() => {
		if (isTransitioning) return;
		startTransition({ href: "/", label: "Home" });
	}, [isTransitioning, startTransition]);

	useEffect(() => {
		if (!mounted) return;
		const mq = window.matchMedia("(max-width: 768px)");
		const handleQueryChange = () => setIsMobileBarActive(mq.matches);
		handleQueryChange();
		try {
			mq.addEventListener("change", handleQueryChange);
			return () => mq.removeEventListener("change", handleQueryChange);
		} catch {
			mq.addListener(handleQueryChange);
			return () => mq.removeListener(handleQueryChange);
		}
	}, [mounted]);

	useEffect(() => {
		if (isPreloaderDone) return;
		const handlePreloaderComplete = () => setIsPreloaderDone(true);
		window.addEventListener("app:preloader-complete", handlePreloaderComplete, { once: true });
		window.addEventListener("app:preloader-start-exit", handlePreloaderComplete, { once: true });
		return () => {
			window.removeEventListener("app:preloader-complete", handlePreloaderComplete);
			window.removeEventListener("app:preloader-start-exit", handlePreloaderComplete);
		};
	}, [isPreloaderDone]);

	const hasContactEmail = Boolean(CONTACT_EMAIL);
	const outlineStateLabel = isOutlineOpen ? "Outline visible" : "Outline hidden";
	const outlineButtonVariant = isOutlineOpen ? theme.linkButton : theme.toggleButton;

	return (
		<>
			<main className={`${theme.main} min-h-screen px-4 pt-20 pb-16 sm:pt-28 sm:px-8 lg:px-12`} style={{ fontFamily: BLOG_FONT_FAMILY }}>
				<div className="flex justify-center">
					<div className="relative flex w-full max-w-[1080px] min-w-[368px] mt-px ml-px flex-col">
						<div className="ul-cross w-full">
							<article
								ref={articleRef}
								data-code-theme={isDarkMode ? "dark" : "light"}
								className={`relative border ${theme.articleSurface} px-6 py-6 sm:px-12 sm:py-12 lg:px-24 lg:py-24`}
							>
								<div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-3 pointer-events-none select-none">
									<div className={`hidden lg:block border-r border-dashed ${theme.gridLine}`} />
									<div className={`hidden lg:block border-r border-dashed ${theme.gridLine}`} />
								</div>
								<div className="relative z-10 flex flex-col gap-6">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-center gap-3">
											<button
												type="button"
												onClick={handleBackToBlog}
												className={`hidden sm:inline-flex ${CONTROL_BUTTON_BASE} gap-2 min-w-[105px] ${theme.linkButton}`}
												disabled={isTransitioning}
												aria-label="Back to blog"
											>
												<span aria-hidden="true">←</span>
												<ScrambleText text="Back to blog" scrambleOnHover />
											</button>
											<button
												type="button"
												onClick={handleGoHome}
												className={`hidden sm:inline-flex ${CONTROL_BUTTON_BASE} w-9 px-0 ${theme.toggleButton}`}
												disabled={isTransitioning}
												aria-label="Go to homepage"
											>
												<Home className="h-6 w-6" strokeWidth={1.5} />
												<span className="sr-only">Go to homepage</span>
											</button>
											<button
												type="button"
												className={`hidden sm:inline-flex ${CONTROL_BUTTON_BASE} w-9 px-0 overflow-hidden ${theme.toggleButton}`}
												onClick={handleToggleTheme}
												aria-pressed={isDarkMode}
												aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
											>
												{isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
												<span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
											</button>
											{outlineItems.length ? (
												<button
													type="button"
													className={`hidden sm:inline-flex ${CONTROL_BUTTON_BASE} w-9 px-0 ${outlineButtonVariant}`}
													onClick={handleToggleOutline}
													aria-pressed={isOutlineOpen}
													aria-label={isOutlineOpen ? "Hide page outline" : "Show page outline"}
													title={outlineStateLabel}
													data-state={isOutlineOpen ? "open" : "closed"}
													data-variant="outline-toggle"
													aria-live="polite"
													aria-atomic="true"
													style={{ touchAction: "manipulation" }}
												>
													<ListTree className={`h-6 w-6 ${isOutlineOpen ? "text-current" : ""}`} strokeWidth={1.5} />
													<span className="sr-only">Toggle outline</span>
												</button>
											) : null}
										</div>
										<time className={`text-xs uppercase tracking-[0.2em] ${theme.muted}`} dateTime={metadata.dateTime}>
											{formattedDate}
										</time>
									</div>

									<header className="flex flex-col gap-4">
										<h1 className={`text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold ${theme.heading}`}>{metadata.label}</h1>
										{metadata.authors.length ? (
											<AuthorsList
												authors={metadata.authors}
												prefix="By "
												className={`text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] ${theme.muted}`}
												linkClassName={`${theme.muted} underline decoration-dotted underline-offset-4 transition-colors`}
											/>
										) : null}
										<div className={`flex flex-wrap items-center gap-3 text-sm ${theme.muted}`}>
											<span className="inline-flex items-center gap-2">
												<ClockFading className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
												{readTimeLabel}
											</span>
											<CopyLinkButton href={metadata.href} variant={theme.copyVariant} />
										</div>
										{metadata.intro ? <p className={`leading-relaxed ${theme.content}`}>{metadata.intro}</p> : null}
									</header>

									<div
										className={`leading-relaxed space-y-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h3]:text-xl [&>h3]:font-semibold [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 ${theme.content}`}
									>
										{children}
									</div>
								</div>
							</article>

							<section className={`relative ul-cross-br border ${theme.articleSurface} border-t-0 mb-20 p-6 sm:p-8`} aria-label="Article footer">
								<div className="pointer-events-none absolute inset-0 overflow-hidden">
									<div className={`absolute inset-0 opacity-80 ${theme.ditherBlendMode}`}>
										<Dither waveColor={theme.ditherWaveColor} colorNum={6} pixelSize={1.2} enableMouseInteraction={false} />
									</div>
									<div className={`absolute inset-0 bg-linear-to-b ${isDarkMode ? "from-black/80 via-black/20 to-black/90" : "from-white/80 via-white/10 to-white/90"}`} />
								</div>

								<div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
									<div className="flex flex-col gap-5">
										<div className={`border ${theme.sectionBorder} ${theme.sectionBg} p-5 flex flex-col gap-3`}>
											<div className="flex flex-col gap-1">
												<p className={`text-[0.65rem] uppercase tracking-[0.35em] ${theme.muted}`}>Status</p>
												<ScrambleText text="/// EOF" className={`mt-2 font-mono text-xs ${theme.heading}`} scrambleOnMount />
											</div>
											<div className="flex flex-col gap-3">
												<p className={`text-xs font-semi-mono ${theme.content} leading-relaxed`}>Meet the human behind the post.</p>
												<TransitionLink
													href="/about"
													className={`inline-flex w-full h-8 items-center justify-center border ${theme.linkButton} px-6 text-xs font-mono uppercase tracking-[0.4em] transition-colors`}
													transitionLabel="About"
												>
													About
												</TransitionLink>
											</div>
										</div>
									</div>

									<div className={`border ${theme.sectionBorder} ${theme.sectionBg} p-5 flex flex-col gap-6 h-full`}>
										<p className={`text-[0.65rem] uppercase tracking-[0.35em] ${theme.muted}`}>Communication</p>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full content-between">
											{hasContactEmail && <SocialLinkItem label="Send Email" href={`mailto:${CONTACT_EMAIL}`} Icon={AtSign} theme={theme} gridLineClass={theme.gridLine} />}
											{SOCIAL_LINKS.map((link) => (
												<SocialLinkItem key={link.label} label={link.label} href={link.href} Icon={link.Icon} theme={theme} gridLineClass={theme.gridLine} />
											))}
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
				</div>

				{mounted && outlineItems.length && !isTransitioning && isPreloaderDone ? (
					<OutlinePanel
						isOpen={isOutlineOpen}
						mode={outlineMode}
						width={outlineWidth}
						position={outlinePosition}
						useHighlightBackground={isMobileBarActive && outlineMode === "overlay"}
						borderClass={theme.outlineBorder}
						textClass={theme.outlineText}
						items={outlineItems}
						activeId={activeHeadingId}
						onClose={handleCloseOutline}
						onNavigate={handleNavigateFromOutline}
						isDarkMode={isDarkMode}
					/>
				) : null}

				{mounted && !isTransitioning && isPreloaderDone && (
					<MobileActionBar
						isDarkMode={isDarkMode}
						hasOutlineItems={outlineItems.length > 0}
						isOutlineOpen={isOutlineOpen}
						onToggleTheme={handleToggleTheme}
						onToggleOutline={handleToggleOutline}
					/>
				)}
			</main>
		</>
	);
}
