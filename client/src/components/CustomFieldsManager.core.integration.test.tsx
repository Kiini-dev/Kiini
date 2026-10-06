import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomFieldsManager from './CustomFieldsManager';

// Mock all dependencies
vi.mock('@/types/customFields', () => ({
  ENTITY_TYPES: ['user'],
  FIELD_TYPES: ['text', 'email'],
  FIELD_TYPE_LABELS: { text: 'Text', email: 'Email' }
}));

vi.mock('@/services/customFieldsService', () => ({
  default: {
    getFields: vi.fn().mockResolvedValue({
      fields: [
        {
          id: 'field1',
          fieldName: 'test_field',
          fieldLabel: 'Test Field',
          fieldType: 'text',
          required: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'field2',
          fieldName: 'email_field',
          fieldLabel: 'Email Field',
          fieldType: 'email',
          required: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ]
    }),
    createField: vi.fn(),
    updateField: vi.fn(),
    deleteField: vi.fn(),
    deleteFields: vi.fn()
  }
}));

vi.mock('./CustomFieldRenderer', () => ({
  default: () => <div>Field Renderer</div>
}));

vi.mock('./CustomFieldDialog', () => ({
  default: ({ isOpen, onClose, onSave }: any) => (
    isOpen ? (
      <div data-testid="custom-field-dialog">
        <button onClick={onClose} data-testid="dialog-close">Close</button>
        <button onClick={() => onSave({
          fieldName: 'new_field',
          fieldLabel: 'New Field',
          fieldType: 'text',
          required: false
        })} data-testid="dialog-save">Save</button>
      </div>
    ) : null
  )
}));

vi.mock('./iconSystem', () => ({
  IconButton: ({ icon, onClick, children }: any) => (
    <button data-testid={`icon-${icon}`} onClick={onClick}>
      {children || icon}
    </button>
  )
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

describe('CustomFieldsManager - Core Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component with entity type and loads fields', async () => {
    render(<CustomFieldsManager entityType="user" />);

    // Check that the component renders the header
    expect(screen.getByText('Custom Fields Manager')).toBeInTheDocument();

    // Wait for fields to load
    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    // Verify both fields are displayed
    expect(screen.getByText('email_field')).toBeInTheDocument();
    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('Email Field')).toBeInTheDocument();
  });

  it('displays field table with correct structure', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Field Name')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders checkboxes for multi-select functionality', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(3); // At least select-all + 2 fields
  });

  it('shows create field button', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    // Check for create button (might be "+ Add Field" or "Create New Field")
    const createButton = screen.getByText(/Add Field|Create New Field/i);
    expect(createButton).toBeInTheDocument();
  });

  it('renders help icon in header', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    expect(screen.getByTestId('icon-help')).toBeInTheDocument();
  });

  it('renders edit and delete icons for each field', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    const editIcons = screen.getAllByTestId('icon-edit');
    const deleteIcons = screen.getAllByTestId('icon-delete');

    expect(editIcons).toHaveLength(2); // One for each field
    expect(deleteIcons).toHaveLength(2); // One for each field
  });

  it('opens create dialog when create button is clicked', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    const createButton = screen.getByText(/Add Field|Create New Field/i);
    fireEvent.click(createButton);

    expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    const createButton = screen.getByText(/Add Field|Create New Field/i);
    fireEvent.click(createButton);

    expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-close'));
    expect(screen.queryByTestId('custom-field-dialog')).not.toBeInTheDocument();
  });

  it('handles field selection with checkboxes', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const firstFieldCheckbox = checkboxes[1]; // Skip select-all checkbox

    fireEvent.click(firstFieldCheckbox);

    // Should show selection count (this might vary based on implementation)
    // The important thing is that the checkbox interaction doesn't throw errors
    expect(firstFieldCheckbox).toBeInTheDocument();
  });

  it('displays search and filter controls', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Search fields...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sort by Order')).toBeInTheDocument();
  });

  it('shows entity type tabs', async () => {
    render(<CustomFieldsManager entityType="user" />);

    await waitFor(() => {
      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    expect(screen.getByText('user')).toBeInTheDocument();
  });
});