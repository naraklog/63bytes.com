"use client";

import { useLayoutEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

type UseHomeScrollOptions = {
	mainRef: RefObject<HTMLDivElement | null>;
	containerRef: RefObject<HTMLDivElement | null>;
	section1Ref: RefObject<HTMLElement | null>;
	section2Ref: RefObject<HTMLElement | null>;
	leftDigitRef: RefObject<HTMLSpanElement | null>;
	rightDigitRef: RefObject<HTMLSpanElement | null>;
	setMorphEnabled: (enabled: boolean) => void;
	setMorphProgress: (progress: number) => void;
};

/**
 * A hook that manages the GSAP ScrollTrigger and ScrollSmoother logic for the home page.
 * Handles the pinned scroll animation between landing and blog sections.
 */
export function useHomeScroll({ mainRef, containerRef, section1Ref, section2Ref, leftDigitRef, rightDigitRef, setMorphEnabled, setMorphProgress }: UseHomeScrollOptions): void {
	// Disable browser scroll restoration and reset scroll position on mount
	// This ensures the animation always starts from a clean state on page refresh
	useLayoutEffect(() => {
		if (typeof window === "undefined") return;

		// Disable browser's automatic scroll restoration
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}

		// Force scroll to top
		window.scrollTo(0, 0);

		return () => {
			// Restore default scroll restoration behavior on unmount
			if ("scrollRestoration" in history) {
				history.scrollRestoration = "auto";
			}
		};
	}, []);

	useLayoutEffect(() => {
		// Reset state on mount
		setMorphEnabled(false);
		setMorphProgress(0);

		if (!containerRef.current || !section1Ref.current || !section2Ref.current) return;

		// On touch devices, briefly gate native scroll while ScrollSmoother initializes
		// This prevents both the "glitch" (normalizeScroll kicking in mid-gesture)
		// and the "slip" (native scroll sneaking through before GSAP takes over)
		const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		if (isTouchDevice) {
			document.documentElement.style.touchAction = "none";
		}

		const ctx = gsap.context(() => {
			const leftDigit = leftDigitRef.current;
			const rightDigit = rightDigitRef.current;
			const digits: HTMLElement[] = [leftDigit, rightDigit].filter((el): el is HTMLElement => el !== null);

			const smoother = ScrollSmoother.create({
				smooth: 2,
				effects: true,
				normalizeScroll: { ignore: ".mobile-nav-portal" },
			});

			// Prime normalizeScroll immediately after creation so it's fully active
			// before any user interaction. This replaces the old touchstart hack.
			smoother.scrollTo(0, false);
			ScrollTrigger.refresh();

			// Release the touch gate after a short delay to ensure smoother is ready
			if (isTouchDevice) {
				requestAnimationFrame(() => {
					document.documentElement.style.touchAction = "";
				});
			}

			// Initial setup
			gsap.set(section2Ref.current, { yPercent: 100, zIndex: 10 });
			gsap.set(section1Ref.current, { zIndex: 1 });

			// Only set force3D if we have digits
			if (digits.length > 0) {
				gsap.set(digits, { force3D: false });
			}

			const digitStartScale = 4;
			if (leftDigit) gsap.set(leftDigit, { scale: digitStartScale, transformOrigin: "left top" });
			if (rightDigit) gsap.set(rightDigit, { scale: digitStartScale, transformOrigin: "right top" });

			// Main timeline with scroll trigger
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top",
					end: "+=100%",
					scrub: 1,
					pin: true,
					anticipatePin: 1,
					snap: {
						snapTo: [0, 1],
						duration: { min: 0.2, max: 0.4 },
						delay: 0,
						ease: "power2.inOut",
					},
					onEnter: () => {
						setMorphEnabled(true);
					},
					onLeave: () => {
						smoother.paused(true);
						setTimeout(() => smoother.paused(false), 200);
						setMorphEnabled(false);
					},
					onEnterBack: () => {
						smoother.paused(false);
						setMorphEnabled(true);
					},
					onLeaveBack: () => {
						setMorphEnabled(false);
					},
				},
			});

			// Update morph progress on timeline update
			tl.eventCallback("onUpdate", () => {
				const progress = tl.progress();
				setMorphProgress(progress);
			});

			// Animate sections and digits
			tl.to(section2Ref.current, { yPercent: 0, ease: "power2.inOut" }).to(section1Ref.current, { scale: 0.8, ease: "power2.inOut" }, 0).to(digits, { scale: 1, ease: "power2.inOut" }, 0);
		}, mainRef);

		return () => {
			ctx.revert();
			setMorphEnabled(false);
			setMorphProgress(0);
		};
	}, [mainRef, containerRef, section1Ref, section2Ref, leftDigitRef, rightDigitRef, setMorphEnabled, setMorphProgress]);
}
