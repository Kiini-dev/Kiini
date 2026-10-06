import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { broadcastThemeUpdate } from '@/hooks/customizationBroadcast';
import { trpc } from '@/lib/trpc';
import { ThemeContext } from './ThemeContext';
import { applyThemePresetToConfig, normalizeThemePreset } from '@/lib/themePresets';

export interface ThemeConfig {
  // Dark Mode Presets
  darkModePreset?: string;
  
  // Card Styling
  cardBackgroundStyle?: string;
  customCardBackground?: string;
  customCardForeground?: string;
  cardBorderColor?: string;
  cardShadowStyle?: string;
  customCSS?: string;
  
  // Dark Mode Colors
  customDarkBackground?: string;
  customDarkSurface?: string;
  customDarkText?: string;
  customDarkPrimary?: string;
  customDarkSecondary?: string;
  customDarkAccent?: string;
  
  // Light Mode Colors
  customLightBackground?: string;
  customLightSurface?: string;
  customLightText?: string;
  customLightPrimary?: string;
  customLightSecondary?: string;
  customLightAccent?: string;
  
  // Font Configuration
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  fontSize?: string;
  fontWeight?: string;
  
  // Accent Color (applies to both themes)
  accentColor?: string;
  
  // Light Mode Typography
  h1ColorLight?: string;
  h2ColorLight?: string;
  h3ColorLight?: string;
  h4ColorLight?: string;
  h5ColorLight?: string;
  h6ColorLight?: string;
  bodyColorLight?: string;
  mutedColorLight?: string;
  
  // Dark Mode Typography
  h1ColorDark?: string;
  h2ColorDark?: string;
  h3ColorDark?: string;
  h4ColorDark?: string;
  h5ColorDark?: string;
  h6ColorDark?: string;
  bodyColorDark?: string;
  mutedColorDark?: string;
  
  // Button Styling
  buttonBgColorLight?: string;
  buttonBgColorDark?: string;
  buttonBorderRadius?: string;
  buttonPadding?: string;
  buttonFontSize?: string;
  buttonBorderColor?: string;
  buttonHoverBg?: string;
  buttonActiveBg?: string;
  buttonDisabledBg?: string;
  buttonDisabledText?: string;
  buttonActiveText?: string;
  
  // Navigation & Sidebar
  navBackgroundLight?: string;
  navBackgroundDark?: string;
  navTextColorLight?: string;
  navTextColorDark?: string;
  navBorderColor?: string;
  navHoverBg?: string;
  navActiveBg?: string;
  navHoverText?: string;
  navActiveText?: string;
  sidebarBackgroundLight?: string;
  sidebarBackgroundDark?: string;
  sidebarTextColorLight?: string;
  sidebarTextColorDark?: string;
  sidebarAccentColor?: string;
  
  // Sidebar Styling
  sidebarStyle?: string;
  sidebarWidth?: string;
  sidebarCollapsedWidth?: string;
  sidebarIconSize?: string;
  compactMode?: boolean;
  colorMode?: "light" | "dark";
  
  // Border & Spacing
  borderRadius?: string;
  borderColor?: string;
  borderColorLight?: string;
  borderColorDark?: string;
  
  // Background Themes
  backgroundGradient?: string;
  backgroundPattern?: string;
  backgroundImage?: string;
  
  // Form Input Styles
  formInputBg?: string;
  formInputBorder?: string;
  formInputText?: string;
  
  // Table Styles
  tableBg?: string;
  tableBorder?: string;
  tableText?: string;
  
  // Modal Styles
  modalBg?: string;
  modalBorder?: string;
  modalText?: string;
  
  // Tooltip Styles
  tooltipBg?: string;
  tooltipText?: string;
  
  // Dropdown Styles
  dropdownBg?: string;
  dropdownBorder?: string;
  dropdownText?: string;
  
  // Additional customizations
  [key: string]: any;
}

interface ThemeContextType {
  config: ThemeConfig;
  updateThemeConfig: (config: ThemeConfig) => void;
  applyThemeToDOM: () => void;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  updateTheme: (config: ThemeConfig) => void;
}

const ThemeCustomizationContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeCustomizationProvider({ children }: ThemeProviderProps) {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme ?? 'light';
  const [hasHydratedServer, setHasHydratedServer] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      const stored = localStorage.getItem('kiini_theme_config');
      const parsed = stored ? JSON.parse(stored) : {};
      return applyThemePresetToConfig(parsed, normalizeThemePreset(parsed?.darkModePreset || "Light Mode"));
    } catch {
      return applyThemePresetToConfig({}, 'Light Mode');
    }
  });

  const themeConfigQuery = trpc.themeCustomization.getConfig.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  });

  useEffect(() => {
    if (!themeConfigQuery.data || hasHydratedServer) return;

    setConfig(prev => {
      const hasLocal = typeof window !== 'undefined' && !!localStorage.getItem('kiini_theme_config');
      if (hasLocal) return prev;
      return applyThemePresetToConfig(
        themeConfigQuery.data,
        normalizeThemePreset(themeConfigQuery.data?.darkModePreset)
      );
    });

    setHasHydratedServer(true);
  }, [themeConfigQuery.data, hasHydratedServer]);

  // Legacy theme settings are no longer loaded via a raw /api/trpc fetch.
  // The theme customization query above is the single source of truth.

  const updateThemeConfig = (newConfig: ThemeConfig) => {
    setConfig(prev => {
      const merged = { ...prev, ...newConfig };
      const presetConfig = applyThemePresetToConfig(merged, normalizeThemePreset(merged.darkModePreset));
      return { ...presetConfig, ...newConfig };
    });
  };

  const applyThemeToDOM = () => {
    if (typeof window === 'undefined') return;

    const root = document?.documentElement;
    if (!root || !root.classList || !root.style) return;

    
    // Font Configuration
    if (config.fontFamily) {
      root.style.setProperty('--font-family', config.fontFamily);
      if (document.body) {
        document.body.style.fontFamily = config.fontFamily;
      }
    }
    if (config.headingFont) {
      root.style.setProperty('--heading-font', config.headingFont);
    }
    if (config.bodyFont) {
      root.style.setProperty('--body-font', config.bodyFont);
      if (document.body) {
        document.body.style.fontFamily = config.bodyFont;
      }
    }
    if (config.fontSize) {
      root.style.setProperty('--font-size-base', config.fontSize);
    }
    if (config.fontWeight) {
      root.style.setProperty('--font-weight', config.fontWeight);
    }

    const effectiveThemeMode = theme;

    // Respect the active app theme first. The theme toggle updates the live theme context,
    // so this keeps the DOM class in sync even when a stale or persisted config says otherwise.
    if (effectiveThemeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Accent Color (applies to both themes)
    if (config.accentColor) {
      root.style.setProperty('--theme-accent', config.accentColor);
    }
    
    // Light Mode Colors — theme sets scoped --theme-* vars only
    if (config.customLightBackground) {
      root.style.setProperty('--theme-light-bg', config.customLightBackground);
    }
    if (config.customLightSurface) {
      root.style.setProperty('--theme-light-surface', config.customLightSurface);
    }
    if (config.customLightText) {
      root.style.setProperty('--theme-light-text', config.customLightText);
    }
    if (config.customLightPrimary) {
      root.style.setProperty('--theme-light-primary', config.customLightPrimary);
    }
    if (config.customLightSecondary) {
      root.style.setProperty('--theme-light-secondary', config.customLightSecondary);
    }
    if (config.customLightAccent) {
      root.style.setProperty('--theme-light-accent', config.customLightAccent);
    }
    
    // Light Mode Typography
    if (config.h1ColorLight) {
      root.style.setProperty('--theme-h1-light', config.h1ColorLight);
    }
    if (config.h2ColorLight) {
      root.style.setProperty('--theme-h2-light', config.h2ColorLight);
    }
    if (config.h3ColorLight) {
      root.style.setProperty('--theme-h3-light', config.h3ColorLight);
    }
    if (config.h4ColorLight) {
      root.style.setProperty('--theme-h4-light', config.h4ColorLight);
    }
    if (config.h5ColorLight) {
      root.style.setProperty('--theme-h5-light', config.h5ColorLight);
    }
    if (config.h6ColorLight) {
      root.style.setProperty('--theme-h6-light', config.h6ColorLight);
    }
    if (config.bodyColorLight) {
      root.style.setProperty('--theme-body-light', config.bodyColorLight);
    }
    if (config.mutedColorLight) {
      root.style.setProperty('--theme-muted-light', config.mutedColorLight);
    }
    
    if (config.customDarkBackground) {
      root.style.setProperty('--theme-dark-bg', config.customDarkBackground);
    }
    if (config.customDarkSurface) {
      root.style.setProperty('--theme-dark-surface', config.customDarkSurface);
    }
    if (config.customDarkText) {
      root.style.setProperty('--theme-dark-text', config.customDarkText);
    }
    if (config.customDarkPrimary) {
      root.style.setProperty('--theme-dark-primary', config.customDarkPrimary);
    }
    if (config.customDarkSecondary) {
      root.style.setProperty('--theme-dark-secondary', config.customDarkSecondary);
    }
    if (config.customDarkAccent) {
      root.style.setProperty('--theme-dark-accent', config.customDarkAccent);
    }
    
    // Dark Mode Typography
    if (config.h1ColorDark) {
      root.style.setProperty('--theme-h1-dark', config.h1ColorDark);
    }
    if (config.h2ColorDark) {
      root.style.setProperty('--theme-h2-dark', config.h2ColorDark);
    }
    if (config.h3ColorDark) {
      root.style.setProperty('--theme-h3-dark', config.h3ColorDark);
    }
    if (config.h4ColorDark) {
      root.style.setProperty('--theme-h4-dark', config.h4ColorDark);
    }
    if (config.h5ColorDark) {
      root.style.setProperty('--theme-h5-dark', config.h5ColorDark);
    }
    if (config.h6ColorDark) {
      root.style.setProperty('--theme-h6-dark', config.h6ColorDark);
    }
    if (config.bodyColorDark) {
      root.style.setProperty('--theme-body-dark', config.bodyColorDark);
    }
    if (config.mutedColorDark) {
      root.style.setProperty('--theme-muted-dark', config.mutedColorDark);
    }
    
    // Card Background Styling
    if (config.cardBackgroundStyle) {
      root.style.setProperty('--card-bg-style', config.cardBackgroundStyle);
    }
    if (config.customCardBackground) {
      root.style.setProperty('--custom-card-bg', config.customCardBackground);
    }
    if (config.customCardForeground) {
      root.style.setProperty('--custom-card-fg', config.customCardForeground);
    }
    if (config.cardBorderColor) {
      root.style.setProperty('--card-border-color', config.cardBorderColor);
    }
    if (config.cardShadowStyle) {
      root.style.setProperty('--card-shadow-style', config.cardShadowStyle);
    }

    // ====== Bridge theme vars to Tailwind CSS variables for sitewide effect ======
    const themeIsDark = root.classList.contains('dark');

    // Kiini: One Hub. Total Control-compatible semantic tokens keep the app shell, auth screens,
    // cards, forms, tables, and charts on the same mode-specific palette.
    const palette = themeIsDark ? {
      body: config.customDarkBackground,
      surface: config.customDarkSurface,
      surfaceSecondary: config.customDarkSurface,
      text: config.customDarkText,
      muted: config.mutedColorDark,
      border: config.borderColorDark,
      sidebarText: config.sidebarTextColorDark || config.mutedColorDark,
    } : {
      body: config.customLightBackground,
      surface: config.customLightSurface,
      surfaceSecondary: config.customLightBackground,
      text: config.customLightText,
      muted: config.mutedColorLight,
      border: config.borderColorLight,
      sidebarText: config.sidebarTextColorLight || config.mutedColorLight,
    };
    const semanticTokens: Record<string, string | undefined> = {
      '--body-bg': palette.body,
      '--bg-surface': palette.surface,
      '--bg-surface-secondary': palette.surfaceSecondary,
      '--text': palette.text,
      '--text-secondary': palette.muted,
      '--text-muted': palette.muted,
      '--border-color': palette.border,
      '--border-color-light': palette.border,
      '--sidebar-text': palette.sidebarText,
      '--primary-dk': config.accentColor,
      '--radius-sm': '4px',
      '--radius-lg': '8px',
    };
    Object.entries(semanticTokens).forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });

    // Primary color → Tailwind --primary, --sidebar-primary, --ring
    const primary = themeIsDark ? config.customDarkPrimary : config.customLightPrimary;
    if (primary) {
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--sidebar-primary', primary);
      root.style.setProperty('--ring', primary);
    }
    if (config.accentColor) {
      root.style.setProperty('--primary', config.accentColor);
      root.style.setProperty('--sidebar-primary', config.accentColor);
      root.style.setProperty('--ring', config.accentColor);
    }

    // Accent color → Tailwind --accent
    const accent = themeIsDark ? config.customDarkAccent : config.customLightAccent;
    if (accent) {
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--sidebar-accent', accent);
    }

    // Background color → Tailwind --background
    const bg = themeIsDark ? config.customDarkBackground : config.customLightBackground;
    if (bg) {
      root.style.setProperty('--background', bg);
    }

    // Keep the sidebar palette independent from the page background palette.
    const sidebar = themeIsDark
      ? config.sidebarBackgroundDark || config.customDarkBackground || '#1a2332'
      : config.sidebarBackgroundLight || config.customLightBackground || '#ffffff';
    if (sidebar) {
      root.style.setProperty('--sidebar', sidebar);
      // Auto-detect if sidebar color is dark → set light foreground text
      const hex = sidebar.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance < 0.5) {
          // Dark sidebar → light text
          root.style.setProperty('--sidebar-foreground', '#e2e8f0');
          root.style.setProperty('--sidebar-accent', hex.length === 6 ? `#${Math.min(255, r + 30).toString(16).padStart(2, '0')}${Math.min(255, g + 30).toString(16).padStart(2, '0')}${Math.min(255, b + 30).toString(16).padStart(2, '0')}` : '#334155');
          root.style.setProperty('--sidebar-accent-foreground', '#f1f5f9');
          root.style.setProperty('--sidebar-border', `rgba(255,255,255,0.1)`);
        } else {
          // Light sidebar → dark text
          root.style.setProperty('--sidebar-foreground', '#1e293b');
          root.style.setProperty('--sidebar-accent-foreground', '#0f172a');
          root.style.setProperty('--sidebar-border', `rgba(0,0,0,0.1)`);
        }
      }
    }

    // Surface color → Tailwind --card, --popover
    const surface = themeIsDark ? config.customDarkSurface : config.customLightSurface;
    if (surface) {
      root.style.setProperty('--card', surface);
      root.style.setProperty('--popover', surface);
    }

    // Text color → Tailwind --foreground
    const text = themeIsDark ? config.customDarkText : config.customLightText;
    if (text) {
      root.style.setProperty('--foreground', text);
      root.style.setProperty('--card-foreground', text);
      root.style.setProperty('--popover-foreground', text);
      root.style.setProperty('--sidebar-foreground', text);
    }

    // Secondary color → Tailwind --secondary
    const secondary = themeIsDark ? config.customDarkSecondary : config.customLightSecondary;
    if (secondary) {
      root.style.setProperty('--secondary', secondary);
    }

    // Border radius — convert raw number to px unit for CSS calc() compatibility
    if (config.borderRadius) {
      const val = config.borderRadius;
      // If it's a plain number (e.g. "8"), append "px"; otherwise use as-is (e.g. "0.65rem")
      const radiusValue = /^\d+(\.\d+)?$/.test(val) ? `${val}px` : val;
      root.style.setProperty('--radius', radiusValue);
    }

    // ====== Button Styling ======
    if (config.buttonBgColorLight) {
      root.style.setProperty('--button-bg-light', config.buttonBgColorLight);
    }
    if (config.buttonBgColorDark) {
      root.style.setProperty('--button-bg-dark', config.buttonBgColorDark);
    }
    if (config.buttonBorderRadius) {
      root.style.setProperty('--button-radius', config.buttonBorderRadius);
    }
    if (config.buttonPadding) {
      root.style.setProperty('--button-padding', config.buttonPadding);
    }
    if (config.buttonFontSize) {
      root.style.setProperty('--button-font-size', config.buttonFontSize);
    }
    if (config.buttonBorderColor) {
      root.style.setProperty('--button-border', config.buttonBorderColor);
    }
    if (config.buttonHoverBg) {
      root.style.setProperty('--button-hover', config.buttonHoverBg);
    }
    if (config.buttonActiveBg) {
      root.style.setProperty('--button-active-bg', config.buttonActiveBg);
    }
    if (config.buttonDisabledBg) {
      root.style.setProperty('--button-disabled-bg', config.buttonDisabledBg);
    }
    if (config.buttonDisabledText) {
      root.style.setProperty('--button-disabled-text', config.buttonDisabledText);
    }
    if (config.buttonActiveText) {
      root.style.setProperty('--button-active-text', config.buttonActiveText);
    }

    // ====== Navigation Styling ======
    if (config.navBackgroundLight) {
      root.style.setProperty('--nav-bg-light', config.navBackgroundLight);
    }
    if (config.navBackgroundDark) {
      root.style.setProperty('--nav-bg-dark', config.navBackgroundDark);
    }
    if (config.navTextColorLight) {
      root.style.setProperty('--nav-text-light', config.navTextColorLight);
    }
    if (config.navTextColorDark) {
      root.style.setProperty('--nav-text-dark', config.navTextColorDark);
    }
    if (config.navBorderColor) {
      root.style.setProperty('--nav-border', config.navBorderColor);
    }
    if (config.navHoverBg) {
      root.style.setProperty('--nav-hover-bg', config.navHoverBg);
    }
    if (config.navActiveBg) {
      root.style.setProperty('--nav-active-bg', config.navActiveBg);
    }
    if (config.navHoverText) {
      root.style.setProperty('--nav-hover-text', config.navHoverText);
    }
    if (config.navActiveText) {
      root.style.setProperty('--nav-active-text', config.navActiveText);
    }

    // ====== Sidebar Styling ======
    if (config.sidebarBackgroundLight) {
      root.style.setProperty('--sidebar-bg-light', config.sidebarBackgroundLight);
    }
    if (config.sidebarBackgroundDark) {
      root.style.setProperty('--sidebar-bg-dark', config.sidebarBackgroundDark);
    }
    if (config.sidebarTextColorLight) {
      root.style.setProperty('--sidebar-text-light', config.sidebarTextColorLight);
    }
    if (config.sidebarTextColorDark) {
      root.style.setProperty('--sidebar-text-dark', config.sidebarTextColorDark);
    }
    if (config.sidebarAccentColor) {
      root.style.setProperty('--sidebar-accent-color', config.sidebarAccentColor);
    }
    if (config.sidebarWidth) {
      root.style.setProperty('--sidebar-width', config.sidebarWidth);
    }
    if (config.sidebarCollapsedWidth) {
      root.style.setProperty('--sidebar-collapsed-width', config.sidebarCollapsedWidth);
    }
    if (config.sidebarIconSize) {
      root.style.setProperty('--sidebar-icon-size', config.sidebarIconSize);
    }
    if (config.sidebarStyle) {
      root.style.setProperty('--sidebar-style', config.sidebarStyle);
    }
    if (config.compactMode !== undefined) {
      root.style.setProperty('--compact-mode', config.compactMode ? 'true' : 'false');
    }

    // ====== Border & Spacing ======
    if (config.borderColor) {
      root.style.setProperty('--border', config.borderColor);
    }
    if (config.borderColorLight) {
      root.style.setProperty('--border-light', config.borderColorLight);
    }
    if (config.borderColorDark) {
      root.style.setProperty('--border-dark', config.borderColorDark);
    }

    // ====== Background Themes ======
    if (config.backgroundGradient) {
      root.style.setProperty('--bg-gradient', config.backgroundGradient);
    }
    if (config.backgroundPattern) {
      root.style.setProperty('--bg-pattern', config.backgroundPattern);
    }
    if (config.backgroundImage) {
      root.style.setProperty('--bg-image', config.backgroundImage);
    }

    // ====== Form Input Styles ======
    if (config.formInputBg) {
      root.style.setProperty('--form-input-bg', config.formInputBg);
    }
    if (config.formInputBorder) {
      root.style.setProperty('--form-input-border', config.formInputBorder);
    }
    if (config.formInputText) {
      root.style.setProperty('--form-input-text', config.formInputText);
    }

    // ====== Table Styles ======
    if (config.tableBg) {
      root.style.setProperty('--table-bg', config.tableBg);
    }
    if (config.tableBorder) {
      root.style.setProperty('--table-border', config.tableBorder);
    }
    if (config.tableText) {
      root.style.setProperty('--table-text', config.tableText);
    }

    // ====== Modal Styles ======
    if (config.modalBg) {
      root.style.setProperty('--modal-bg', config.modalBg);
    }
    if (config.modalBorder) {
      root.style.setProperty('--modal-border', config.modalBorder);
    }
    if (config.modalText) {
      root.style.setProperty('--modal-text', config.modalText);
    }

    // ====== Tooltip Styles ======
    if (config.tooltipBg) {
      root.style.setProperty('--tooltip-bg', config.tooltipBg);
    }
    if (config.tooltipText) {
      root.style.setProperty('--tooltip-text', config.tooltipText);
    }

    // ====== Dropdown Styles ======
    if (config.dropdownBg) {
      root.style.setProperty('--dropdown-bg', config.dropdownBg);
    }
    if (config.dropdownBorder) {
      root.style.setProperty('--dropdown-border', config.dropdownBorder);
    }
    if (config.dropdownText) {
      root.style.setProperty('--dropdown-text', config.dropdownText);
    }

    if (config.customCSS) {
      let customStyle = document.getElementById('kiini-theme-custom-css') as HTMLStyleElement | null;
      if (!customStyle) {
        const head = document?.head;
        if (head && typeof head.appendChild === 'function') {
          customStyle = document.createElement('style');
          customStyle.id = 'kiini-theme-custom-css';
          try {
            head.appendChild(customStyle);
          } catch {
            // Ignore DOM errors in environments where the head is unavailable or unstable.
          }
        }
      }
      if (customStyle) {
        customStyle.textContent = config.customCSS;
      }
    } else {
      const customStyle = document.getElementById('kiini-theme-custom-css');
      if (customStyle && typeof customStyle.remove === 'function') {
        customStyle.remove();
      }
    }
  };

  // Apply before paint so header toggles update the full preset immediately.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if (Object.keys(config).length > 0) {
      localStorage.setItem('kiini_theme_config', JSON.stringify(config));
      applyThemeToDOM();
    }
  }, [config, theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || Object.keys(config).length === 0) return;
    broadcastThemeUpdate(config);
  }, [config]);

  return (
    <ThemeCustomizationContext.Provider value={{
      config,
      updateThemeConfig,
      applyThemeToDOM,
      primaryColor: config.customLightPrimary || config.accentColor || '#3b82f6',
      secondaryColor: config.customLightSecondary || '#6366f1',
      borderRadius: config.borderRadius || '0.5rem',
      updateTheme: updateThemeConfig,
    }}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization() {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within ThemeCustomizationProvider');
  }
  return context;
}

// For store-like interface compatibility
export const useThemeStore = useThemeCustomization;
