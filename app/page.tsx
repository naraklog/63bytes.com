import HomeClient from "./home-client";
import { getAllPosts, getAllCategories } from "./utils/mdx";

export default async function HomePage() {
	const [articles, categories] = await Promise.all([getAllPosts(), getAllCategories()]);
	return <HomeClient articles={articles} categories={categories} />;
}
