import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';
import { ThemeContext } from './ThemeContext';
import { useThemeCustomization } from './ThemeCustomizationContext';
import { applyThemePresetToConfig, normalizeThemePreset } from '@/lib/themePresets';

export interface OrgThemeConfig {
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

interface OrgThemeContextType {
  config: OrgThemeConfig;
  updateThemeConfig: (config: OrgThemeConfig) => void;
  applyThemeToDOM: () => void;
  isLoading: boolean;
}

const OrgThemeCustomizationContext = createContext<OrgThemeContextType | undefined>(undefined);

interface OrgThemeProviderProps {
  children: ReactNode;
  organizationId: string;
}

export function OrgThemeCustomizationProvider({ children, organizationId }: OrgThemeProviderProps) {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme ?? 'light';
  const { applyThemeToDOM: applyGlobalThemeToDOM } = useThemeCustomization();
  const [hasHydratedServer, setHasHydratedServer] = useState(false);
  const localStorageKey = `org_${organizationId}_theme_config`;
  
  const [config, setConfig] = useState<OrgThemeConfig>(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      const parsed = stored ? JSON.parse(stored) : {};
      return applyThemePresetToConfig(parsed, normalizeThemePreset(parsed?.darkModePreset));
    } catch {
      return applyThemePresetToConfig({}, 'Light Mode');
    }
  });

  const themeConfigQuery = trpc.orgThemeCustomization.getConfig.useQuery(organizationId, {
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined' && !!organizationId,
  });

  useEffect(() => {
    if (!themeConfigQuery.data || hasHydratedServer) return;

    setConfig(prev => {
      const hasLocal = typeof window !== 'undefined' && !!localStorage.getItem(localStorageKey);
      if (hasLocal) return prev;
      return applyThemePresetToConfig(
        themeConfigQuery.data.config,
        normalizeThemePreset(themeConfigQuery.data.config?.darkModePreset)
      );
    });

    setHasHydratedServer(true);
  }, [themeConfigQuery.data, hasHydratedServer, localStorageKey]);

  const updateThemeConfig = (newConfig: OrgThemeConfig) => {
    setConfig(prev => {
      const merged = { ...prev, ...newConfig };
      return applyThemePresetToConfig(merged, normalizeThemePreset(merged.darkModePreset));
    });
  };

  const applyThemeToDOM = () => {
    if (typeof window === 'undefined') return;

    const root = document?.documentElement;
    if (!root || !root.classList || !root.style) return;

    // Org theme selector: target elements with data-org-theme attribute
    const orgThemeSelector = `[data-org-theme="${organizationId}"]`;
    const orgThemeElements = document.querySelectorAll(orgThemeSelector);

    // Apply CSS variables to all org-scoped elements and root (as default)
    const applyVarsTo = (element: Element | HTMLElement) => {
      const el = element as any;
      
      // Font Configuration
      if (config.fontFamily) {
        el.style?.setProperty('--font-family', config.fontFamily);
      }
      if (config.headingFont) {
        el.style?.setProperty('--heading-font', config.headingFont);
      }
      if (config.bodyFont) {
        el.style?.setProperty('--body-font', config.bodyFont);
      }
      if (config.fontSize) {
        el.style?.setProperty('--font-size-base', config.fontSize);
      }
      if (config.fontWeight) {
        el.style?.setProperty('--font-weight', config.fontWeight);
      }

      // Accent Color
      if (config.accentColor) {
        el.style?.setProperty('--theme-accent', config.accentColor);
      }
      
      // Light Mode Colors
      if (config.customLightBackground) {
        el.style?.setProperty('--theme-light-bg', config.customLightBackground);
      }
      if (config.customLightSurface) {
        el.style?.setProperty('--theme-light-surface', config.customLightSurface);
      }
      if (config.customLightText) {
        el.style?.setProperty('--theme-light-text', config.customLightText);
      }
      if (config.customLightPrimary) {
        el.style?.setProperty('--theme-light-primary', config.customLightPrimary);
      }
      if (config.customLightSecondary) {
        el.style?.setProperty('--theme-light-secondary', config.customLightSecondary);
      }
      if (config.customLightAccent) {
        el.style?.setProperty('--theme-light-accent', config.customLightAccent);
      }
      
      // Light Mode Typography
      if (config.h1ColorLight) {
        el.style?.setProperty('--theme-h1-light', config.h1ColorLight);
      }
      if (config.h2ColorLight) {
        el.style?.setProperty('--theme-h2-light', config.h2ColorLight);
      }
      if (config.h3ColorLight) {
        el.style?.setProperty('--theme-h3-light', config.h3ColorLight);
      }
      if (config.h4ColorLight) {
        el.style?.setProperty('--theme-h4-light', config.h4ColorLight);
      }
      if (config.h5ColorLight) {
        el.style?.setProperty('--theme-h5-light', config.h5ColorLight);
      }
      if (config.h6ColorLight) {
        el.style?.setProperty('--theme-h6-light', config.h6ColorLight);
      }
      if (config.bodyColorLight) {
        el.style?.setProperty('--theme-body-light', config.bodyColorLight);
      }
      if (config.mutedColorLight) {
        el.style?.setProperty('--theme-muted-light', config.mutedColorLight);
      }
      
      // Dark Mode Colors
      if (config.customDarkBackground) {
        el.style?.setProperty('--theme-dark-bg', config.customDarkBackground);
      }
      if (config.customDarkSurface) {
        el.style?.setProperty('--theme-dark-surface', config.customDarkSurface);
      }
      if (config.customDarkText) {
        el.style?.setProperty('--theme-dark-text', config.customDarkText);
      }
      if (config.customDarkPrimary) {
        el.style?.setProperty('--theme-dark-primary', config.customDarkPrimary);
      }
      if (config.customDarkSecondary) {
        el.style?.setProperty('--theme-dark-secondary', config.customDarkSecondary);
      }
      if (config.customDarkAccent) {
        el.style?.setProperty('--theme-dark-accent', config.customDarkAccent);
      }
      
      // Dark Mode Typography
      if (config.h1ColorDark) {
        el.style?.setProperty('--theme-h1-dark', config.h1ColorDark);
      }
      if (config.h2ColorDark) {
        el.style?.setProperty('--theme-h2-dark', config.h2ColorDark);
      }
      if (config.h3ColorDark) {
        el.style?.setProperty('--theme-h3-dark', config.h3ColorDark);
      }
      if (config.h4ColorDark) {
        el.style?.setProperty('--theme-h4-dark', config.h4ColorDark);
      }
      if (config.h5ColorDark) {
        el.style?.setProperty('--theme-h5-dark', config.h5ColorDark);
      }
      if (config.h6ColorDark) {
        el.style?.setProperty('--theme-h6-dark', config.h6ColorDark);
      }
      if (config.bodyColorDark) {
        el.style?.setProperty('--theme-body-dark', config.bodyColorDark);
      }
      if (config.mutedColorDark) {
        el.style?.setProperty('--theme-muted-dark', config.mutedColorDark);
      }
      
      // Card Background Styling
      if (config.cardBackgroundStyle) {
        el.style?.setProperty('--card-bg-style', config.cardBackgroundStyle);
      }
      if (config.customCardBackground) {
        el.style?.setProperty('--custom-card-bg', config.customCardBackground);
      }
      if (config.customCardForeground) {
        el.style?.setProperty('--custom-card-fg', config.customCardForeground);
      }

      // Sidebar color detection and setup
      if (config.customDarkBackground) {
        const hex = config.customDarkBackground.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (luminance < 0.5) {
            el.style?.setProperty('--sidebar-foreground', '#e2e8f0');
            el.style?.setProperty('--sidebar-accent-foreground', '#f1f5f9');
            el.style?.setProperty('--sidebar-border', `rgba(255,255,255,0.1)`);
          } else {
            el.style?.setProperty('--sidebar-foreground', '#1e293b');
            el.style?.setProperty('--sidebar-accent-foreground', '#0f172a');
            el.style?.setProperty('--sidebar-border', `rgba(0,0,0,0.1)`);
          }
        }
      }
    };

    // Apply to root element
    applyVarsTo(root);

    // Apply to all org-scoped elements
    orgThemeElements.forEach(element => {
      applyVarsTo(element);
    });
  };

  // Apply theme before paint so organization header toggles update immediately.
  useLayoutEffect(() => {
    applyThemeToDOM();
    applyGlobalThemeToDOM();
  }, [config, theme, organizationId, applyGlobalThemeToDOM]);

  return (
    <OrgThemeCustomizationContext.Provider
      value={{
        config,
        updateThemeConfig,
        applyThemeToDOM,
        isLoading: themeConfigQuery.isLoading,
      }}
    >
      {children}
    </OrgThemeCustomizationContext.Provider>
  );
}

export function useOrgThemeCustomization() {
  const context = useContext(OrgThemeCustomizationContext);
  if (context === undefined) {
    throw new Error('useOrgThemeCustomization must be used within OrgThemeCustomizationProvider');
  }
  return context;
}
