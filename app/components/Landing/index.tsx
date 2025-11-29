"use client";

import { forwardRef, useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ScrambleText } from "../ScrambleText";
import { ArticleItem } from "../../types/posts";
import { hasPreloaderRun } from "../../utils/preloader";
import { CONTENT } from "../../utils/content";
import { LandingNavigation } from "./LandingNavigation";
import { LatestPostPreview } from "./LatestPostPreview";

type LandingSectionProps = {
  latestPost?: ArticleItem;
};

const LandingSection = forwardRef<HTMLElement, LandingSectionProps>(function LandingSection({ latestPost }, ref) {
  const [isLoaded, setIsLoaded] = useState(false);

  const horizontalRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const coordinatesRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const rafId = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  // Combine refs
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref]
  );

  useEffect(() => {
    if (hasPreloaderRun()) {
      setIsLoaded(true);
    }

    const handlePreloaderComplete = () => {
      setIsLoaded(true);
    };

    window.addEventListener("app:preloader-complete", handlePreloaderComplete);
    return () => window.removeEventListener("app:preloader-complete", handlePreloaderComplete);
  }, []);

  // Cache dimensions on mount and resize
  useEffect(() => {
    const updateRect = () => {
      if (sectionRef.current) {
        rectRef.current = sectionRef.current.getBoundingClientRect();
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    // Also update on scroll since the section might move relative to viewport if it's sticky/fixed or if layout changes
    window.addEventListener("scroll", updateRect); 
    
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // If no rect, try to get it once
    if (!rectRef.current && sectionRef.current) {
      rectRef.current = sectionRef.current.getBoundingClientRect();
    }
    
    if (!rectRef.current) return;

    // Use client coordinates directly since we have the cached rect
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const rect = rectRef.current;
      if (!rect) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (horizontalRef.current) {
        horizontalRef.current.style.transform = `translateY(${y}px)`;
      }
      if (verticalRef.current) {
        verticalRef.current.style.transform = `translateX(${x}px)`;
      }
      if (coordinatesRef.current) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const dx = (x - centerX);
        const dy = (centerY - y); // Invert Y so up is positive (North)

        const lat = parseFloat((Math.abs(dy) * 0.05).toFixed(3));
        const long = parseFloat((Math.abs(dx) * 0.05).toFixed(3));
        const latDir = dy >= 0 ? "N" : "S";
        const longDir = dx >= 0 ? "E" : "W";

        coordinatesRef.current.innerText = `[ ${long}° ${longDir} , ${lat}° ${latDir} ]`;
      }
    });
  }, []);

  return (
    <section
      ref={setRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 flex flex-col min-h-screen h-screen p-8 gap-8 border border-light-gray/20 bg-background text-foreground overflow-hidden"
    >
      {/* Cursor crosshairs */}
      <div ref={horizontalRef} className="absolute top-0 left-0 w-full h-px bg-light-gray/20 pointer-events-none z-5" style={{ willChange: "transform" }} />
      <div ref={verticalRef} className="absolute top-0 left-0 h-full w-px bg-light-gray/20 pointer-events-none z-5" style={{ willChange: "transform" }} />
      {/* Coordinates */}
      <div ref={coordinatesRef} className="hidden md:block absolute bottom-8 right-8 font-mono text-10xs text-off-white/70 pointer-events-none z-20 tabular-nums">
        <ScrambleText text="[ 0° E , 0° N ]" scrambleOnMount={isLoaded} />
      </div>

      {/* Bolder corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-light-gray z-20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-light-gray z-20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-light-gray z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-light-gray z-20" />

      <div className="absolute top-0 left-0 w-full h-[30%] z-0 pointer-events-none">
        <Image src="/map-narrow.avif" alt="Map background" fill className="object-cover object-left md:hidden" priority quality={100} sizes="100vw" />
        <Image src="/map-wide.avif" alt="Map background" fill className="object-cover object-left hidden md:block" priority quality={100} sizes="100vw" />
      </div>
      
      <div className="relative z-10 mt-auto h-[70%] flex flex-col justify-between gap-12 border-t border-light-gray/20 w-full">
        
        <LandingNavigation isLoaded={isLoaded} />

        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-x-2 gap-y-8">
          <div className="flex flex-col gap-4 mb-4 md:mb-12 order-2 md:order-1">
            <h1 className="text-4xl font-bold">
              <span aria-label={`Hi, I'm ${CONTENT.name}`}>
                <ScrambleText text="Hi, I'm " scrambleOnMount={isLoaded} />
                <ScrambleText text={CONTENT.name} className="text-off-white" scrambleOnMount={isLoaded} />
              </span>
            </h1>
            <span aria-label={CONTENT.role}>
              <ScrambleText as="p" className="text-lg text-light-gray/80" text={CONTENT.role} scrambleOnMount={isLoaded} />
            </span>
          </div>

          {latestPost && <LatestPostPreview latestPost={latestPost} />}
        </div>
      </div>
    </section>
  );
});

LandingSection.displayName = "LandingSection";

export default LandingSection;
