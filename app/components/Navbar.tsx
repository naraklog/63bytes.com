"use client";

import { useClock, useFlickerAnimation, useMorphState } from "../hooks";
import { useLayoutContext } from "../context/LayoutContext";
import NavDigit from "./NavDigit";

const Navbar = () => {
	const { formattedTime, timezone } = useClock();
	const { isNavVisible, isFlickerPhase } = useFlickerAnimation();
	const { isMorphActive, morphProgress, isSmallScreen } = useMorphState();
	const { leftDigitRef, rightDigitRef } = useLayoutContext();

	return (
		<header
			id="header"
			className={`fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-center transition-opacity duration-300 mix-blend-difference ${isNavVisible ? "opacity-100" : "opacity-0"}`}
		>
			{/* Left digit */}
			<div aria-hidden="true" className="absolute left-0 top-0 h-full flex items-center pl-8 select-none pointer-events-none">
				<NavDigit
					ref={leftDigitRef}
					label="six"
					digit="6"
					isFlickerPhase={isFlickerPhase}
					isMorphActive={isMorphActive}
					morphProgress={morphProgress}
					align="left"
					flickerClass="flicker-char-left"
					injectFilters={true}
					isSmallScreen={isSmallScreen}
				/>
			</div>

			{/* Center clock */}
			<div className="text-left">
				<div className="font-mono text-white/80 text-[clamp(0.7rem,2.5vw,0.8rem)]">{formattedTime || "\u00A0"}</div>
				<div className="font-mono text-light-gray tracking-tighter text-[clamp(0.7rem,2.5vw,0.8rem)]">{timezone ? `(${timezone})` : "\u00A0"}</div>
			</div>

			{/* Right digit */}
			<div aria-hidden="true" className="absolute right-0 top-0 h-full flex items-center pr-8 select-none pointer-events-none">
				<NavDigit
					ref={rightDigitRef}
					label="three"
					digit="3"
					isFlickerPhase={isFlickerPhase}
					isMorphActive={isMorphActive}
					morphProgress={morphProgress}
					align="right"
					flickerClass="flicker-char-right"
					injectFilters={false}
					isSmallScreen={isSmallScreen}
				/>
			</div>
		</header>
	);
};

export default Navbar;
