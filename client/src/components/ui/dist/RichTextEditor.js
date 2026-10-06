"use strict";
exports.__esModule = true;
exports.RichTextEditor = void 0;
/**
 * RichTextEditor — Tiptap-based rich text editor with formatting toolbar.
 * Stores and returns HTML content.
 */
var react_1 = require("@tiptap/react");
var starter_kit_1 = require("@tiptap/starter-kit");
var extension_placeholder_1 = require("@tiptap/extension-placeholder");
var extension_link_1 = require("@tiptap/extension-link");
var extension_text_align_1 = require("@tiptap/extension-text-align");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./button");
function RichTextEditor(_a) {
    var _b = _a.value, value = _b === void 0 ? "" : _b, onChange = _a.onChange, _c = _a.placeholder, placeholder = _c === void 0 ? "Start typing..." : _c, className = _a.className, _d = _a.minHeight, minHeight = _d === void 0 ? "150px" : _d, _e = _a.readOnly, readOnly = _e === void 0 ? false : _e;
    var editor = react_1.useEditor({
        extensions: [
            starter_kit_1["default"].configure({
                heading: { levels: [2, 3, 4] }
            }),
            extension_placeholder_1["default"].configure({ placeholder: placeholder }),
            extension_link_1["default"].configure({
                openOnClick: false,
                HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" }
            }),
            extension_text_align_1["default"].configure({ types: ["heading", "paragraph"] }),
        ],
        content: value,
        editable: !readOnly,
        onUpdate: function (_a) {
            var editor = _a.editor;
            onChange === null || onChange === void 0 ? void 0 : onChange(editor.getHTML());
        }
    });
    if (!editor)
        return null;
    var ToolbarButton = function (_a) {
        var onClick = _a.onClick, active = _a.active, title = _a.title, children = _a.children;
        return (React.createElement(button_1.Button, { type: "button", variant: active ? "secondary" : "ghost", size: "sm", className: utils_1.cn("h-7 w-7 p-0", active && "bg-muted"), onClick: onClick, title: title }, children));
    };
    var setLink = function () {
        var prev = editor.getAttributes("link").href;
        var url = window.prompt("Enter URL", prev || "https://");
        if (url === null)
            return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        }
        else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };
    return (React.createElement("div", { className: utils_1.cn("border rounded-md overflow-hidden", className) },
        !readOnly && (React.createElement("div", { className: "flex flex-wrap items-center gap-0.5 px-2 py-1 border-b bg-muted/30" },
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleBold().run(); }, active: editor.isActive("bold"), title: "Bold" },
                React.createElement(lucide_react_1.Bold, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleItalic().run(); }, active: editor.isActive("italic"), title: "Italic" },
                React.createElement(lucide_react_1.Italic, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleStrike().run(); }, active: editor.isActive("strike"), title: "Strikethrough" },
                React.createElement(lucide_react_1.Strikethrough, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleCode().run(); }, active: editor.isActive("code"), title: "Inline code" },
                React.createElement(lucide_react_1.Code, { size: 13 })),
            React.createElement("span", { className: "w-px h-5 bg-border mx-1" }),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleHeading({ level: 2 }).run(); }, active: editor.isActive("heading", { level: 2 }), title: "Heading 2" },
                React.createElement(lucide_react_1.Heading2, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleHeading({ level: 3 }).run(); }, active: editor.isActive("heading", { level: 3 }), title: "Heading 3" },
                React.createElement(lucide_react_1.Heading3, { size: 13 })),
            React.createElement("span", { className: "w-px h-5 bg-border mx-1" }),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleBulletList().run(); }, active: editor.isActive("bulletList"), title: "Bullet list" },
                React.createElement(lucide_react_1.List, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().toggleOrderedList().run(); }, active: editor.isActive("orderedList"), title: "Numbered list" },
                React.createElement(lucide_react_1.ListOrdered, { size: 13 })),
            React.createElement("span", { className: "w-px h-5 bg-border mx-1" }),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().setTextAlign("left").run(); }, active: editor.isActive({ textAlign: "left" }), title: "Align left" },
                React.createElement(lucide_react_1.AlignLeft, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().setTextAlign("center").run(); }, active: editor.isActive({ textAlign: "center" }), title: "Align center" },
                React.createElement(lucide_react_1.AlignCenter, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().setTextAlign("right").run(); }, active: editor.isActive({ textAlign: "right" }), title: "Align right" },
                React.createElement(lucide_react_1.AlignRight, { size: 13 })),
            React.createElement("span", { className: "w-px h-5 bg-border mx-1" }),
            React.createElement(ToolbarButton, { onClick: setLink, active: editor.isActive("link"), title: "Add link" },
                React.createElement(lucide_react_1.Link, { size: 13 })),
            React.createElement("span", { className: "w-px h-5 bg-border mx-1" }),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().undo().run(); }, active: false, title: "Undo" },
                React.createElement(lucide_react_1.Undo, { size: 13 })),
            React.createElement(ToolbarButton, { onClick: function () { return editor.chain().focus().redo().run(); }, active: false, title: "Redo" },
                React.createElement(lucide_react_1.Redo, { size: 13 })))),
        React.createElement(react_1.EditorContent, { editor: editor, className: utils_1.cn("prose prose-sm max-w-none px-3 py-2 focus-within:outline-none", "[&_.tiptap]:outline-none [&_.tiptap]:min-h-[var(--editor-min-h)]", "[&_.tiptap_p.is-editor-empty:first-child:before]:content-[attr(data-placeholder)]", "[&_.tiptap_p.is-editor-empty:first-child:before]:text-muted-foreground", "[&_.tiptap_p.is-editor-empty:first-child:before]:float-left", "[&_.tiptap_p.is-editor-empty:first-child:before]:pointer-events-none", "[&_.tiptap_p.is-editor-empty:first-child:before]:h-0"), style: { "--editor-min-h": minHeight } })));
}
exports.RichTextEditor = RichTextEditor;
