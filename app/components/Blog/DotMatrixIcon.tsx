"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { useSvgToImage } from "../../hooks/useSvgToImage";

// --- TYPES ---

interface PixelData {
	x: number;
	y: number;
	id: number;
}

interface SparkleData {
	cx: number;
	cy: number;
	radius: number;
}

export interface PixelIconDisplayProps {
	icon?: LucideIcon;
	svg?: React.ReactNode;
	gridSize: number;
	dotScale: number;
	color: string;
	shape?: "circle" | "square";
	sparkleEnabled?: boolean;
	enableOnHover?: boolean;
	sparkleDensity?: number;
	className?: string;
}

// --- PIXEL DISPLAY COMPONENT ---

const PixelIconDisplay: React.FC<PixelIconDisplayProps> = ({
	icon: Icon,
	svg,
	gridSize,
	dotScale,
	color,
	shape = "circle",
	sparkleEnabled = false,
	enableOnHover = false,
	sparkleDensity = 0.2,
	className = "",
}) => {
	const [pixelData, setPixelData] = useState<PixelData[]>([]);
	const [isHovered, setIsHovered] = useState(false);

	// 1. Convert Icon/SVG to Image URL
	const contentToRender = Icon ? <Icon size={gridSize} strokeWidth={2.5} fill="none" color="black" /> : svg;
	const { imageUrl, hiddenRef } = useSvgToImage<HTMLDivElement>(contentToRender, [gridSize]);

	// 2. Rasterization Phase: Runs when Image URL or GridSize changes
	useEffect(() => {
		if (!imageUrl) return;

		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = gridSize;
			canvas.height = gridSize;
			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			ctx.clearRect(0, 0, gridSize, gridSize);
			ctx.drawImage(img, 0, 0, gridSize, gridSize);

			const imageData = ctx.getImageData(0, 0, gridSize, gridSize).data;
			const newPixels: PixelData[] = [];

			for (let y = 0; y < gridSize; y++) {
				for (let x = 0; x < gridSize; x++) {
					const index = (y * gridSize + x) * 4;
					const alpha = imageData[index + 3];

					if (alpha > 50) {
						// We assign a stable random ID to each pixel for consistent sparkle behavior
						newPixels.push({ x, y, id: Math.random() });
					}
				}
			}

			setPixelData(newPixels);
		};

		img.src = imageUrl;
	}, [imageUrl, gridSize]);

	// 2. Partition Phase: Split pixels into Static vs Sparkling
	const { staticPath, sparkles } = useMemo(() => {
		if (pixelData.length === 0) return { staticPath: "", sparkles: [] as SparkleData[] };

		let d = "";
		const radius = 0.5 * dotScale;
		const sparkleList: SparkleData[] = [];

		// Determine if we should separate potential sparkle pixels from the static path
		// We do this if sparkles are enabled OR if hover-effect is enabled (so they are ready to animate)
		const shouldSeparate = sparkleEnabled || enableOnHover;

		pixelData.forEach((pixel) => {
			const { x, y, id } = pixel;

			// Determine if this pixel is a candidate for sparkling
			const isSparkleCandidate = shouldSeparate && id > 1 - sparkleDensity;

			const cx = x + 0.5;
			const cy = y + 0.5;

			if (isSparkleCandidate) {
				sparkleList.push({ cx, cy, radius });
			} else {
				// Add to the static path
				if (shape === "square") {
					const s = radius * 2;
					const x0 = cx - radius;
					const y0 = cy - radius;
					d += `M${x0.toFixed(3)} ${y0.toFixed(3)} h${s.toFixed(3)} v${s.toFixed(3)} h-${s.toFixed(3)} Z `;
				} else {
					d += `M${cx.toFixed(3)} ${cy.toFixed(3)} m -${radius.toFixed(3)}, 0 a ${radius.toFixed(3)},${radius.toFixed(3)} 0 1,0 ${(radius * 2).toFixed(3)},0 a ${radius.toFixed(
						3
					)},${radius.toFixed(3)} 0 1,0 -${(radius * 2).toFixed(3)},0 `;
				}
			}
		});

		return { staticPath: d, sparkles: sparkleList };
	}, [pixelData, dotScale, shape, sparkleEnabled, enableOnHover, sparkleDensity]); // Removed isHovered dependency

	return (
		<div className={`relative overflow-hidden ${className}`} onMouseEnter={() => enableOnHover && setIsHovered(true)} onMouseLeave={() => enableOnHover && setIsHovered(false)}>
			{/* CSS for Sparkle Animation - OPACITY ONLY, NO MOVEMENT */}
			<style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; } 
        }
      `}</style>

			{/* Hidden Render Container */}
			<div ref={hiddenRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none", zIndex: -1 }} aria-hidden="true">
				{contentToRender}
			</div>

			{/* Actual Display */}
			{pixelData.length > 0 ? (
				<svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="w-full h-full" style={{ color }}>
					{/* Layer 1: The Main Static Body (One single path for performance) */}
					<path d={staticPath} fill="currentColor" />

					{/* Layer 2: The Sparkles (Individual elements for animation) */}
					{sparkles.map((s, i) => {
						// Logic for the stabilizer overlay:
						// If sparkles are globally enabled, we never want to cover them (opacity 0).
						// If hover is enabled, we uncover them (opacity 0) when hovered, and cover them (opacity 1) when not.
						// Otherwise (shouldn't happen given useMemo logic, but safe fallback), cover them.
						const showSparkle = sparkleEnabled || (enableOnHover && isHovered);
						const stabilizerOpacity = showSparkle ? 0 : 1;

						const animationStyle = {
							animation: `twinkle ${1.5 + Math.random()}s ease-in-out infinite`,
							animationDelay: `${Math.random() * 2}s`,
						};

						const stabilizerStyle = {
							opacity: stabilizerOpacity,
							transition: "opacity 1s ease-in-out",
						};

						return (
							<React.Fragment key={i}>
								{shape === "square" ? (
									<>
										{/* Base Sparkling Layer */}
										<rect x={s.cx - s.radius} y={s.cy - s.radius} width={s.radius * 2} height={s.radius * 2} fill="currentColor" style={animationStyle} />
										{/* Stabilizer Overlay Layer */}
										<rect x={s.cx - s.radius} y={s.cy - s.radius} width={s.radius * 2} height={s.radius * 2} fill="currentColor" style={stabilizerStyle} />
									</>
								) : (
									<>
										{/* Base Sparkling Layer */}
										<circle cx={s.cx} cy={s.cy} r={s.radius} fill="currentColor" style={animationStyle} />
										{/* Stabilizer Overlay Layer */}
										<circle cx={s.cx} cy={s.cy} r={s.radius} fill="currentColor" style={stabilizerStyle} />
									</>
								)}
							</React.Fragment>
						);
					})}
				</svg>
			) : (
				<div className="animate-pulse w-full h-full bg-current opacity-20" />
			)}
		</div>
	);
};

export default PixelIconDisplay;
