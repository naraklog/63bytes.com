"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "../utils/gsap";
import { waitForAppReady } from "../utils/preloader";
import { useTouchDevice } from "../hooks/useTouchDevice";

const Preloader = () => {
	const [count, setCount] = useState(0);
	const [loadingText, setLoadingText] = useState("Booting up...");
	const [isReady, setIsReady] = useState(false);
	const exitTimelineRef = useRef<gsap.core.Tween | null>(null);
	const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
	const labelRef = useRef<HTMLDivElement>(null);
	const isTouchDevice = useTouchDevice();

	const startExit = () => {
		if (exitTimelineRef.current) return;

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
			className={`preloader fixed bottom-0 left-0 w-full h-full bg-background z-200 flex flex-col items-center justify-center p-4 sm:p-8 isolate ${
				isReady && !isTouchDevice ? "cursor-none" : ""
			}`}
			onClick={() => isReady && startExit()}
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
					<div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-300 pointer-events-none text-foreground font-mono flex items-center gap-1 text-sm sm:text-base mix-blend-difference">
						Touch to Enter
						<span className="inline-block w-[0.5em] h-[1.2em] bg-foreground ml-1 align-bottom animate-[blink_1s_step-end_infinite]" />
					</div>
				) : (
					// Desktop: mouse following
					<div
						ref={labelRef}
						className="fixed top-0 left-0 z-300 pointer-events-none text-foreground font-mono flex items-center gap-1 text-sm sm:text-base will-change-transform mix-blend-difference"
						style={{
							// Initial off-screen position to avoid flash, updated by JS immediately
							transform: "translate3d(-1000px, -1000px, 0)",
						}}
					>
						Click
						<span className="inline-block w-[0.5em] h-[1.2em] bg-foreground ml-1 align-bottom animate-[blink_1s_step-end_infinite]" />
					</div>
				))}

			<div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 text-foreground/80 text-xs sm:text-sm font-mono">{loadingText}</div>
			<div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 text-foreground/80 text-xs sm:text-sm font-mono">{count}%</div>
			<div className="preloader-bar-container absolute bottom-0 left-0 w-full h-full z-20 mix-blend-difference">
				<div className="preloader-bar h-full bg-foreground" style={{ width: "0%" }}></div>
			</div>
			<style jsx>{`
				@keyframes blink {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0;
					}
				}
			`}</style>
		</div>
	);
};

export default Preloader;
