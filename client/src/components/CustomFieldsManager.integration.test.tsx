import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomFieldsManager } from './CustomFieldsManager';

// Mock all dependencies
vi.mock('@/types/customFields', () => ({
  CustomField: {},
  CustomFieldExtended: {},
  EntityType: {},
  ENTITY_TYPES: ['user', 'organization'],
  FIELD_TYPES: ['text', 'email', 'number'],
  FIELD_TYPE_LABELS: {
    text: 'Text',
    email: 'Email',
    number: 'Number'
  }
}));

vi.mock('@/services/customFieldsService', () => ({
  default: {
    getFields: vi.fn(),
    createField: vi.fn(),
    updateField: vi.fn(),
    deleteField: vi.fn(),
    deleteFields: vi.fn()
  }
}));

vi.mock('./CustomFieldRenderer', () => ({
  default: () => <div data-testid="custom-field-renderer">Field Renderer</div>
}));

vi.mock('./CustomFieldDialog', () => ({
  default: ({ isOpen, onClose, onSave, field }: any) => (
    isOpen ? (
      <div data-testid="custom-field-dialog">
        <h2>{field ? 'Edit' : 'Create'} Custom Field</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({
            name: 'test_field',
            label: 'Test Field',
            type: 'text',
            required: false,
            ...(field && { id: field.id })
          });
        }}>
          <button type="submit" data-testid="dialog-save">Save</button>
          <button type="button" onClick={onClose} data-testid="dialog-cancel">Cancel</button>
        </form>
      </div>
    ) : null
  )
}));

vi.mock('./iconSystem', () => ({
  IconButton: ({ icon, variant, tooltip, 'aria-label': ariaLabel, onClick, children }: any) => (
    <button
      data-testid={`icon-button-${icon}`}
      data-variant={variant}
      title={tooltip}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children || icon}
    </button>
  )
}));

vi.mock('./errorHandling', () => ({
  categorizeError: vi.fn(() => ({ category: 'NETWORK_ERROR', message: 'Network error' })),
  createErrorNotification: vi.fn(() => ({
    id: 'error1',
    category: 'NETWORK_ERROR',
    message: 'Network error',
    timestamp: new Date(),
    retryable: true
  })),
  ErrorNotification: {}
}));

vi.mock('./helpSystem', () => ({
  HelpPanel: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="help-panel">Help Panel</div> : null
  )
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

describe('CustomFieldsManager Integration Tests', () => {
  const mockFields = [
    {
      id: 'field1',
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      required: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'field2',
      name: 'email_field',
      label: 'Email Field',
      type: 'email',
      required: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  let mockService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockService = vi.mocked(await import('@/services/customFieldsService')).default;
    mockService.getFields.mockResolvedValue(mockFields);
    mockService.createField.mockResolvedValue({
      id: 'field3',
      name: 'new_field',
      label: 'New Field',
      type: 'text',
      required: false,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    });
    mockService.updateField.mockResolvedValue({
      ...mockFields[0],
      label: 'Updated Field'
    });
    mockService.deleteField.mockResolvedValue(undefined);
    mockService.deleteFields.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Full Component Rendering', () => {
    it('renders complete component with all integrated systems', async () => {
      render(<CustomFieldsManager />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Custom Fields Manager')).toBeInTheDocument();
      });

      // Check header with title and help button
      expect(screen.getByText('Custom Fields Manager')).toBeInTheDocument();
      expect(screen.getByTestId('icon-button-help')).toBeInTheDocument();

      // Check create button
      expect(screen.getByText('Create New Field')).toBeInTheDocument();

      // Check field count
      expect(screen.getByText('Fields (2)')).toBeInTheDocument();

      // Check table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Check field data
      expect(screen.getByText('test_field')).toBeInTheDocument();
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('email_field')).toBeInTheDocument();
      expect(screen.getByText('Email Field')).toBeInTheDocument();

      // Check action buttons (edit and delete for each field)
      const editButtons = screen.getAllByTestId('icon-button-edit');
      const deleteButtons = screen.getAllByTestId('icon-button-delete');
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);

      // Check multi-select checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // 1 select-all + 2 field checkboxes
    });
  });

  describe('API Integration', () => {
    it('loads fields from API on mount', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(mockService.getFields).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('test_field')).toBeInTheDocument();
      expect(screen.getByText('email_field')).toBeInTheDocument();
    });

    it('creates new field via API', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(screen.getByText('Create New Field')).toBeInTheDocument();
      });

      // Click create button
      fireEvent.click(screen.getByText('Create New Field'));

      // Dialog should open
      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();

      // Submit form
      fireEvent.click(screen.getByTestId('dialog-save'));

      // API should be called
      await waitFor(() => {
        expect(mockService.createField).toHaveBeenCalledWith({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          required: false
        });
      });

      // Fields should be refreshed
      expect(mockService.getFields).toHaveBeenCalledTimes(2);
    });

    it('updates field via API', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('icon-button-edit');
        fireEvent.click(editButtons[0]);
      });

      // Dialog should open in edit mode
      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Custom Field')).toBeInTheDocument();

      // Submit form
      fireEvent.click(screen.getByTestId('dialog-save'));

      // API should be called with field ID
      await waitFor(() => {
        expect(mockService.updateField).toHaveBeenCalledWith('field1', {
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          required: false,
          id: 'field1'
        });
      });
    });

    it('deletes field via API', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('icon-button-delete');
        fireEvent.click(deleteButtons[0]);
      });

      // Confirm deletion (assuming browser confirm)
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await waitFor(() => {
        expect(mockService.deleteField).toHaveBeenCalledWith('field1');
      });

      // Fields should be refreshed
      expect(mockService.getFields).toHaveBeenCalledTimes(2);
    });

    it('handles API errors gracefully', async () => {
      mockService.getFields.mockRejectedValue(new Error('API Error'));

      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Select Integration', () => {
    it('selects individual fields and shows batch actions', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
      });

      expect(screen.getByText('1 field(s) selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    });

    it('selects all fields with select-all checkbox', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all fields/i });
        fireEvent.click(selectAllCheckbox);
      });

      expect(screen.getByText('2 field(s) selected')).toBeInTheDocument();
    });

    it('performs batch delete operation', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
        fireEvent.click(checkboxes[2]); // Select second field
      });

      expect(screen.getByText('2 field(s) selected')).toBeInTheDocument();

      // Click batch delete
      fireEvent.click(screen.getByText('Delete Selected'));

      // Confirm deletion
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await waitFor(() => {
        expect(mockService.deleteFields).toHaveBeenCalledWith(['field1', 'field2']);
      });
    });

    it('clears selection', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
      });

      expect(screen.getByText('1 field(s) selected')).toBeInTheDocument();

      // Clear selection
      fireEvent.click(screen.getByText('Clear Selection'));

      expect(screen.queryByText('1 field(s) selected')).not.toBeInTheDocument();
    });
  });

  describe('Help System Integration', () => {
    it('opens help panel when help button clicked', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const helpButton = screen.getByTestId('icon-button-help');
        fireEvent.click(helpButton);
      });

      expect(screen.getByTestId('help-panel')).toBeInTheDocument();
    });

    it('toggles help with keyboard shortcut', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
      });

      // Simulate Shift+? keypress
      fireEvent.keyDown(document, { key: '?', shiftKey: true });

      expect(screen.getByTestId('help-panel')).toBeInTheDocument();

      // Toggle off
      fireEvent.keyDown(document, { key: '?', shiftKey: true });

      expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('shows error notification on API failure', async () => {
      mockService.getFields.mockRejectedValue(new Error('Network error'));

      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
      });

      // Should show retry suggestion
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it('dismisses error notification', async () => {
      mockService.getFields.mockRejectedValue(new Error('Network error'));

      render(<CustomFieldsManager />);

      await waitFor(() => {
        const closeButtons = screen.getAllByTestId('icon-button-x');
        fireEvent.click(closeButtons[0]);
      });

      expect(screen.queryByText(/failed to load custom fields/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation Integration', () => {
    it('validates form data before API call', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create New Field'));
      });

      // Dialog should open
      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();

      // Submit form
      fireEvent.click(screen.getByTestId('dialog-save'));

      // API should be called (validation passed in mock)
      await waitFor(() => {
        expect(mockService.createField).toHaveBeenCalled();
      });
    });
  });

  describe('State Management Integration', () => {
    it('updates UI after successful operations', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        expect(screen.getByText('Fields (2)')).toBeInTheDocument();
      });

      // Simulate successful creation
      mockService.getFields.mockResolvedValue([...mockFields, {
        id: 'field3',
        name: 'new_field',
        label: 'New Field',
        type: 'text',
        required: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }]);

      // Trigger a refresh (e.g., after creation)
      await waitFor(() => {
        expect(screen.getByText('Fields (3)')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('supports keyboard navigation', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const helpButton = screen.getByTestId('icon-button-help');
        helpButton.focus();
        expect(document.activeElement).toBe(helpButton);
      });
    });

    it('has proper ARIA labels', async () => {
      render(<CustomFieldsManager />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toHaveAttribute('aria-label', 'Select all fields');
      });
    });
  });
});