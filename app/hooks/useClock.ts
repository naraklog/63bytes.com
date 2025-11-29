import { useState, useEffect, useCallback } from "react";

type ClockOptions = {
	updateInterval?: number;
	locale?: string;
	hour12?: boolean;
};

type ClockReturn = {
	time: Date;
	formattedTime: string;
	timezone: string;
};

/**
 * A hook that manages time state and formatting.
 * Updates every second by default.
 */
export function useClock(options: ClockOptions = {}): ClockReturn {
	const { updateInterval = 1000, locale = "en-US", hour12 = true } = options;

	const [time, setTime] = useState(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, updateInterval);

		return () => clearInterval(timer);
	}, [updateInterval]);

	const formatTime = useCallback(
		(date: Date) => {
			return date.toLocaleTimeString(locale, {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12,
			});
		},
		[locale, hour12]
	);

	const getTimezone = useCallback(() => {
		// Get the user's timezone abbreviation
		try {
			const formatter = new Intl.DateTimeFormat(locale, { timeZoneName: "short" });
			const parts = formatter.formatToParts(time);
			const tzPart = parts.find((part) => part.type === "timeZoneName");
			return tzPart?.value ?? "UTC";
		} catch {
			return "UTC";
		}
	}, [locale, time]);

	return {
		time,
		formattedTime: formatTime(time),
		timezone: getTimezone(),
	};
}

