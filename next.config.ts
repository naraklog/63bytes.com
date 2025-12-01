import process from "node:process";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

Object.assign(process.env, { NEXT_TELEMETRY_DISABLED: "1" });

const prettyCodeOptions: PrettyCodeOptions = {
	keepBackground: false,
	theme: {
		dark: "github-dark",
		light: "github-light-high-contrast",
	},
};

const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
		rehypePlugins: [["rehype-pretty-code", prettyCodeOptions], "rehype-slug"],
	},
});

const nextConfig: NextConfig = {
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	env: {
		NEXT_TELEMETRY_DISABLED: "1",
	},
	images: {
		qualities: [70, 75, 100],
	},
};

export default withMDX(nextConfig);
