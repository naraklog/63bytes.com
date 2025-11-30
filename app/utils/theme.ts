import { LIGHT_THEME_COLOR, DARK_THEME_COLOR } from "../components/Blog/Post/constants";

/**
 * Updates the browser's theme color and the document background color.
 * This handles both the <meta name="theme-color"> tag and the body/html background
 * to ensure consistent styling, especially on iOS Safari where the status bar
 * color is derived from these properties.
 *
 * @param color The color string (hex, rgb, etc.) to set
 * @param isDarkMode Whether the current theme is dark mode
 */
export const setMetaThemeColor = (color: string, isDarkMode: boolean) => {
	if (typeof window === "undefined") return;

	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute("content", color);
	}

	// Determine if mobile - check directly to avoid initial state lag
	const isMobile = window.matchMedia("(max-width: 768px)").matches;

	const themeColor = isDarkMode ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
	const oppositeColor = isDarkMode ? LIGHT_THEME_COLOR : DARK_THEME_COLOR;

	// On desktop, use opposite color for overscroll (body bg)
	// On mobile, use theme color
	const bgColor = isMobile ? themeColor : oppositeColor;

	// Also update body/html background to ensure iOS Safari updates the status bar area
	// We rely on CSS transitions (if defined in globals.css) for smooth fading
	document.documentElement.style.backgroundColor = bgColor;
	document.body.style.backgroundColor = bgColor;
};
