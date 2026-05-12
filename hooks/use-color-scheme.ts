import { useContext } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { ThemeContext } from "@/context/themeContext";

export function useColorScheme() {
	const context = useContext(ThemeContext);

	if (context?.theme) {
		return context.theme;
	}

	return useSystemColorScheme() ?? "light";
}
