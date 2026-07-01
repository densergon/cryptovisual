import { Activity, Moon } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="flex items-center gap-2 rounded-full bg-surface-800 border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-white transition-all active:scale-95"
		>
			{theme === "deep-space" ? <Moon size={14} /> : <Activity size={14} />}
			<span>{theme === "deep-space" ? "Deep Space" : "Entropy"}</span>
		</button>
	);
}
