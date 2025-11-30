import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import CodeBlock from "./app/components/Blog/CodeBlock";
import LinkedHeading from "./app/components/Blog/LinkedHeading";

const baseLinkClass = "underline decoration-dotted underline-offset-4 transition-opacity";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: (props) => <LinkedHeading as="h1" {...props} />,
		h2: (props) => <LinkedHeading as="h2" {...props} />,
		h3: (props) => <LinkedHeading as="h3" {...props} />,
		h4: (props) => <LinkedHeading as="h4" {...props} />,
		h5: (props) => <LinkedHeading as="h5" {...props} />,
		h6: (props) => <LinkedHeading as="h6" {...props} />,
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
