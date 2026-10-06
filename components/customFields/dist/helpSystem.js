"use strict";
/**
 * Contextual Help System for Custom Fields
 * Provides in-app help, tooltips, and guidance
 */
exports.__esModule = true;
exports.HelpIcon = exports.Tooltip = exports.HelpPanel = exports.HELP_LIBRARY = void 0;
var react_1 = require("react");
// Help content library
exports.HELP_LIBRARY = {
    'getting-started': {
        id: 'getting-started',
        title: 'Getting Started',
        shortDescription: 'Learn the basics of custom fields',
        category: 'getting-started',
        fullContent: (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "What are Custom Fields?"),
            react_1["default"].createElement("p", null, "Custom fields allow you to extend your CRM entities (Contacts, Companies, Leads, etc.) with additional data fields tailored to your business needs."),
            react_1["default"].createElement("h4", null, "Quick Start Steps:"),
            react_1["default"].createElement("ol", null,
                react_1["default"].createElement("li", null, "Select entity type (Contact, Company, Lead, etc.)"),
                react_1["default"].createElement("li", null, "Click \"Add Custom Field\" button"),
                react_1["default"].createElement("li", null, "Choose field type (Text, Number, Date, etc.)"),
                react_1["default"].createElement("li", null, "Configure field settings and validation"),
                react_1["default"].createElement("li", null, "Save and use in forms")),
            react_1["default"].createElement("h4", null, "Tips:"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Use descriptive field names (e.g., \"marketing_segment\" not \"ms\")"),
                react_1["default"].createElement("li", null, "Add helpful descriptions for field labels"),
                react_1["default"].createElement("li", null, "Set validation rules to ensure data quality"),
                react_1["default"].createElement("li", null, "Consider using select fields for predefined options")))),
        relatedTopics: ['field-types', 'validation', 'management']
    },
    'field-types': {
        id: 'field-types',
        title: 'Field Types Reference',
        shortDescription: 'Understand different field types available',
        category: 'field-types',
        fullContent: (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "Available Field Types"),
            react_1["default"].createElement("h4", null, "Text"),
            react_1["default"].createElement("p", null, "Single line text input. Perfect for names, codes, addresses."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Max length: 255 characters"),
                react_1["default"].createElement("li", null, "Options: min/max length, pattern matching")),
            react_1["default"].createElement("h4", null, "Number"),
            react_1["default"].createElement("p", null, "Numeric values with optional decimal places."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Options: min value, max value, decimal places"),
                react_1["default"].createElement("li", null, "Useful for quantities, counts, amounts")),
            react_1["default"].createElement("h4", null, "Currency"),
            react_1["default"].createElement("p", null, "Monetary amounts with currency symbol and formatting."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Automatic currency symbol display"),
                react_1["default"].createElement("li", null, "Proper number formatting (thousands separator, decimals)")),
            react_1["default"].createElement("h4", null, "Date"),
            react_1["default"].createElement("p", null, "Calendar date picker."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Options: min date, max date"),
                react_1["default"].createElement("li", null, "Formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD")),
            react_1["default"].createElement("h4", null, "Select"),
            react_1["default"].createElement("p", null, "Dropdown list with predefined options (single selection)."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Limited options: up to 100 items"),
                react_1["default"].createElement("li", null, "Case-insensitive duplicate detection")),
            react_1["default"].createElement("h4", null, "Multi-Select"),
            react_1["default"].createElement("p", null, "Dropdown with multiple selection capability."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Same constraints as Select"),
                react_1["default"].createElement("li", null, "Store multiple values separated by commas")),
            react_1["default"].createElement("h4", null, "Checkbox"),
            react_1["default"].createElement("p", null, "Boolean true/false field."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Perfect for yes/no questions"),
                react_1["default"].createElement("li", null, "Stored as true/false or 0/1")),
            react_1["default"].createElement("h4", null, "Email"),
            react_1["default"].createElement("p", null, "Email address with format validation."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Automatic email format validation"),
                react_1["default"].createElement("li", null, "Case-insensitive storage")),
            react_1["default"].createElement("h4", null, "Phone"),
            react_1["default"].createElement("p", null, "Phone number with flexible format support."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Supports international formats"),
                react_1["default"].createElement("li", null, "Stores raw digits only")),
            react_1["default"].createElement("h4", null, "File"),
            react_1["default"].createElement("p", null, "File upload field with type and size constraints."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Allowed MIME types (e.g., .pdf, .doc, .xls)"),
                react_1["default"].createElement("li", null, "Max file size constraint"),
                react_1["default"].createElement("li", null, "Max number of files allowed")),
            react_1["default"].createElement("h4", null, "Rich Text"),
            react_1["default"].createElement("p", null, "Formatted text with HTML support (WYSIWYG editor)."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Bold, italic, underline formatting"),
                react_1["default"].createElement("li", null, "Lists, quotes, links")),
            react_1["default"].createElement("h4", null, "JSON"),
            react_1["default"].createElement("p", null, "Complex structured data as JSON."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "For advanced users"),
                react_1["default"].createElement("li", null, "Validates JSON structure")),
            react_1["default"].createElement("h4", null, "Percentage"),
            react_1["default"].createElement("p", null, "Numeric value 0-100 with % symbol."),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Automatically constrains 0-100 range"),
                react_1["default"].createElement("li", null, "Optional decimal places")))),
        relatedTopics: ['validation', 'getting-started']
    },
    'validation': {
        id: 'validation',
        title: 'Validation & Constraints',
        shortDescription: 'Set up rules to ensure data quality',
        category: 'validation',
        fullContent: (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "Field Validation Rules"),
            react_1["default"].createElement("h4", null, "Required Fields"),
            react_1["default"].createElement("p", null, "Mark fields as required to ensure user must provide a value."),
            react_1["default"].createElement("inlineCode", null, "Enable \"Required\" checkbox when creating field"),
            react_1["default"].createElement("h4", null, "Text Validation"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Min Length:"),
                    " Minimum number of characters required"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Max Length:"),
                    " Maximum number of characters allowed (default 255)"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Pattern:"),
                    " Regular expression for custom format validation")),
            react_1["default"].createElement("h4", null, "Number Validation"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Min Value:"),
                    " Minimum numeric value allowed"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Max Value:"),
                    " Maximum numeric value allowed"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Decimal Places:"),
                    " Number of digits after decimal point")),
            react_1["default"].createElement("h4", null, "Date Validation"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Min Date:"),
                    " Earliest date that can be selected"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Max Date:"),
                    " Latest date that can be selected")),
            react_1["default"].createElement("h4", null, "File Validation"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Allowed MIME Types:"),
                    " Restrict to specific file types"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Max File Size:"),
                    " File size limit in bytes"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Max Files:"),
                    " Number of files allowed")),
            react_1["default"].createElement("h4", null, "Best Practices"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Always add helpful error messages"),
                react_1["default"].createElement("li", null, "Use patterns for consistent data format"),
                react_1["default"].createElement("li", null, "Set realistic constraints"),
                react_1["default"].createElement("li", null, "Test validation rules before deployment")))),
        relatedTopics: ['field-types', 'management']
    },
    'management': {
        id: 'management',
        title: 'Managing Custom Fields',
        shortDescription: 'Create, edit, and delete custom fields',
        category: 'management',
        fullContent: (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "Field Management Operations"),
            react_1["default"].createElement("h4", null, "Create Field"),
            react_1["default"].createElement("ol", null,
                react_1["default"].createElement("li", null, "Select entity type from tabs"),
                react_1["default"].createElement("li", null, "Click \"Add Custom Field\" button"),
                react_1["default"].createElement("li", null,
                    "Fill in field information:",
                    react_1["default"].createElement("ul", null,
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("strong", null, "Field Name:"),
                            " Unique identifier (alphanumeric + underscore)"),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("strong", null, "Label:"),
                            " Display name for users"),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("strong", null, "Type:"),
                            " Data type for field"),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("strong", null, "Description:"),
                            " Helper text for users (optional)"))),
                react_1["default"].createElement("li", null, "Configure type-specific options"),
                react_1["default"].createElement("li", null, "Click \"Save Field\"")),
            react_1["default"].createElement("h4", null, "Edit Field"),
            react_1["default"].createElement("p", null, "Click edit icon next to field in table."),
            react_1["default"].createElement("strong", null, "Note:"),
            " Field name cannot be changed after creation to prevent data loss.",
            react_1["default"].createElement("h4", null, "Delete Field"),
            react_1["default"].createElement("ol", null,
                react_1["default"].createElement("li", null, "Click delete icon next to field"),
                react_1["default"].createElement("li", null, "Confirm deletion in dialog"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Warning:"),
                    " Existing data will be lost")),
            react_1["default"].createElement("h4", null, "Bulk Operations"),
            react_1["default"].createElement("p", null, "Select multiple fields using checkboxes to:"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Delete multiple fields at once"),
                react_1["default"].createElement("li", null, "Enable/disable fields in bulk"),
                react_1["default"].createElement("li", null, "Export configuration")),
            react_1["default"].createElement("h4", null, "Search & Filter"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Search:"),
                    " Find fields by name or label"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Filter by Type:"),
                    " Show only specific field types"),
                react_1["default"].createElement("li", null,
                    react_1["default"].createElement("strong", null, "Sort:"),
                    " Order by name, type, or creation date")),
            react_1["default"].createElement("h4", null, "Tips"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Test fields on non-critical entities first"),
                react_1["default"].createElement("li", null, "Communicate field additions to team"),
                react_1["default"].createElement("li", null, "Archive instead of delete when possible"),
                react_1["default"].createElement("li", null, "Document custom field purposes")))),
        relatedTopics: ['getting-started', 'field-types']
    },
    'troubleshooting': {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        shortDescription: 'Common issues and solutions',
        category: 'troubleshooting',
        fullContent: (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "Common Issues & Solutions"),
            react_1["default"].createElement("h4", null, "Field Not Appearing in Forms"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Check if field is marked as \"Active\""),
                react_1["default"].createElement("li", null, "Verify field is assigned to correct entity type"),
                react_1["default"].createElement("li", null, "Clear browser cache and refresh page"),
                react_1["default"].createElement("li", null, "Check user permissions for entity access")),
            react_1["default"].createElement("h4", null, "Validation Not Working"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Ensure field is marked as \"Required\" if needed"),
                react_1["default"].createElement("li", null, "Check validation pattern syntax"),
                react_1["default"].createElement("li", null, "Test with simple values first"),
                react_1["default"].createElement("li", null, "Check browser console for errors")),
            react_1["default"].createElement("h4", null, "Duplicate Field Name Error"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Field names must be unique within entity type"),
                react_1["default"].createElement("li", null, "Try different naming scheme (e.g., add prefix)"),
                react_1["default"].createElement("li", null, "Check if field was previously deleted")),
            react_1["default"].createElement("h4", null, "Permission Errors"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Verify you have \"Manage Custom Fields\" permission"),
                react_1["default"].createElement("li", null, "Contact administrator if permissions missing"),
                react_1["default"].createElement("li", null, "Try logout and login again")),
            react_1["default"].createElement("h4", null, "Data Not Saving"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Check network connection"),
                react_1["default"].createElement("li", null, "Verify all required fields are filled"),
                react_1["default"].createElement("li", null, "Try operation again after a few seconds"),
                react_1["default"].createElement("li", null, "Check browser console for detailed error")),
            react_1["default"].createElement("h4", null, "Need More Help?"),
            react_1["default"].createElement("p", null, "Contact support team with:"),
            react_1["default"].createElement("ul", null,
                react_1["default"].createElement("li", null, "Screenshot of issue"),
                react_1["default"].createElement("li", null, "Steps to reproduce"),
                react_1["default"].createElement("li", null, "Browser and OS information")))),
        relatedTopics: ['management', 'validation']
    }
};
/**
 * Help Panel - Full-featured help interface
 */
exports.HelpPanel = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(null), selectedTopic = _b[0], setSelectedTopic = _b[1];
    var _c = react_1.useState(''), searchQuery = _c[0], setSearchQuery = _c[1];
    var filteredTopics = react_1.useMemo(function () {
        if (!searchQuery)
            return Object.values(exports.HELP_LIBRARY);
        var query = searchQuery.toLowerCase();
        return Object.values(exports.HELP_LIBRARY).filter(function (topic) {
            return topic.title.toLowerCase().includes(query) ||
                topic.shortDescription.toLowerCase().includes(query);
        });
    }, [searchQuery]);
    var currentTopic = selectedTopic ? exports.HELP_LIBRARY[selectedTopic] : null;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        isOpen && (react_1["default"].createElement("div", { className: "help-panel-overlay", onClick: onClose, role: "presentation" })),
        react_1["default"].createElement("div", { className: "help-panel " + (isOpen ? 'open' : ''), role: "dialog", "aria-label": "Help and Documentation" },
            react_1["default"].createElement("div", { className: "help-panel-header" },
                react_1["default"].createElement("h2", null, "Help & Documentation"),
                react_1["default"].createElement("button", { className: "help-panel-close", onClick: onClose, "aria-label": "Close help panel", title: "Close (Shift+?)" }, "\u2715")),
            react_1["default"].createElement("div", { className: "help-panel-body" }, currentTopic ? (
            // Topic View
            react_1["default"].createElement("div", { className: "help-topic" },
                react_1["default"].createElement("button", { className: "help-back-button", onClick: function () { return setSelectedTopic(null); } }, "\u2190 Back"),
                react_1["default"].createElement("div", { className: "help-topic-content" }, currentTopic.fullContent),
                currentTopic.relatedTopics && currentTopic.relatedTopics.length > 0 && (react_1["default"].createElement("div", { className: "help-related-topics" },
                    react_1["default"].createElement("h4", null, "Related Topics"),
                    react_1["default"].createElement("div", { className: "help-related-list" }, currentTopic.relatedTopics.map(function (topicId) {
                        var topic = exports.HELP_LIBRARY[topicId];
                        return (react_1["default"].createElement("button", { key: topicId, className: "help-related-link", onClick: function () { return setSelectedTopic(topicId); } }, topic === null || topic === void 0 ? void 0 : topic.title));
                    })))))) : (
            // Search View
            react_1["default"].createElement("div", { className: "help-search-view" },
                react_1["default"].createElement("div", { className: "help-search-box" },
                    react_1["default"].createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
                        react_1["default"].createElement("circle", { cx: "11", cy: "11", r: "8" }),
                        react_1["default"].createElement("path", { d: "m21 21-4.35-4.35" })),
                    react_1["default"].createElement("input", { type: "text", placeholder: "Search help topics...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "help-search-input", autoFocus: true }),
                    searchQuery && (react_1["default"].createElement("button", { className: "help-search-clear", onClick: function () { return setSearchQuery(''); }, "aria-label": "Clear search" }, "\u2715"))),
                filteredTopics.length > 0 ? (react_1["default"].createElement("div", { className: "help-topics-list" }, filteredTopics.map(function (topic) { return (react_1["default"].createElement("button", { key: topic.id, className: "help-topic-card", onClick: function () { return setSelectedTopic(topic.id); } },
                    react_1["default"].createElement("h3", null, topic.title),
                    react_1["default"].createElement("p", null, topic.shortDescription))); }))) : (react_1["default"].createElement("div", { className: "help-no-results" },
                    react_1["default"].createElement("p", null,
                        "No topics found for \"",
                        searchQuery,
                        "\""),
                    react_1["default"].createElement("button", { onClick: function () { return setSearchQuery(''); } }, "Clear search")))))),
            react_1["default"].createElement("div", { className: "help-panel-footer" },
                react_1["default"].createElement("small", null,
                    "Press ",
                    react_1["default"].createElement("kbd", null, "Shift"),
                    " + ",
                    react_1["default"].createElement("kbd", null, "?"),
                    " to toggle help")))));
};
exports.Tooltip = function (_a) {
    var content = _a.content, children = _a.children, _b = _a.position, position = _b === void 0 ? 'top' : _b, _c = _a.delay, delay = _c === void 0 ? 200 : _c;
    var _d = react_1.useState(false), isVisible = _d[0], setIsVisible = _d[1];
    var timeoutRef = react_1["default"].useRef();
    var handleMouseEnter = function () {
        timeoutRef.current = setTimeout(function () {
            setIsVisible(true);
        }, delay);
    };
    var handleMouseLeave = function () {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };
    react_1["default"].useEffect(function () {
        return function () {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    }, []);
    return (react_1["default"].createElement("div", { className: "tooltip-wrapper", onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
        children,
        isVisible && (react_1["default"].createElement("div", { className: "tooltip tooltip-" + position, role: "tooltip" }, content))));
};
exports.HelpIcon = function (_a) {
    var topic = _a.topic, content = _a.content, onHelpClick = _a.onHelpClick;
    var handleClick = function () {
        if (onHelpClick) {
            onHelpClick();
        }
        else if (topic) {
            // Could trigger opening help panel with specific topic
            console.log('Help requested for:', topic);
        }
    };
    return (react_1["default"].createElement(exports.Tooltip, { content: content || 'Click for more information' },
        react_1["default"].createElement("button", { className: "help-icon-button", onClick: handleClick, "aria-label": "Help", title: "Click for help" },
            react_1["default"].createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "10" }),
                react_1["default"].createElement("path", { d: "M12 16v-4m0-4h.01" })))));
};
exports["default"] = exports.HelpPanel;
