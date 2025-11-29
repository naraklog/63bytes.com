/**
 * Updates the browser's theme color and the document background color.
 * This handles both the <meta name="theme-color"> tag and the body/html background
 * to ensure consistent styling, especially on iOS Safari where the status bar
 * color is derived from these properties.
 *
 * @param color The color string (hex, rgb, etc.) to set
 */
export const setMetaThemeColor = (color: string) => {
	if (typeof window === "undefined") return;

	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute("content", color);
	}

	// Also update body/html background to ensure iOS Safari updates the status bar area
	// We rely on CSS transitions (if defined in globals.css) for smooth fading
	document.documentElement.style.backgroundColor = color;
	document.body.style.backgroundColor = color;
};
