import { Menu, Cpu, GitBranch, Shield, FileCode, Database, Component, Newspaper, type LucideIcon } from "lucide-react";
import type { IconKey } from "../../../types/posts";

export const iconComponents: Record<IconKey, LucideIcon> = {
	menu: Menu,
	newspaper: Newspaper,
	gitBranch: GitBranch,
	shield: Shield,
	database: Database,
	fileCode: FileCode,
	component: Component,
	cpu: Cpu,
};

