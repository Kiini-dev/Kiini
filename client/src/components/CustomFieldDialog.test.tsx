import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock all dependencies before importing the component
vi.mock('@/types/customFields', () => ({
  FIELD_TYPES: ['text', 'email', 'number', 'select', 'textarea'],
  FIELD_TYPE_LABELS: {
    text: 'Text',
    email: 'Email',
    number: 'Number',
    select: 'Select',
    textarea: 'Textarea'
  }
}));

vi.mock('@/services/customFieldsService', () => ({
  default: {
    createField: vi.fn(),
    updateField: vi.fn()
  }
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
  validateFieldName: vi.fn((name) => {
    if (!name || name.length === 0) return 'Field name is required';
    if (name.length > 64) return 'Field name must be 64 characters or less';
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return 'Field name must start with a letter and contain only letters, numbers, and underscores';
    return null;
  }),
  validateFieldLabel: vi.fn((label) => {
    if (!label || label.length === 0) return 'Field label is required';
    if (label.length > 255) return 'Field label must be 255 characters or less';
    return null;
  }),
  validateSelectOptions: vi.fn(() => null),
  categorizeError: vi.fn(),
  createErrorNotification: vi.fn()
}));

// Mock CSS
vi.mock('../styles/customFieldsManager.css', () => ({}));
vi.mock('./designTokens.css', () => ({}));
vi.mock('./enhancedStyles.css', () => ({}));

// Now import the component after all mocks are set up
import { CustomFieldDialog } from './CustomFieldDialog';

describe('CustomFieldDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    field: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CustomFieldDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Create Custom Field')).not.toBeInTheDocument();
    });

    it('renders edit mode when field is provided', () => {
      const editField = {
        id: 'field1',
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        required: true
      };

      render(<CustomFieldDialog {...defaultProps} field={editField} />);

      expect(screen.getByText('Edit Custom Field')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test_field')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Field')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all required form fields', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      expect(screen.getByLabelText(/field name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field label/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
    });

    it('populates field types dropdown', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const select = screen.getByLabelText(/field type/i);
      expect(select).toBeInTheDocument();

      // Should have options for each field type
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Number')).toBeInTheDocument();
    });
  });

  describe('Real-time Validation', () => {
    it('shows validation feedback for field name', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);

      // Type invalid name (starts with number)
      fireEvent.change(nameInput, { target: { value: '123invalid' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Field name must start with a letter and contain only letters, numbers, and underscores')).toBeInTheDocument();
      });
    });

    it('shows validation feedback for field label', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const labelInput = screen.getByLabelText(/field label/i);

      // Leave empty and blur
      fireEvent.change(labelInput, { target: { value: '' } });
      fireEvent.blur(labelInput);

      await waitFor(() => {
        expect(screen.getByText('Field label is required')).toBeInTheDocument();
      });
    });

    it('shows success icon for valid input', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);

      // Type valid name
      fireEvent.change(nameInput, { target: { value: 'valid_name' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        const successIcon = screen.getByTestId('icon-button-checkmark');
        expect(successIcon).toBeInTheDocument();
      });
    });

    it('shows error icon for invalid input', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);

      // Type invalid name
      fireEvent.change(nameInput, { target: { value: 'invalid-name' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        const errorIcon = screen.getByTestId('icon-button-x');
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it('only validates after field has been touched', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);

      // Type invalid name but don't blur
      fireEvent.change(nameInput, { target: { value: '123invalid' } });

      // Should not show validation error yet
      expect(screen.queryByText('Field name must start with a letter')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSave with valid form data', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);
      const labelInput = screen.getByLabelText(/field label/i);
      const typeSelect = screen.getByLabelText(/field type/i);
      const requiredCheckbox = screen.getByLabelText(/required/i);
      const saveButton = screen.getByText('Save');

      // Fill form with valid data
      fireEvent.change(nameInput, { target: { value: 'test_field' } });
      fireEvent.change(labelInput, { target: { value: 'Test Field' } });
      fireEvent.change(typeSelect, { target: { value: 'text' } });
      fireEvent.click(requiredCheckbox);

      // Blur fields to mark as touched
      fireEvent.blur(nameInput);
      fireEvent.blur(labelInput);

      // Submit form
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          required: true
        });
      });
    });

    it('prevents submission with invalid data', async () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const saveButton = screen.getByText('Save');

      // Try to submit empty form
      fireEvent.click(saveButton);

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('supports keyboard navigation', () => {
      render(<CustomFieldDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/field name/i);
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
    });
  });
});