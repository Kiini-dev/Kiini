"use strict";
/**
 * Responsive Layout Utilities
 * Mobile-first Tailwind CSS patterns for common responsive scenarios
 */
exports.__esModule = true;
exports.responsiveForm = exports.responsiveDialog = exports.cn = exports.responsiveSpacing = exports.responsiveText = exports.responsiveTable = exports.responsiveButtonGroup = exports.responsiveFlex = exports.responsiveTabs = exports.responsiveGrid = exports.responsiveContainer = void 0;
/**
 * Responsive container classes for different screen sizes
 * Use for main content areas that need to adapt to viewport
 */
exports.responsiveContainer = {
    // Full width with padding that adapts
    full: "w-full px-3 sm:px-4 md:px-6 lg:px-8",
    // Maximum width container (like Bootstrap container)
    max: "w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6",
    // Narrow container for forms/dialogs
    narrow: "w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6",
    // Wide container for data tables
    wide: "w-full max-w-full lg:max-w-7xl mx-auto"
};
/**
 * Grid layouts that adapt from mobile to desktop
 */
exports.responsiveGrid = {
    // Single column on mobile, 2 on tablet, 3+ on desktop
    auto: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6",
    // Single column on mobile, 2 on tablet/desktop
    pair: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
    // Single column on mobile, 3 on tablet, 4 on desktop
    wide: "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4",
    // 2 columns on mobile, 3 on tablet, 4+ on desktop
    compact: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
};
/**
 * Responsive tabs styling - prevents overflow on mobile
 */
exports.responsiveTabs = {
    // Container that allows horizontal scroll on mobile
    container: "w-full overflow-x-auto sm:overflow-x-visible",
    // Tab list with responsive sizing
    list: "inline-flex sm:flex w-full flex-nowrap sm:flex-wrap gap-1 sm:gap-2 min-w-full sm:min-w-0",
    // Individual tab with responsive text size
    trigger: "text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap",
    // Tab content that adapts padding
    content: "p-2 sm:p-3 md:p-4 lg:p-6"
};
/**
 * Responsive flex layouts
 */
exports.responsiveFlex = {
    // Stack on mobile, row on tablet+
    stack: "flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4",
    // Stack on mobile, centered row on desktop
    stackCenter: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4",
    // Wrap items with responsive gap
    wrap: "flex flex-wrap gap-2 sm:gap-3",
    // Space between items
    between: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 md:gap-4"
};
/**
 * Responsive button groups
 */
exports.responsiveButtonGroup = {
    // Stack on mobile, horizontal on desktop
    base: "flex flex-col sm:flex-row gap-2 sm:gap-1",
    // Horizontal scrolling on mobile
    horizontal: "flex gap-1 sm:gap-2 overflow-x-auto",
    // Full width on mobile, auto on desktop
    fullMobile: "flex flex-col sm:flex-row gap-2 sm:gap-1 w-full sm:w-auto",
    // Button within group with responsive width
    button: "flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2"
};
/**
 * Responsive table layout
 */
exports.responsiveTable = {
    // Container that scrolls on mobile
    container: "w-full overflow-x-auto",
    // Table with responsive text sizes
    table: "w-full text-xs sm:text-sm md:text-base",
    // Cell with responsive padding
    cell: "px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left",
    // Header cell
    headerCell: "px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-semibold text-left text-xs sm:text-sm"
};
/**
 * Responsive typography
 */
exports.responsiveText = {
    // Large heading that adapts
    h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
    // Medium heading
    h2: "text-xl sm:text-2xl md:text-3xl font-bold",
    // Small heading
    h3: "text-lg sm:text-xl md:text-2xl font-semibold",
    // Body text with responsive size
    body: "text-sm sm:text-base leading-relaxed",
    // Small text
    small: "text-xs sm:text-sm text-muted-foreground"
};
/**
 * Responsive spacing utilities
 */
exports.responsiveSpacing = {
    // Padding that adapts by screen size
    p: "p-2 sm:p-3 md:p-4 lg:p-6",
    py: "py-2 sm:py-3 md:py-4 lg:py-6",
    px: "px-2 sm:px-3 md:px-4 lg:px-6",
    // Margin that adapts
    m: "m-2 sm:m-3 md:m-4 lg:m-6",
    my: "my-2 sm:my-3 md:my-4 lg:my-6",
    mx: "mx-2 sm:mx-3 md:mx-4 lg:mx-6",
    // Gap that adapts
    gap: "gap-2 sm:gap-3 md:gap-4 lg:gap-6"
};
/**
 * Helper function to combine responsive classes
 */
function cn() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(Boolean).join(" ");
}
exports.cn = cn;
/**
 * Responsive dialog sizing
 */
exports.responsiveDialog = {
    // Full width on mobile, constrained on desktop
    maxWidth: "w-full sm:max-w-md md:max-w-lg lg:max-w-2xl",
    // Full height on mobile, constrained on desktop
    maxHeight: "max-h-[90vh] sm:max-h-[85vh]",
    // Padding that adapts
    padding: "p-3 sm:p-4 md:p-6",
    // Combined max width and height for modals
    modal: "w-full sm:max-w-md md:max-w-lg max-h-[90vh] sm:max-h-[85vh]"
};
/**
 * Responsive form layout
 */
exports.responsiveForm = {
    // Form field container
    field: "grid gap-1.5 sm:gap-2",
    // Form row with multiple fields
    row: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4",
    // Input with responsive padding
    input: "px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base w-full",
    // Label with responsive size
    label: "text-xs sm:text-sm font-medium"
};
