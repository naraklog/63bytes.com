import { StackIcon, CpuIcon, GitBranchIcon, NewspaperIcon, DatabaseIcon, ShieldIcon, FileCodeIcon, DiamondsFourIcon, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { IconKey } from "../../../types/posts";

export const iconComponents: Record<IconKey, PhosphorIcon> = {
	menu: StackIcon,
	newspaper: NewspaperIcon,
	gitBranch: GitBranchIcon,
	shield: ShieldIcon,
	database: DatabaseIcon,
	fileCode: FileCodeIcon,
	component: DiamondsFourIcon,
	cpu: CpuIcon,
};
