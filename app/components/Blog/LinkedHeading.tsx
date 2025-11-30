"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback, type ElementType, type ReactNode } from "react";
import { LinkIcon, CheckIcon } from "@phosphor-icons/react";

type LinkedHeadingProps = {
	as: ElementType;
	id?: string;
	children: ReactNode;
	className?: string;
	[key: string]: any;
};

export default function LinkedHeading({ as: Component, id, children, className = "", ...props }: LinkedHeadingProps) {
	const pathname = usePathname();
	const [copied, setCopied] = useState(false);

	if (!id) {
		return (
			<Component className={className} {...props}>
				{children}
			</Component>
		);
	}

	const href = `${pathname}#${id}`;

	const handleCopy = useCallback(async () => {
		const url = `${window.location.origin}${href}`;
		try {
			await navigator?.clipboard?.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}, [href]);

	return (
		<Component id={id} onClick={handleCopy} className={`group flex items-center gap-2 cursor-pointer ${className}`} {...props}>
			{children}
			<span
				className="text-current opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity p-1 inline-flex items-center justify-center"
				aria-label={copied ? "Link copied" : "Copy post URL"}
				role="button"
			>
				{copied ? <CheckIcon size={16} weight="bold" /> : <LinkIcon size={16} weight="bold" />}
			</span>
		</Component>
	);
}
