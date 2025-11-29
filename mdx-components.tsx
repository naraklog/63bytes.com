import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import CodeBlock from "./app/components/Blog/CodeBlock";

const baseLinkClass = "underline decoration-dotted underline-offset-4 transition-opacity";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		a: ({ href = "", children, ...props }) => {
			const isExternal = href.startsWith("http");
			return isExternal ? (
				<a href={href} target="_blank" rel="noopener noreferrer" className={baseLinkClass} {...props}>
					{children}
				</a>
			) : (
				<Link href={href} className={baseLinkClass} {...props}>
					{children}
				</Link>
			);
		},
		code: ({ className, ...props }) => <code className={className} {...props} />,
		pre: ({ className, children, ...props }) => (
			<CodeBlock className={className} {...props}>
				{children}
			</CodeBlock>
		),
		table: ({ className, ...props }) => (
			<div className="overflow-auto">
				<table className={["w-full border-collapse text-sm", className].filter(Boolean).join(" ")} {...props} />
			</div>
		),
		...components,
	};
}
