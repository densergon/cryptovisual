import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "deep-space" | "entropy";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
	if (typeof window !== "undefined") {
		return (localStorage.getItem("cv_theme") as Theme) || "deep-space";
	}
	return "deep-space";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		localStorage.setItem("cv_theme", theme);
		document.documentElement.classList.remove(
			"theme-deep-space",
			"theme-entropy",
		);
		document.documentElement.classList.add(`theme-${theme}`);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "deep-space" ? "entropy" : "deep-space"));
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
