export type IconKey = string; // Now allows any string since we resolve dynamically

// Map category names (lowercase) to their display icons
export const categoryIconMap: Record<string, string> = {
	log: "NotebookIcon",
};

export const DEFAULT_CATEGORY_ICON = "NewspaperIcon";

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
