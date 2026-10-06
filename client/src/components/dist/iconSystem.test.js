"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var iconSystem_1 = require("./iconSystem");
var iconSystem_2 = require("./iconSystem");
vitest_1.describe('Icon System', function () {
    vitest_1.describe('SVGIcon Component', function () {
        vitest_1.it('renders an icon with default props', function () {
            react_1.render(React.createElement(iconSystem_2["default"], { name: "check" }));
            var svg = document.querySelector('svg');
            vitest_1.expect(svg).toBeInTheDocument();
            vitest_1.expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        });
        vitest_1.it('renders with custom size', function () {
            react_1.render(React.createElement(iconSystem_2["default"], { name: "check", size: 32 }));
            var svg = document.querySelector('svg');
            vitest_1.expect(svg).toHaveAttribute('width', '32px');
            vitest_1.expect(svg).toHaveAttribute('height', '32px');
        });
        vitest_1.it('renders with custom color', function () {
            react_1.render(React.createElement(iconSystem_2["default"], { name: "check", color: "red" }));
            var innerSvg = document.querySelector('svg svg');
            vitest_1.expect(innerSvg).toHaveAttribute('stroke', 'red');
        });
        vitest_1.it('renders with aria-label for accessibility', function () {
            react_1.render(React.createElement(iconSystem_2["default"], { name: "check", "aria-label": "Check mark" }));
            var wrapper = react_1.screen.getByLabelText('Check mark');
            vitest_1.expect(wrapper).toBeInTheDocument();
        });
        vitest_1.it('applies custom className', function () {
            react_1.render(React.createElement(iconSystem_2["default"], { name: "check", className: "custom-icon" }));
            var wrapper = document.querySelector('.icon-wrapper');
            vitest_1.expect(wrapper).toHaveClass('custom-icon');
        });
        vitest_1.it('returns null for invalid icon name', function () {
            var container = react_1.render(React.createElement(iconSystem_2["default"], { name: "invalid", as: true, any: true })).container;
            vitest_1.expect(container.firstChild).toBeNull();
        });
        vitest_1.it('renders all supported icons', function () {
            var iconNames = [
                'check', 'x', 'edit', 'delete', 'plus', 'search', 'chevron-down', 'chevron-up',
                'alert', 'info', 'help', 'loading', 'checkmark', 'close', 'settings', 'copy',
                'download', 'upload', 'trash', 'eye', 'eye-off'
            ];
            iconNames.forEach(function (iconName) {
                var container = react_1.render(React.createElement(iconSystem_2["default"], { name: iconName })).container;
                vitest_1.expect(container.firstChild).not.toBeNull();
            });
        });
    });
    vitest_1.describe('IconButton Component', function () {
        vitest_1.it('renders with icon and button behavior', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "edit", "aria-label": "Edit" }));
            var button = react_1.screen.getByRole('button', { name: /edit/i });
            vitest_1.expect(button).toBeInTheDocument();
        });
        vitest_1.it('applies variant classes', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "check", variant: "primary", "aria-label": "Check" }));
            var button = react_1.screen.getByRole('button');
            vitest_1.expect(button).toHaveClass('icon-button-primary');
        });
        vitest_1.it('shows tooltip on hover', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "help", tooltip: "Get help", "aria-label": "Help" }));
            var button = react_1.screen.getByRole('button');
            vitest_1.expect(button).toHaveAttribute('title', 'Get help');
        });
        vitest_1.it('disables button when loading', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "check", loading: true, "aria-label": "Loading" }));
            var button = react_1.screen.getByRole('button');
            vitest_1.expect(button).toBeDisabled();
        });
        vitest_1.it('shows loading icon when loading', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "check", loading: true, "aria-label": "Loading" }));
            // The loading icon should be rendered instead of the check icon
            var svg = document.querySelector('svg');
            vitest_1.expect(svg).toBeInTheDocument();
        });
        vitest_1.it('forwards button props', function () {
            var handleClick = vi.fn();
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "plus", onClick: handleClick, "aria-label": "Add" }));
            var button = react_1.screen.getByRole('button');
            button.click();
            vitest_1.expect(handleClick).toHaveBeenCalled();
        });
        vitest_1.it('applies custom className', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "settings", className: "custom-button", "aria-label": "Settings" }));
            var button = react_1.screen.getByRole('button');
            vitest_1.expect(button).toHaveClass('custom-button');
        });
        vitest_1.it('supports different icon sizes', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "search", iconSize: 24, "aria-label": "Search" }));
            var svg = document.querySelector('svg');
            vitest_1.expect(svg).toHaveAttribute('width', '24px');
            vitest_1.expect(svg).toHaveAttribute('height', '24px');
        });
        vitest_1.it('has proper accessibility attributes', function () {
            react_1.render(React.createElement(iconSystem_1.IconButton, { icon: "delete", "aria-label": "Delete item" }));
            var button = react_1.screen.getByRole('button', { name: /delete item/i });
            vitest_1.expect(button).toHaveAttribute('aria-label', 'Delete item');
        });
    });
});
