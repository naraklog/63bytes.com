"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLayoutContext } from "../context/LayoutContext";

type MorphStateReturn = {
	morphEnabled: boolean;
	morphProgress: number;
	shouldMorph: boolean;
	isMorphActive: boolean;
	isWebKit: boolean;
	isSmallScreen: boolean;
};

/**
 * A hook that manages the morph animation state.
 * Handles WebKit detection, screen size checks, and context subscription.
 */
export function useMorphState(): MorphStateReturn {
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	const isBlogPost = pathname.startsWith("/blog/");

	const { subscribe, getSnapshot } = useLayoutContext();

	const [morphEnabled, setMorphEnabled] = useState(false);
	const [morphProgress, setMorphProgress] = useState(0);
	const [isWebKit, setIsWebKit] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	// Detect Safari and all iOS browsers (WebKit engine)
	useEffect(() => {
		if (typeof navigator !== "undefined") {
			const ua = navigator.userAgent || "";
			const nav = navigator as Navigator & { maxTouchPoints?: number };
			const isIOS = /iP(ad|hone|od)/i.test(ua);
			const isMacTouch = /Macintosh/i.test(ua) && (nav.maxTouchPoints ?? 0) > 1;
			const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR/i.test(ua);
			setIsWebKit(isIOS || isMacTouch || isSafari);
		}
	}, []);

	// Gate morphing on small screens using a media query (Tailwind md breakpoint ~768px)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(max-width: 768px)");
		const handleChange = () => setIsSmallScreen(mediaQuery.matches);
		handleChange();
		try {
			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		} catch {
			// Safari < 14 fallback
			mediaQuery.addListener(handleChange);
			return () => mediaQuery.removeListener(handleChange);
		}
	}, []);

	// Subscribe to morph state from context
	useEffect(() => {
		if (!isHomePage && !isBlogPost) {
			setMorphEnabled(false);
			setMorphProgress(0);
			return;
		}

		const snapshot = getSnapshot();
		const isSupportedEnvironment = !isWebKit && !isSmallScreen;

		if ((isSupportedEnvironment || isBlogPost) && snapshot.enabled) {
			setMorphEnabled(true);
		}
		setMorphProgress(snapshot.progress);

		const unsubscribe = subscribe((state) => {
			if (isWebKit && !isBlogPost) return;

			// Handle enable/disable logic based on environment
			if (state.enabled) {
				if (isBlogPost || isSupportedEnvironment) {
					setMorphEnabled(true);
				}
			} else {
				setMorphEnabled(false);
			}

			setMorphProgress(state.progress);
		});

		return () => {
			unsubscribe();
		};
	}, [isHomePage, isBlogPost, isWebKit, isSmallScreen, subscribe, getSnapshot]);

	const shouldMorph = (isHomePage || isBlogPost) && morphEnabled && (isBlogPost || (!isWebKit && !isSmallScreen));
	const isMorphActive = shouldMorph && morphProgress < 1;

	return {
		morphEnabled,
		morphProgress,
		shouldMorph,
		isMorphActive,
		isWebKit,
		isSmallScreen,
	};
}

