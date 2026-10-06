import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconButton } from './iconSystem';
import SVGIcon from './iconSystem';

describe('Icon System', () => {
  describe('SVGIcon Component', () => {
    it('renders an icon with default props', () => {
      render(<SVGIcon name="check" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('renders with custom size', () => {
      render(<SVGIcon name="check" size={32} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32px');
      expect(svg).toHaveAttribute('height', '32px');
    });

    it('renders with custom color', () => {
      render(<SVGIcon name="check" color="red" />);
      const innerSvg = document.querySelector('svg svg');
      expect(innerSvg).toHaveAttribute('stroke', 'red');
    });

    it('renders with aria-label for accessibility', () => {
      render(<SVGIcon name="check" aria-label="Check mark" />);
      const wrapper = screen.getByLabelText('Check mark');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SVGIcon name="check" className="custom-icon" />);
      const wrapper = document.querySelector('.icon-wrapper');
      expect(wrapper).toHaveClass('custom-icon');
    });

    it('returns null for invalid icon name', () => {
      const { container } = render(<SVGIcon name="invalid" as any />);
      expect(container.firstChild).toBeNull();
    });

    it('renders all supported icons', () => {
      const iconNames: Array<'check' | 'x' | 'edit' | 'delete' | 'plus' | 'search' | 'chevron-down' | 'chevron-up' | 'alert' | 'info' | 'help' | 'loading' | 'checkmark' | 'close' | 'settings' | 'copy' | 'download' | 'upload' | 'trash' | 'eye' | 'eye-off'> = [
        'check', 'x', 'edit', 'delete', 'plus', 'search', 'chevron-down', 'chevron-up',
        'alert', 'info', 'help', 'loading', 'checkmark', 'close', 'settings', 'copy',
        'download', 'upload', 'trash', 'eye', 'eye-off'
      ];

      iconNames.forEach(iconName => {
        const { container } = render(<SVGIcon name={iconName} />);
        expect(container.firstChild).not.toBeNull();
      });
    });
  });

  describe('IconButton Component', () => {
    it('renders with icon and button behavior', () => {
      render(<IconButton icon="edit" aria-label="Edit" />);
      const button = screen.getByRole('button', { name: /edit/i });
      expect(button).toBeInTheDocument();
    });

    it('applies variant classes', () => {
      render(<IconButton icon="check" variant="primary" aria-label="Check" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('icon-button-primary');
    });

    it('shows tooltip on hover', () => {
      render(<IconButton icon="help" tooltip="Get help" aria-label="Help" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Get help');
    });

    it('disables button when loading', () => {
      render(<IconButton icon="check" loading aria-label="Loading" />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows loading icon when loading', () => {
      render(<IconButton icon="check" loading aria-label="Loading" />);
      // The loading icon should be rendered instead of the check icon
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('forwards button props', () => {
      const handleClick = vi.fn();
      render(<IconButton icon="plus" onClick={handleClick} aria-label="Add" />);
      const button = screen.getByRole('button');
      button.click();
      expect(handleClick).toHaveBeenCalled();
    });

    it('applies custom className', () => {
      render(<IconButton icon="settings" className="custom-button" aria-label="Settings" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });

    it('supports different icon sizes', () => {
      render(<IconButton icon="search" iconSize={24} aria-label="Search" />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24px');
      expect(svg).toHaveAttribute('height', '24px');
    });

    it('has proper accessibility attributes', () => {
      render(<IconButton icon="delete" aria-label="Delete item" />);
      const button = screen.getByRole('button', { name: /delete item/i });
      expect(button).toHaveAttribute('aria-label', 'Delete item');
    });
  });
});