const STORAGE_KEY = "app:preloader-complete";

export const hasPreloaderRun = () => {
	if (typeof window === "undefined") return false;
	try {
		return window.sessionStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
};

export const markPreloaderComplete = () => {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, "true");
	} catch {
		// Ignore sessionStorage failures (e.g. Safari private mode)
	}
};

export const waitForAppReady = async () => {
	if (typeof window === "undefined") return;

	// Wait for document ready state
	if (document.readyState !== "complete") {
		await new Promise<void>((resolve) => {
			const handler = () => {
				window.removeEventListener("load", handler);
				resolve();
			};
			window.addEventListener("load", handler);
		});
	}

	// Wait for fonts
	if (document.fonts) {
		try {
			await document.fonts.ready;
		} catch (e) {
			console.warn("Font loading check failed", e);
		}
	}
};
