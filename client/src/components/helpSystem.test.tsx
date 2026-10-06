import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelpPanel, Tooltip, HelpIcon, HELP_LIBRARY } from './helpSystem';

describe('Help System', () => {
  describe('HelpPanel Component', () => {
    it('renders closed panel correctly', () => {
      render(<HelpPanel isOpen={false} onClose={() => {}} />);
      const dialog = screen.getByRole('dialog', { name: /help and documentation/i });
      expect(dialog).toHaveClass('help-panel');
      expect(dialog).not.toHaveClass('open');
    });

    it('renders open panel with correct structure', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const dialog = screen.getByRole('dialog', { name: /help and documentation/i });
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    });

    it('shows all help topics initially', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const topics = Object.values(HELP_LIBRARY);
      topics.forEach(topic => {
        expect(screen.getByText(topic.title)).toBeInTheDocument();
        expect(screen.getByText(topic.shortDescription)).toBeInTheDocument();
      });
    });

    it('filters topics based on search query', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const searchInput = screen.getByPlaceholderText('Search help topics...');

      fireEvent.change(searchInput, { target: { value: 'getting started' } });

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.queryByText('Field Types Reference')).not.toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const searchInput = screen.getByPlaceholderText('Search help topics...');

      fireEvent.change(searchInput, { target: { value: 'nonexistent topic' } });

      expect(screen.getByText('No topics found for "nonexistent topic"')).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const searchInput = screen.getByPlaceholderText('Search help topics...');

      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput).toHaveValue('test');

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('opens topic when topic card is clicked', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const gettingStartedCard = screen.getByText('Getting Started').closest('button');

      fireEvent.click(gettingStartedCard!);

      expect(screen.getByText('What are Custom Fields?')).toBeInTheDocument();
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('returns to topic list when back button is clicked', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const gettingStartedCard = screen.getByText('Getting Started').closest('button');
      fireEvent.click(gettingStartedCard!);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.queryByText('What are Custom Fields?')).not.toBeInTheDocument();
    });

    it('shows related topics for current topic', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const gettingStartedCard = screen.getByText('Getting Started').closest('button');
      fireEvent.click(gettingStartedCard!);

      expect(screen.getByText('Related Topics')).toBeInTheDocument();
      expect(screen.getByText('Field Types Reference')).toBeInTheDocument();
    });

    it('navigates to related topic when clicked', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const gettingStartedCard = screen.getByText('Getting Started').closest('button');
      fireEvent.click(gettingStartedCard!);

      const fieldTypesLink = screen.getByText('Field Types Reference');
      fireEvent.click(fieldTypesLink);

      expect(screen.getByText('Available Field Types')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close help panel');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked', () => {
      const mockOnClose = vi.fn();
      render(<HelpPanel isOpen={true} onClose={mockOnClose} />);

      const overlay = document.querySelector('.help-panel-overlay');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows keyboard shortcut hint in footer', () => {
      render(<HelpPanel isOpen={true} onClose={() => {}} />);
      const footer = document.querySelector('.help-panel-footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.textContent?.trim()).toBe('Press Shift + ? to toggle help');
    });
  });

  describe('Tooltip Component', () => {
    it('renders children correctly', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('shows tooltip on mouse enter after delay', async () => {
      render(
        <Tooltip content="Help text" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Help text')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Help text" delay={50}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('applies correct position class', async () => {
      render(
        <Tooltip content="Help text" position="bottom" delay={50}>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('tooltip-bottom');
      });
    });

    it('cleans up timeout on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Should not throw any errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('HelpIcon Component', () => {
    it('renders help icon button', () => {
      render(<HelpIcon />);
      const button = screen.getByRole('button', { name: /help/i });
      expect(button).toBeInTheDocument();
    });

    it('shows default tooltip content', async () => {
      render(<HelpIcon />);
      const button = screen.getByRole('button', { name: /help/i });

      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Click for more information')).toBeInTheDocument();
      });
    });

    it('shows custom tooltip content', async () => {
      render(<HelpIcon content="Custom help text" />);
      const button = screen.getByRole('button', { name: /help/i });

      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Custom help text')).toBeInTheDocument();
      });
    });

    it('calls onHelpClick when provided', () => {
      const mockOnClick = vi.fn();
      render(<HelpIcon onHelpClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('has proper accessibility attributes', () => {
      render(<HelpIcon />);
      const button = screen.getByRole('button', { name: /help/i });
      expect(button).toHaveAttribute('aria-label', 'Help');
      expect(button).toHaveAttribute('title', 'Click for help');
    });
  });

  describe('HELP_LIBRARY', () => {
    it('contains all expected topics', () => {
      const expectedTopics = ['getting-started', 'field-types', 'validation', 'management', 'troubleshooting'];
      expectedTopics.forEach(topicId => {
        expect(HELP_LIBRARY[topicId]).toBeDefined();
        expect(HELP_LIBRARY[topicId].id).toBe(topicId);
      });
    });

    it('has valid topic structure', () => {
      Object.values(HELP_LIBRARY).forEach(topic => {
        expect(topic).toHaveProperty('id');
        expect(topic).toHaveProperty('title');
        expect(topic).toHaveProperty('shortDescription');
        expect(topic).toHaveProperty('category');
        expect(topic).toHaveProperty('fullContent');
        expect(['getting-started', 'field-types', 'validation', 'management', 'troubleshooting']).toContain(topic.category);
      });
    });

    it('has related topics that exist', () => {
      Object.values(HELP_LIBRARY).forEach(topic => {
        if (topic.relatedTopics) {
          topic.relatedTopics.forEach(relatedId => {
            expect(HELP_LIBRARY[relatedId]).toBeDefined();
          });
        }
      });
    });
  });
});