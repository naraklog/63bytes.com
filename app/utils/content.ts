export const CONTENT = {
	name: "John Doe",
	role: "I'm a software engineer and designer",
	links: {
		about: { label: "ABOUT", href: "#" },
		twitter: { label: "X(TWITTER)", href: process.env.NEXT_PUBLIC_X_URL || "#" },
		blog: { label: "BLOG", href: "/blog" },
		contact: { label: "CONTACT", href: process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : "#" },
		projects: { label: "PROJECTS", href: process.env.NEXT_PUBLIC_GITHUB_URL || "#" },
	},
};

