"use client";

import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

type CodeBlockProps = ComponentPropsWithoutRef<"pre">;

const joinClassNames = (...values: Array<string | undefined | null>) => values.filter(Boolean).join(" ");

export default function CodeBlock({ className, children, ...props }: CodeBlockProps) {
	const preRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);
	const [codeText, setCodeText] = useState("");

	useEffect(() => {
		const codeNode = preRef.current?.querySelector("code");
		const text = codeNode?.innerText || codeNode?.textContent || "";
		setCodeText(text.trimEnd());
		setCopied(false);
	}, [children]);

	const handleCopy = useCallback(async () => {
		const text = codeText || preRef.current?.querySelector("code")?.innerText || "";
		const clipboard = typeof navigator === "undefined" ? null : navigator.clipboard;
		if (!text || !clipboard?.writeText) return;
		try {
			await clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}, [codeText]);

	return (
		<div className="code-block-shell">
			<button type="button" className="code-copy-button" onClick={handleCopy} aria-live="polite" data-copied={copied ? "true" : "false"}>
				{copied ? <CheckIcon size={16} aria-hidden="true" /> : <CopyIcon size={16} weight="duotone" aria-hidden="true" />}
			</button>
			<pre ref={preRef} className={joinClassNames("code-block", className)} {...props}>
				{children}
			</pre>
		</div>
	);
}
