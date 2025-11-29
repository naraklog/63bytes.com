export type IconKey = "newspaper" | "gitBranch" | "shield" | "database" | "fileCode" | "component" | "menu" | "cpu";

export const iconKeys = ["newspaper", "gitBranch", "shield", "database", "fileCode", "component", "menu", "cpu"] as const satisfies IconKey[];

export type ArticleAuthor = {
	name: string;
	imageSrc?: string;
	url?: string;
};

export type ArticleItem = {
	href: string;
	label: string;
	dateTime: string;
	dateLabel: string;
	intro: string;
	authors: ArticleAuthor[];
	category: string;
	icon: IconKey;
};

export type ArticleFrontmatter = {
	title: string;
	description: string;
	date: string;
	category: string;
	authors?: ArticleAuthor[];
	icon?: IconKey;
	tags?: string[];
	heroImage?: string;
};

export type CategoryOption = {
	id: string;
	label: string;
	icon: IconKey;
};

export const categoryOptions: CategoryOption[] = [
	{ id: "all", label: "All", icon: "menu" },
	{ id: "compute", label: "Compute", icon: "cpu" },
	{ id: "migration", label: "Migration", icon: "gitBranch" },
	{ id: "security", label: "Security", icon: "shield" },
	{ id: "next.js", label: "Next.js", icon: "fileCode" },
	{ id: "caching", label: "Caching", icon: "database" },
	{ id: "rsc", label: "RSC", icon: "component" },
];
