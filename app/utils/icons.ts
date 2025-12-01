import * as PhosphorIcons from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

// Normalize "Shield", "ShieldIcon", or "shield" → ShieldIcon component
export function resolvePhosphorIcon(name: string): PhosphorIcon {
	// Handle empty or undefined
	if (!name) return PhosphorIcons.NewspaperIcon;

	// Handle various formats: "Shield", "ShieldIcon", "shield"
	// 1. Remove "Icon" suffix if present to get base name (case insensitive match at end)
	const normalized = name.replace(/Icon$/i, "");
	// 2. Capitalize first letter
	const pascalCase = normalized.charAt(0).toUpperCase() + normalized.slice(1);
	// 3. Add "Icon" suffix back
	const iconName = `${pascalCase}Icon`;

	// Cast PhosphorIcons to record to allow dynamic access
	const icons = PhosphorIcons as unknown as Record<string, PhosphorIcon>;

	return icons[iconName] ?? PhosphorIcons.NewspaperIcon;
}
