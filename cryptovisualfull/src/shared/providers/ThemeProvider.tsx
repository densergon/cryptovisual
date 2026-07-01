import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "deep-space" | "entropy";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
	// Always use "deep-space" as the initial theme for SSR hydration consistency.
	// The useEffect will sync with localStorage after mount to prevent hydration mismatch.
	return "deep-space";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const stored = localStorage.getItem("cv_theme") as Theme | null;
		if (stored && stored !== theme) {
			setTheme(stored);
		}
		document.documentElement.classList.remove(
			"theme-deep-space",
			"theme-entropy",
		);
		document.documentElement.classList.add(`theme-${stored || theme}`);
	}, []); // Only run once on mount to sync with localStorage

	const toggleTheme = () => {
		const next = theme === "deep-space" ? "entropy" : "deep-space";
		localStorage.setItem("cv_theme", next);
		document.documentElement.classList.remove(
			"theme-deep-space",
			"theme-entropy",
		);
		document.documentElement.classList.add(`theme-${next}`);
		setTheme(next);
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
}
