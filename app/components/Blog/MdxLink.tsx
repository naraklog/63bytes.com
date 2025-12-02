"use client";

import Link from "next/link";
import { useSound } from "../../context/SoundContext";

type MdxLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string;
	className?: string;
};

export default function MdxLink({ href, children, className, ...props }: MdxLinkProps) {
	const { playSound } = useSound();
	const isExternal = href.startsWith("http");

	const handleMouseEnter = () => playSound("hover");
	const handleClick = () => playSound("click");

	return isExternal ? (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className} onMouseEnter={handleMouseEnter} onClick={handleClick} {...props}>
			{children}
		</a>
	) : (
		<Link href={href} className={className} onMouseEnter={handleMouseEnter} onClick={handleClick} {...props}>
			{children}
		</Link>
	);
}

