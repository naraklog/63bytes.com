export const CONTENT = {
	links: {
		about: { label: "ABOUT", href: "/about" },
		twitter: { label: "X(TWITTER)", href: process.env.NEXT_PUBLIC_X_URL || "#" },
		blog: { label: "BLOG", href: "/blog" },
		linkedin: { label: "LINKEDIN", href: process.env.NEXT_PUBLIC_LINKEDIN_URL || "#" },
		contact: { label: "CONTACT", href: process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : "#" },
		projects: { label: "PROJECTS", href: process.env.NEXT_PUBLIC_GITHUB_URL || "#" },
	},
};
