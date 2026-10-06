import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock all dependencies first
vi.mock('@/types/customFields', () => ({
  ENTITY_TYPES: ['user'],
  FIELD_TYPES: ['text'],
  FIELD_TYPE_LABELS: { text: 'Text' }
}));

vi.mock('@/services/customFieldsService', () => ({
  default: {
    getFields: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('./CustomFieldRenderer', () => ({
  default: () => <div>Field Renderer</div>
}));

vi.mock('./CustomFieldDialog', () => ({
  default: () => null
}));

vi.mock('./iconSystem', () => ({
  IconButton: ({ children }: any) => <button>{children || 'Icon'}</button>
}));

vi.mock('./errorHandling', () => ({
  categorizeError: vi.fn(),
  createErrorNotification: vi.fn()
}));

vi.mock('./helpSystem', () => ({
  HelpPanel: () => <div>Help Panel</div>
}));

// Mock CSS
vi.mock('../styles/customFieldsManager.css', () => ({}));
vi.mock('./designTokens.css', () => ({}));
vi.mock('./enhancedStyles.css', () => ({}));

// Mock browser APIs
global.ResizeObserver = vi.fn(() => ({ observe: vi.fn(), disconnect: vi.fn() })) as any;
  global.IntersectionObserver = vi.fn(() => ({ observe: vi.fn(), disconnect: vi.fn() })) as any;
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }))
});

// Now import the component
import { CustomFieldsManager } from './CustomFieldsManager';

describe('CustomFieldsManager Integration', () => {
  it('renders without crashing', async () => {
    render(<CustomFieldsManager />);

    await waitFor(() => {
      expect(screen.getByText('Custom Fields Manager')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<CustomFieldsManager />);
    expect(screen.getByText('Loading fields...')).toBeInTheDocument();
  });

  it('integrates icon system', async () => {
    render(<CustomFieldsManager />);

    await waitFor(() => {
      // Should have some icon buttons rendered
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('integrates help system', async () => {
    render(<CustomFieldsManager />);

    await waitFor(() => {
      expect(screen.getByText('Custom Fields Manager')).toBeInTheDocument();
    });

    // Help system should be integrated (buttons should exist)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });
});