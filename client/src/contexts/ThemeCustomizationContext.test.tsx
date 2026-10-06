import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ThemeCustomizationProvider, useThemeCustomization } from './ThemeCustomizationContext';
import { OrgThemeCustomizationProvider, useOrgThemeCustomization } from './OrgThemeCustomizationContext';

const mockUseQuery = vi.fn();
const mockOrgUseQuery = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    themeCustomization: {
      getConfig: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
    orgThemeCustomization: {
      getConfig: {
        useQuery: (...args: any[]) => mockOrgUseQuery(...args),
      },
    },
  },
}));

function ThemeConsumer() {
  const { config } = useThemeCustomization();
  return <div data-testid="theme-config">{JSON.stringify(config)}</div>;
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button data-testid="theme-toggle" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

function ThemePaletteConflictControls() {
  const { updateThemeConfig } = useThemeCustomization();
  const { updateThemeConfig: updateOrgThemeConfig } = useOrgThemeCustomization();
  const { toggleTheme } = useTheme();

  return (
    <>
      <button data-testid="set-conflicting-colors" onClick={() => {
        updateThemeConfig({ customLightBackground: '#123456', customDarkBackground: '#234567' });
        updateOrgThemeConfig({ customLightBackground: '#abcdef', customDarkBackground: '#fedcba' });
      }} />
      <button data-testid="theme-toggle" onClick={toggleTheme} />
    </>
  );
}

describe('ThemeCustomizationProvider', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    localStorage.clear();
    mockUseQuery.mockReset();
    mockOrgUseQuery.mockReset();
    mockUseQuery.mockReturnValue({ data: undefined });
    mockOrgUseQuery.mockReturnValue({ data: undefined });
  });

  it('renders without crashing when the DOM head is unavailable', () => {
    const originalHead = document.head;
    Object.defineProperty(document, 'head', {
      configurable: true,
      value: undefined,
    });

    expect(() => {
      render(
        <ThemeCustomizationProvider>
          <ThemeConsumer />
        </ThemeCustomizationProvider>
      );
    }).not.toThrow();

    Object.defineProperty(document, 'head', {
      configurable: true,
      value: originalHead,
    });
  });

  it('keeps the current dark theme active when a light colorMode is returned from config', async () => {
    mockUseQuery.mockReturnValue({ data: { colorMode: 'light' } });

    const { getByTestId } = render(
      <ThemeProvider defaultTheme="dark">
        <ThemeCustomizationProvider>
          <ThemeToggleButton />
        </ThemeCustomizationProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    fireEvent.click(getByTestId('theme-toggle'));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('shares the global color palette with tenant dashboards in both modes', async () => {
    const { getByTestId } = render(
      <ThemeProvider defaultTheme="light">
        <ThemeCustomizationProvider>
          <OrgThemeCustomizationProvider organizationId="org-1">
            <ThemePaletteConflictControls />
          </OrgThemeCustomizationProvider>
        </ThemeCustomizationProvider>
      </ThemeProvider>
    );

    fireEvent.click(getByTestId('set-conflicting-colors'));

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--theme-light-bg')).toBe('#123456');
      expect(document.documentElement.style.getPropertyValue('--background')).toBe('#123456');
    });

    fireEvent.click(getByTestId('theme-toggle'));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.getPropertyValue('--theme-dark-bg')).toBe('#234567');
      expect(document.documentElement.style.getPropertyValue('--background')).toBe('#234567');
    });
  });
});
