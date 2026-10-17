import { useTheme } from "./theme-context";

// Shared surface/text colors for the signed-in app pages.
export function usePalette() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return {
    isDark,
    toggleTheme,
    bg: isDark ? "#0a0a0c" : "#eceeef",
    panel: isDark ? "#131316" : "#ffffff",
    panelAlt: isDark ? "#18181b" : "#f4f4f5",
    border: isDark ? "#28282d" : "#dcdce0",
    borderStrong: isDark ? "#3f3f46" : "#b8b8bf",
    textPrimary: isDark ? "#f4f4f5" : "#18181b",
    textMuted: isDark ? "#8b8b93" : "#71717a",
    solid: isDark ? "#f4f4f5" : "#18181b",
    inverse: isDark ? "#18181b" : "#f4f4f5",
  };
}

export type Palette = ReturnType<typeof usePalette>;
