import { setMetaThemeColor } from "./theme";
import { LIGHT_THEME_COLOR, DARK_THEME_COLOR } from "../components/Blog/Post/constants";

const STYLE_ID = "theme-transition-styles";

/**
 * CSS for rectangle bottom-up wipe animation using View Transitions API
 */
const TRANSITION_CSS = `
::view-transition-group(root) {
  animation-duration: 0.7s;
  animation-timing-function: var(--expo-out);
}

::view-transition-new(root) {
  animation-name: reveal-light;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation-name: reveal-dark;
}

@keyframes reveal-dark {
  from {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

@keyframes reveal-light {
  from {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
`;

/**
 * Injects the view transition CSS into the document head
 */
function injectTransitionStyles(): void {
	if (typeof window === "undefined") return;

	let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

	if (!styleElement) {
		styleElement = document.createElement("style");
		styleElement.id = STYLE_ID;
		document.head.appendChild(styleElement);
	}

	styleElement.textContent = TRANSITION_CSS;
}

/**
 * Toggles the theme with a smooth View Transitions animation.
 * Falls back to instant toggle on unsupported browsers.
 *
 * @param currentIsDark - Whether the current theme is dark
 * @param setIsDarkMode - State setter for the dark mode flag
 */
export function toggleThemeWithTransition(
	currentIsDark: boolean,
	setIsDarkMode: (isDark: boolean) => void
): void {
	if (typeof window === "undefined") return;

	const newIsDark = !currentIsDark;

	const switchTheme = () => {
		setIsDarkMode(newIsDark);
		setMetaThemeColor(newIsDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
	};

	// Fallback for browsers that don't support View Transitions API
	if (!document.startViewTransition) {
		switchTheme();
		return;
	}

	// Inject animation styles before starting transition
	injectTransitionStyles();

	// Start the view transition
	document.startViewTransition(switchTheme);
}

