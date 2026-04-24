"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function PostHogPageview() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (pathname && posthog.__loaded) {
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
	if (!posthog.__loaded) {
		return <>{children}</>;
	}

	return (
		<PostHogProvider client={posthog}>
			<Suspense fallback={null}>
				<PostHogPageview />
			</Suspense>
			{children}
		</PostHogProvider>
	);
}
