"use strict";
exports.__esModule = true;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// ─── HTML Validation ─────────────────────────────────────────────────────────
function validateHTML(html) {
    var errors = [];
    var lines = html.split("\n");
    // Check for unclosed tags
    var openTags = [];
    var selfClosingTags = new Set([
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    ]);
    lines.forEach(function (line, lineNum) {
        var tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*\/?>/g;
        var match;
        while ((match = tagRegex.exec(line)) !== null) {
            var fullTag = match[0];
            var tagName = match[1].toLowerCase();
            if (fullTag.startsWith("</")) {
                // Closing tag
                if (openTags.length === 0 || openTags[openTags.length - 1].tag !== tagName) {
                    errors.push({
                        line: lineNum + 1,
                        type: "error",
                        message: "Mismatched closing tag: </" + tagName + ">"
                    });
                }
                else {
                    openTags.pop();
                }
            }
            else if (!fullTag.endsWith("/>") && !selfClosingTags.has(tagName)) {
                // Opening tag
                openTags.push({ tag: tagName, line: lineNum + 1 });
            }
        }
    });
    // Report unclosed tags
    openTags.forEach(function (tag) {
        errors.push({
            line: tag.line,
            type: "error",
            message: "Unclosed tag: <" + tag.tag + ">"
        });
    });
    // Check for common issues
    lines.forEach(function (line, lineNum) {
        // Warn about missing alt attributes in images
        if (/<img\s+(?!.*alt=)/.test(line)) {
            errors.push({
                line: lineNum + 1,
                type: "warning",
                message: "Image missing 'alt' attribute (accessibility issue)"
            });
        }
        // Warn about missing href in links
        if (/<a\s+(?!.*href=)/.test(line)) {
            errors.push({
                line: lineNum + 1,
                type: "warning",
                message: "Link missing 'href' attribute"
            });
        }
    });
    return errors.slice(0, 20); // Limit to 20 errors to avoid clutter
}
// ─── Syntax Highlighting (Simple) ────────────────────────────────────────────
function highlightHTML(html) {
    var parts = [];
    var tagRegex = /(<[^>]+>|&[a-zA-Z0-9]+;|{{[^}]+}})/g;
    var lastIndex = 0;
    var match;
    while ((match = tagRegex.exec(html)) !== null) {
        // Add text before tag
        if (match.index > lastIndex) {
            parts.push(react_1["default"].createElement("span", { key: "text-" + lastIndex, className: "text-gray-700" }, html.substring(lastIndex, match.index)));
        }
        // Add colored tag
        var tag = match[0];
        var className = "text-blue-600";
        if (tag.startsWith("{{")) {
            className = "text-purple-600 font-semibold"; // Variables
        }
        else if (tag.startsWith("</")) {
            className = "text-orange-600"; // Closing tag
        }
        else if (tag.startsWith("<")) {
            className = "text-blue-600"; // Opening tag
        }
        else if (tag.startsWith("&")) {
            className = "text-green-600"; // Entity
        }
        parts.push(react_1["default"].createElement("span", { key: "tag-" + match.index, className: className }, tag));
        lastIndex = match.index + tag.length;
    }
    // Add remaining text
    if (lastIndex < html.length) {
        parts.push(react_1["default"].createElement("span", { key: "text-" + lastIndex, className: "text-gray-700" }, html.substring(lastIndex)));
    }
    return parts;
}
// ─── Main Component ──────────────────────────────────────────────────────────
function HTMLEditor(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Enter HTML code..." : _b, variables = _a.variables, _c = _a.minHeight, minHeight = _c === void 0 ? "300px" : _c, height = _a.height;
    var _d = react_1.useState(false), isFullscreen = _d[0], setIsFullscreen = _d[1];
    var _e = react_1.useState([]), errors = _e[0], setErrors = _e[1];
    var _f = react_1.useState(true), showLineNumbers = _f[0], setShowLineNumbers = _f[1];
    var editorRef = react_1.useRef(null);
    // Validate on change
    react_1.useEffect(function () {
        var newErrors = validateHTML(value);
        setErrors(newErrors);
    }, [value]);
    var handleChange = function (e) {
        onChange(e.target.value);
    };
    var handleCopy = function () {
        navigator.clipboard.writeText(value);
        sonner_1.toast.success("HTML copied to clipboard");
    };
    var handleDownload = function () {
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/html;charset=utf-8," + encodeURIComponent(value));
        element.setAttribute("download", "template.html");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        sonner_1.toast.success("HTML downloaded");
    };
    var handleFormat = function () {
        try {
            // Simple HTML formatting
            var formatted = value
                .replace(/></g, ">\n<") // Add newlines between tags
                .replace(/\n+/g, "\n") // Remove multiple blank lines
                .trim();
            // Indent nested elements
            var indentLevel_1 = 0;
            formatted = formatted
                .split("\n")
                .map(function (line) {
                var trimmed = line.trim();
                if (trimmed.startsWith("</"))
                    indentLevel_1 = Math.max(0, indentLevel_1 - 1);
                var indent = "  ".repeat(indentLevel_1);
                if (!trimmed.startsWith("</") && (trimmed.startsWith("<") && !trimmed.endsWith("/>"))) {
                    indentLevel_1++;
                }
                return indent + trimmed;
            })
                .join("\n");
            onChange(formatted);
            sonner_1.toast.success("HTML formatted");
        }
        catch (error) {
            sonner_1.toast.error("Failed to format HTML");
        }
    };
    var handleInsertVariable = function (variable) {
        if (editorRef.current) {
            var start_1 = editorRef.current.selectionStart;
            var end = editorRef.current.selectionEnd;
            var newValue = value.substring(0, start_1) + variable.value + value.substring(end);
            onChange(newValue);
            // Move cursor after inserted variable
            setTimeout(function () {
                if (editorRef.current) {
                    editorRef.current.selectionStart = editorRef.current.selectionEnd = start_1 + variable.value.length;
                    editorRef.current.focus();
                }
            }, 0);
        }
    };
    var hasErrors = errors.some(function (e) { return e.type === "error"; });
    var hasWarnings = errors.some(function (e) { return e.type === "warning"; });
    var editorContent = (react_1["default"].createElement("div", { className: utils_1.cn("border border-gray-300 rounded-lg bg-white overflow-hidden flex flex-col", isFullscreen && "fixed inset-0 z-50 rounded-none border-0"), style: { height: isFullscreen ? "100vh" : height || minHeight } },
        react_1["default"].createElement("div", { className: "bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between gap-2 flex-wrap" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: handleFormat, title: "Auto-format HTML", className: "h-8 w-8 p-0" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "h-4 w-4" })),
                react_1["default"].createElement("div", { className: "w-px h-6 bg-gray-300" }),
                variables && variables.length > 0 && (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("div", { className: "flex gap-1 flex-wrap" },
                        variables.slice(0, 5).map(function (v, i) { return (react_1["default"].createElement(button_1.Button, { key: i, size: "sm", variant: "outline", onClick: function () { return handleInsertVariable(v); }, className: "h-8 text-xs px-2", title: v.label },
                            "+",
                            v.value)); }),
                        variables.length > 5 && (react_1["default"].createElement("span", { className: "text-xs text-gray-500 px-2 py-1" },
                            "+",
                            variables.length - 5,
                            " more"))),
                    react_1["default"].createElement("div", { className: "w-px h-6 bg-gray-300" }))),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: handleCopy, title: "Copy to clipboard", className: "h-8 w-8 p-0" },
                    react_1["default"].createElement(lucide_react_1.Copy, { className: "h-4 w-4" })),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: handleDownload, title: "Download HTML", className: "h-8 w-8 p-0" },
                    react_1["default"].createElement(lucide_react_1.Download, { className: "h-4 w-4" }))),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                hasErrors && (react_1["default"].createElement("div", { className: "flex items-center gap-1 text-red-600 text-sm" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null,
                        errors.filter(function (e) { return e.type === "error"; }).length,
                        " error(s)"))),
                hasWarnings && !hasErrors && (react_1["default"].createElement("div", { className: "flex items-center gap-1 text-amber-600 text-sm" },
                    react_1["default"].createElement(lucide_react_1.Info, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null,
                        errors.filter(function (e) { return e.type === "warning"; }).length,
                        " warning(s)"))),
                !hasErrors && !hasWarnings && (react_1["default"].createElement("div", { className: "flex items-center gap-1 text-green-600 text-sm" },
                    react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }),
                    react_1["default"].createElement("span", null, "Valid HTML"))),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setIsFullscreen(!isFullscreen); }, title: isFullscreen ? "Exit fullscreen" : "Enter fullscreen", className: "h-8 w-8 p-0" }, isFullscreen ? (react_1["default"].createElement(lucide_react_1.Minimize2, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.Maximize2, { className: "h-4 w-4" }))))),
        react_1["default"].createElement("div", { className: "flex flex-1 overflow-hidden bg-white" },
            showLineNumbers && (react_1["default"].createElement("div", { className: "bg-gray-100 border-r border-gray-200 py-2 px-2 overflow-hidden text-right font-mono text-xs text-gray-500 select-none w-12" }, value.split("\n").map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "h-6" }, i + 1)); }))),
            react_1["default"].createElement("textarea", { ref: editorRef, value: value, onChange: handleChange, placeholder: placeholder, className: utils_1.cn("flex-1 p-3 font-mono text-sm resize-none outline-none bg-white text-gray-800 placeholder-gray-400", "border-0 focus:ring-0", "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"), spellCheck: false })),
        errors.length > 0 && (react_1["default"].createElement("div", { className: "border-t border-gray-200 bg-gray-50 max-h-32 overflow-y-auto" }, errors.map(function (error, i) { return (react_1["default"].createElement("div", { key: i, className: utils_1.cn("px-3 py-2 border-b border-gray-200 last:border-b-0 text-xs flex gap-2", error.type === "error" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700") },
            react_1["default"].createElement("span", { className: "font-semibold" },
                "Line ",
                error.line,
                ":"),
            react_1["default"].createElement("span", null, error.message))); })))));
    return (react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "editor", className: "w-full" },
        react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
            react_1["default"].createElement(tabs_1.TabsTrigger, { value: "editor", className: "flex gap-2" },
                react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                "HTML Editor"),
            react_1["default"].createElement(tabs_1.TabsTrigger, { value: "preview", className: "flex gap-2" },
                react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
                "Preview")),
        react_1["default"].createElement(tabs_1.TabsContent, { value: "editor", className: "mt-4" }, editorContent),
        react_1["default"].createElement(tabs_1.TabsContent, { value: "preview", className: "mt-4" },
            react_1["default"].createElement("div", { className: "border border-gray-300 rounded-lg bg-white p-4", style: { minHeight: minHeight, maxHeight: "800px", overflow: "auto" } }, value ? (react_1["default"].createElement("div", { className: "prose prose-sm dark:prose-invert max-w-none", dangerouslySetInnerHTML: { __html: value } })) : (react_1["default"].createElement("div", { className: "text-gray-400 text-center py-8" }, "Enter HTML code to see preview"))))));
}
exports["default"] = HTMLEditor;
