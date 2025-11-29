import type { Viewport } from "next";
import BlogSection from "../components/Blog/BlogSection";
import { formatFullDate } from "../utils/date";
import Dither from "../components/Dither";
import TransitionLink from "../components/TransitionLink";
import { ScrambleText } from "../components/ScrambleText";
import { getAllPosts } from "../utils/mdx";

export const viewport: Viewport = {
	themeColor: "#fafafa",
};

export default async function BlogPage() {
	const articles = await getAllPosts();
	const [latestArticle, ...restArticles] = articles;
	const fallbackItems = latestArticle ? restArticles : articles;

	const header = (
		<div className="flex flex-col gap-6">
			<TransitionLink
				href="/"
				transitionLabel="Home"
				className="hidden md:inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-tight text-black transition-colors px-3 py-2"
			>
				<span aria-hidden="true">←</span>
				<ScrambleText text="Back to home" scrambleOnHover={true} />
			</TransitionLink>
			{latestArticle ? (
				<article className="relative overflow-hidden w-full border border-light-gray/25 bg-background p-6 md:p-12">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 opacity-80 mix-blend-screen">
							<Dither waveColor={[0.7, 0.7, 0.7]} colorNum={6} pixelSize={1.2} enableMouseInteraction={false} />
						</div>
						<div className="absolute inset-0 bg-linear-to-b from-black/85 via-black/70 to-transparent" />
					</div>
					<div className="relative z-10 flex flex-col gap-5">
						<div className="hidden md:flex flex-wrap items-center gap-3 text-sm">
							<span className="border border-white/40 px-3 py-0.5 text-xs uppercase tracking-wide text-black bg-white/80">{latestArticle.category}</span>
						</div>
						<h2 className="text-2xl md:text-4xl font-semibold text-off-white">{latestArticle.label}</h2>
						<p className="text-sm md:text-lg text-off-white/70 leading-relaxed max-w-3xl">{latestArticle.intro}</p>
						<div className="flex flex-wrap items-center justify-between gap-4">
							<span className="text-sm text-off-white/70">
								By {latestArticle.authors.map((a) => a.name).join(" and ")} · {formatFullDate(latestArticle.dateTime)}
							</span>
							<TransitionLink
								href={latestArticle.href}
								className="inline-flex items-center justify-center gap-2 border border-white bg-white/80 text-black px-4 py-2 font-mono text-xs tracking-tight uppercase transition-colors w-[150px]"
								transitionLabel={latestArticle.label}
							>
								<ScrambleText text="Read the latest" scrambleOnHover={true} />
							</TransitionLink>
						</div>
					</div>
				</article>
			) : null}
		</div>
	);

	return (
		<main className="bg-foreground text-background min-h-screen">
			<BlogSection header={header} limit={fallbackItems.length || undefined} showViewAllButton={false} items={fallbackItems} />
		</main>
	);
}
