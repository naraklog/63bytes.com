"use client";

import { useEffect, useRef, useState } from "react";
import { LockKeyIcon, LockKeyOpenIcon, CaretDoubleUpIcon, ArrowUpIcon } from "@phosphor-icons/react";
import { gsap } from "../utils/gsap";
import { waitForAppReady } from "../utils/preloader";
import { useTouchDevice } from "../hooks/useTouchDevice";
import { useSound } from "../context/SoundContext";

const Preloader = () => {
	const [count, setCount] = useState(0);
	const [loadingText, setLoadingText] = useState("Booting up...");
	const [isReady, setIsReady] = useState(false);
	const [isLocked, setIsLocked] = useState(true);
	const exitTimelineRef = useRef<gsap.core.Tween | null>(null);
	const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
	const labelRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const isTouchDevice = useTouchDevice();
	const touchStartY = useRef<number>(0);
	const { playSound } = useSound();

	const startExit = () => {
		if (exitTimelineRef.current) return;

		// Restore body scroll before exit animation starts
		document.body.style.overflow = "";

		// Play unlock sound on exit
		playSound("unlock");

		exitTimelineRef.current = gsap.to(".preloader", {
			yPercent: -100,
			duration: 0.6,
			ease: "power4.inOut",
			onStart: () => {
				window.dispatchEvent(new CustomEvent("app:preloader-start-exit"));
			},
			onComplete: () => {
				window.dispatchEvent(new CustomEvent("app:preloader-complete"));
			},
		});
	};

	const handleUnlockClick = () => {
		if (!isReady || !isLocked) return;
		setIsLocked(false);
		setTimeout(() => {
			startExit();
		}, 500);
	};

	// Use native non-passive event listeners to ensure preventDefault works
	useEffect(() => {
		const container = containerRef.current;
		if (!container || !isReady || !isTouchDevice) return;

		const handleTouchStart = (e: TouchEvent) => {
			e.stopPropagation();
			touchStartY.current = e.touches[0].clientY;
		};

		const handleTouchMove = (e: TouchEvent) => {
			e.stopPropagation();

			// Always prevent default to stop scroll
			if (e.cancelable) {
				e.preventDefault();
			}

			const currentY = e.touches[0].clientY;
			const deltaY = currentY - touchStartY.current;

			// Only allow dragging up for the animation
			if (deltaY < 0) {
				const percent = (deltaY / window.innerHeight) * 100;
				gsap.set(container, { yPercent: percent });
			}
		};

		const handleTouchEnd = (e: TouchEvent) => {
			const currentY = e.changedTouches[0].clientY;
			const deltaY = currentY - touchStartY.current;

			// Threshold: 15% of screen height
			if (deltaY < -window.innerHeight * 0.15) {
				startExit();
			} else {
				gsap.to(container, {
					yPercent: 0,
					duration: 0.3,
					ease: "power2.out",
				});
			}
		};

		container.addEventListener("touchstart", handleTouchStart, { passive: false });
		container.addEventListener("touchmove", handleTouchMove, { passive: false });
		container.addEventListener("touchend", handleTouchEnd);

		return () => {
			container.removeEventListener("touchstart", handleTouchStart);
			container.removeEventListener("touchmove", handleTouchMove);
			container.removeEventListener("touchend", handleTouchEnd);
		};
	}, [isReady, isTouchDevice]);

	// Lock body scroll on mount
	useEffect(() => {
		// Store original overflow style
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			// Restore original overflow style on unmount
			document.body.style.overflow = originalOverflow;
		};
	}, []);

	// Track mouse position directly via ref when ready
	useEffect(() => {
		if (!isReady || isTouchDevice) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (labelRef.current) {
				// Use translate3d for better performance
				labelRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY - 40}px, 0) translateX(-50%)`;
			}
		};

		// Initial position
		const initialX = window.innerWidth / 2;
		const initialY = window.innerHeight / 2;
		if (labelRef.current) {
			labelRef.current.style.transform = `translate3d(${initialX}px, ${initialY - 40}px, 0) translateX(-50%)`;
		}

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [isReady, isTouchDevice]);

	useEffect(() => {
		const counter = { value: 0 };

		const updateProgress = () => {
			const newCount = Math.round(counter.value);
			setCount(newCount);
			gsap.set(".preloader-bar", { width: `${newCount}%` });
		};

		// Create a promise that resolves when the intro animation is done
		const introAnimationPromise = new Promise<void>((resolve) => {
			introTimelineRef.current = gsap.timeline({
				onComplete: () => {
					resolve();
				},
			});

			// Animate the progress bar and counter together
			introTimelineRef.current
				.to(counter, {
					value: 72,
					duration: 1,
					ease: "power4.inOut",
					onUpdate: updateProgress,
				})
				.to(
					".scramble-text",
					{
						scrambleText: {
							text: "0x3634206279746573",
							tweenLength: false,
							chars: "01",
							revealDelay: 0.5,
						},
					},
					0
				)
				// Switch to hex flip text and animate the digit flip
				.call(
					() => {
						gsap.set(".scramble-text", { opacity: 0 });
						gsap.set(".hex-flip-text", { opacity: 1 });
						// Set initial position: second span starts below
						gsap.set(".flip-container span:last-child", { yPercent: 100 });
					},
					[],
					"+=0.2"
				)
				.to(
					".flip-container span:first-child",
					{
						yPercent: -100,
						duration: 0.4,
						ease: "power4.inOut",
					},
					"+=0.2"
				)
				.to(
					".flip-container span:last-child",
					{
						yPercent: 0,
						duration: 0.4,
						ease: "power4.inOut",
					},
					"<"
				)
				.call(() => setLoadingText("Loading Assets..."))
				.to(
					counter,
					{
						value: 100,
						duration: 0.75,
						ease: "power2.in",
						onUpdate: updateProgress,
					},
					"+=0.4"
				)
				.to(
					".hex-flip-text",
					{
						scrambleText: {
							text: "63",
							revealDelay: 0.25,
							chars: "01",
						},
					},
					"<"
				)
				.to({}, { duration: 0.3 });
		});

		// Wait for both the intro animation AND the app to be ready
		Promise.all([introAnimationPromise, waitForAppReady()]).then(() => {
			setLoadingText("System Ready");
			setIsReady(true);
		});

		return () => {
			introTimelineRef.current?.kill();
			exitTimelineRef.current?.kill();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`preloader fixed bottom-0 left-0 w-full h-full bg-background z-200 flex flex-col items-center justify-center p-4 sm:p-8 isolate ${
				isReady && !isTouchDevice ? "cursor-none" : ""
			}`}
			style={{ touchAction: "none" }}
			onClick={!isTouchDevice ? handleUnlockClick : undefined}
		>
			<div className="hex-container relative z-10 text-lg sm:text-lg md:text-xl lg:text-2xl text-foreground/80 font-mono">
				<div className="scramble-text"></div>
				<div className="hex-flip-text" style={{ opacity: 0 }}>
					0x363
					<div className="flip-container">
						<span>4</span>
						<span>3</span>
					</div>
					206279746573
				</div>
			</div>

			{isReady &&
				(isTouchDevice ? (
					// Touch device: centered text in bottom half
					<div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-300 pointer-events-none text-foreground font-mono flex flex-col items-center gap-2 text-sm sm:text-base mix-blend-difference">
						<CaretDoubleUpIcon weight="regular" className="animate-bounce" />
						<span>Slide up</span>
					</div>
				) : (
					// Desktop: mouse following
					<div
						ref={labelRef}
						className="fixed top-0 left-0 z-300 pointer-events-none text-foreground font-mono flex items-center gap-2 text-sm sm:text-base will-change-transform mix-blend-difference"
						style={{
							// Initial off-screen position to avoid flash, updated by JS immediately
							transform: "translate3d(-1000px, -1000px, 0)",
						}}
					>
						{isLocked ? <LockKeyIcon weight="fill" /> : <LockKeyOpenIcon weight="fill" />}
						Click to Unlock
					</div>
				))}

			<div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 text-foreground/80 text-xs sm:text-sm font-mono">{loadingText}</div>
			<div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 text-foreground/80 text-xs sm:text-sm font-mono">{count}%</div>
			<div className="preloader-bar-container absolute bottom-0 left-0 w-full h-full z-20 mix-blend-difference">
				<div className="preloader-bar h-full bg-foreground" style={{ width: "0%" }}></div>
			</div>
		</div>
	);
};

export default Preloader;
