export const THEME_PRESET_KEYS = [
  "Light Mode",
  "Prestige",
  "Midnight",
  "Dark Mode",
  "Ocean Blue",
] as const;

export type ThemePresetKey = (typeof THEME_PRESET_KEYS)[number];

export interface ThemePreset {
  name: ThemePresetKey;
  description: string;
  primaryColor: string;
  sidebarColor: string;
  darkBackground: string;
  headerColor: string;
  fontFamily: string;
  borderRadius: string;
  sidebarStyle: "light" | "dark";
  colorMode: "light" | "dark";
  darkSurface: string;
  darkText: string;
  lightText: string;
  lightBackground: string;
  lightSurfaceSecondary: string;
  darkSurfaceSecondary: string;
  lightMutedText: string;
  darkMutedText: string;
  lightBorder: string;
  darkBorder: string;
  lightSidebarText: string;
  darkSidebarText: string;
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  "Light Mode": {
    name: "Light Mode",
    description: "Bright professional theme with light sidebar and blue accents",
    primaryColor: "#0066cc",
    sidebarColor: "#ffffff",
    darkBackground: "#111827",
    headerColor: "#ffffff",
    fontFamily: "Inter",
    borderRadius: "8",
    sidebarStyle: "light",
    colorMode: "light",
    darkSurface: "#1f2937",
    darkText: "#f9fafb",
    lightText: "#1f2937",
    lightBackground: "#f5f7fb",
    lightSurfaceSecondary: "#f9fafb",
    darkSurfaceSecondary: "#141d2b",
    lightMutedText: "#7e8896",
    darkMutedText: "#8a93a3",
    lightBorder: "#e6e7eb",
    darkBorder: "rgba(255,255,255,0.08)",
    lightSidebarText: "#626d7d",
    darkSidebarText: "#7b8fa3",
  },
  Prestige: {
    name: "Prestige",
    description: "Premium corporate look with violet tones and refined typography",
    primaryColor: "#8b5cf6",
    sidebarColor: "#1e1b4b",
    darkBackground: "#1e1b4b",
    headerColor: "#faf5ff",
    fontFamily: "Poppins",
    borderRadius: "12",
    sidebarStyle: "dark",
    colorMode: "light",
    darkSurface: "#312e81",
    darkText: "#f5f3ff",
    lightText: "#312e81",
    lightBackground: "#faf9ff",
    lightSurfaceSecondary: "#f6f3ff",
    darkSurfaceSecondary: "#27235f",
    lightMutedText: "#766f8f",
    darkMutedText: "#b7b2d4",
    lightBorder: "#e7e1f4",
    darkBorder: "rgba(255,255,255,0.1)",
    lightSidebarText: "#766f8f",
    darkSidebarText: "#b7b2d4",
  },
  Midnight: {
    name: "Midnight",
    description: "Full dark mode with sky-blue accents for low-light environments",
    primaryColor: "#38bdf8",
    sidebarColor: "#020617",
    darkBackground: "#020617",
    headerColor: "#0f172a",
    fontFamily: "Inter",
    borderRadius: "8",
    sidebarStyle: "dark",
    colorMode: "dark",
    darkSurface: "#0f172a",
    darkText: "#e2e8f0",
    lightText: "#0f172a",
    lightBackground: "#f4f8fb",
    lightSurfaceSecondary: "#eaf2f7",
    darkSurfaceSecondary: "#07101e",
    lightMutedText: "#718096",
    darkMutedText: "#94a3b8",
    lightBorder: "#dce7ef",
    darkBorder: "rgba(255,255,255,0.1)",
    lightSidebarText: "#718096",
    darkSidebarText: "#94a3b8",
  },
  "Dark Mode": {
    name: "Dark Mode",
    description: "Full dark mode with indigo accents",
    primaryColor: "#6366f1",
    sidebarColor: "#1a2332",
    darkBackground: "#111827",
    headerColor: "#1f2937",
    fontFamily: "Inter",
    borderRadius: "8",
    sidebarStyle: "dark",
    colorMode: "dark",
    darkSurface: "#1f2937",
    darkText: "#f3f4f6",
    lightText: "#111827",
    lightBackground: "#f5f7fb",
    lightSurfaceSecondary: "#f9fafb",
    darkSurfaceSecondary: "#141d2b",
    lightMutedText: "#6b7280",
    darkMutedText: "#9ca3af",
    lightBorder: "#e5e7eb",
    darkBorder: "rgba(255,255,255,0.08)",
    lightSidebarText: "#6b7280",
    darkSidebarText: "#9ca3af",
  },
  "Ocean Blue": {
    name: "Ocean Blue",
    description: "Oceanic blue tones with calm professional aesthetic",
    primaryColor: "#0369a1",
    sidebarColor: "#0c4a6e",
    darkBackground: "#0c4a6e",
    headerColor: "#e0f2fe",
    fontFamily: "system-ui",
    borderRadius: "6",
    sidebarStyle: "dark",
    colorMode: "light",
    darkSurface: "#075985",
    darkText: "#e0f2fe",
    lightText: "#0c4a6e",
    lightBackground: "#f2f8fb",
    lightSurfaceSecondary: "#e0f2fe",
    darkSurfaceSecondary: "#063b58",
    lightMutedText: "#54748a",
    darkMutedText: "#a9d8ed",
    lightBorder: "#c7e5f3",
    darkBorder: "rgba(255,255,255,0.1)",
    lightSidebarText: "#54748a",
    darkSidebarText: "#a9d8ed",
  },
};

const LEGACY_PRESET_MAP: Record<string, ThemePresetKey> = {
  default: "Light Mode",
  light: "Light Mode",
  total_dark: "Dark Mode",
  grey_black: "Dark Mode",
  navy_dark: "Midnight",
  slate_dark: "Midnight",
  forest_dark: "Ocean Blue",
};

export function normalizeThemePreset(preset?: string): ThemePresetKey {
  if (!preset) return "Dark Mode";
  if ((THEME_PRESET_KEYS as readonly string[]).includes(preset)) {
    return preset as ThemePresetKey;
  }

  const normalized = preset.trim().toLowerCase().replace(/\s+/g, "_");
  return LEGACY_PRESET_MAP[normalized] || "Dark Mode";
}

export function applyThemePresetToConfig<T extends Record<string, any>>(config: T, presetName: string): T {
  const presetKey = normalizeThemePreset(presetName);
  const preset = THEME_PRESETS[presetKey];

  return {
    ...config,
    darkModePreset: preset.name,
    colorMode: preset.colorMode,
    accentColor: preset.primaryColor,
    customLightPrimary: preset.primaryColor,
    customDarkPrimary: preset.primaryColor,
    customDarkBackground: preset.darkBackground,
    customDarkSurface: preset.darkSurface,
    customDarkText: preset.darkText,
    customLightSurface: preset.headerColor,
      customLightBackground: preset.lightBackground,
    customLightText: preset.lightText,
    navBackgroundLight: preset.headerColor,
    navBackgroundDark: preset.headerColor,
    sidebarBackgroundLight: preset.sidebarColor,
    sidebarBackgroundDark: preset.sidebarColor,
    fontFamily: preset.fontFamily,
    headingFont: preset.fontFamily,
    bodyFont: preset.fontFamily,
    borderRadius: preset.borderRadius,
    sidebarStyle: preset.sidebarStyle,
    mutedColorLight: preset.lightMutedText,
    mutedColorDark: preset.darkMutedText,
    borderColorLight: preset.lightBorder,
    borderColorDark: preset.darkBorder,
    navTextColorLight: preset.lightSidebarText,
    navTextColorDark: preset.darkSidebarText,
  };
}
