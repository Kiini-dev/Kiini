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
          name: 'new_field',
          label: 'New Field',
          type: 'text',
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

describe('CustomFieldsManager - Form Validation & Multi-Select Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-Select Functionality', () => {
    it('renders select all checkbox and individual field checkboxes', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        expect(screen.getByText('test_field')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // 1 select-all + 2 field checkboxes
    });

    it('selects individual fields when checkbox is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
      });

      expect(screen.getByText('1 field(s) selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    });

    it('selects all fields when select all is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all fields/i });
        fireEvent.click(selectAllCheckbox);
      });

      expect(screen.getByText('2 field(s) selected')).toBeInTheDocument();
    });

    it('clears selection when clear button is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
      });

      expect(screen.getByText('1 field(s) selected')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Clear Selection'));
      expect(screen.queryByText('1 field(s) selected')).not.toBeInTheDocument();
    });

    it('highlights selected rows', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select first field
      });

      // Check that the row is highlighted (this would be verified by CSS classes in real implementation)
      const selectedRow = screen.getByText('test_field').closest('tr');
      expect(selectedRow).toHaveClass('selected');
    });

    it('handles partial selection state in select all checkbox', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Select only first field
      });

      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all fields/i }) as HTMLInputElement;
      expect(selectAllCheckbox.indeterminate).toBe(true);
    });
  });

  describe('Form Validation Integration', () => {
    it('opens create dialog when create button is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create New Field'));
      });

      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
    });

    it('opens edit dialog when edit button is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('icon-edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
    });

    it('closes dialog when cancel is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create New Field'));
      });

      expect(screen.getByTestId('custom-field-dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('dialog-close'));
      expect(screen.queryByTestId('custom-field-dialog')).not.toBeInTheDocument();
    });

    it('calls onSave when form is submitted', async () => {
      const mockService = vi.mocked(await import('@/services/customFieldsService')).default;

      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create New Field'));
      });

      fireEvent.click(screen.getByTestId('dialog-save'));

      await waitFor(() => {
        expect(mockService.createField).toHaveBeenCalledWith({
          name: 'new_field',
          label: 'New Field',
          type: 'text',
          required: false
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('displays error notifications on API failure', async () => {
      const mockService = vi.mocked(await import('@/services/customFieldsService')).default as any;
      mockService.getFields.mockRejectedValueOnce(new Error('API Error'));

      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
      });
    });

    it('shows retry suggestions for network errors', async () => {
      const mockService = vi.mocked(await import('@/services/customFieldsService')).default as any;
      mockService.getFields.mockRejectedValueOnce(new Error('Network Error'));

      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Help System Integration', () => {
    it('opens help panel when help button is clicked', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('icon-help'));
      });

      // Help panel should be rendered (mocked)
      expect(screen.getByText('Help Panel')).toBeInTheDocument();
    });
  });

  describe('Icon System Integration', () => {
    it('renders edit icons for each field', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const editIcons = screen.getAllByTestId('icon-edit');
        expect(editIcons).toHaveLength(2);
      });
    });

    it('renders delete icons for each field', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const deleteIcons = screen.getAllByTestId('icon-delete');
        expect(deleteIcons).toHaveLength(2);
      });
    });

    it('renders help icon in header', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-help')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('has proper ARIA labels on checkboxes', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all fields/i });
        expect(selectAllCheckbox).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation for checkboxes', async () => {
      render(<CustomFieldsManager entityType="user" />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes[0].focus();
        expect(document.activeElement).toBe(checkboxes[0]);
      });
    });
  });
});