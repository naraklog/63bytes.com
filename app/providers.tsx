"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PostHogPageview() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (pathname) {
			let url = window.origin + pathname;
			if (searchParams && searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture("$pageview", {
				$current_url: url,
			});
		}
	}, [pathname, searchParams]);

	return null;
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
			person_profiles: "identified_only",
			capture_pageview: false, // We handle pageviews manually for better control in Next.js
		});
	}, []);

	return (
		<PostHogProvider client={posthog}>
			<PostHogPageview />
			{children}
		</PostHogProvider>
	);
}
