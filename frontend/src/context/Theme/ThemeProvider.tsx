import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { Theme } from "../../types";

interface ThemeProviderProps {
	children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		return (localStorage.getItem("theme") as Theme) || "dark";
	});

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
