"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.RichTextDisplay = exports.RichTextEditor = void 0;
var react_1 = require("react");
var react_2 = require("@tiptap/react");
var starter_kit_1 = require("@tiptap/starter-kit");
var extension_placeholder_1 = require("@tiptap/extension-placeholder");
var extension_underline_1 = require("@tiptap/extension-underline");
var extension_text_align_1 = require("@tiptap/extension-text-align");
var extension_text_style_1 = require("@tiptap/extension-text-style");
var extension_color_1 = require("@tiptap/extension-color");
var extension_link_1 = require("@tiptap/extension-link");
var extension_image_1 = require("@tiptap/extension-image");
var extension_table_1 = require("@tiptap/extension-table");
var extension_table_row_1 = require("@tiptap/extension-table-row");
var extension_table_cell_1 = require("@tiptap/extension-table-cell");
var extension_table_header_1 = require("@tiptap/extension-table-header");
var utils_1 = require("@/lib/utils");
var toggle_1 = require("@/components/ui/toggle");
var lucide_react_1 = require("lucide-react");
// === Custom TipTap Extensions (inline) ===
var FontFamily = react_2.Extension.create({
    name: "fontFamily",
    addOptions: function () { return { types: ["textStyle"] }; },
    addGlobalAttributes: function () {
        return [{
                types: this.options.types,
                attributes: {
                    fontFamily: {
                        "default": null,
                        parseHTML: function (el) { var _a; return ((_a = el.style.fontFamily) === null || _a === void 0 ? void 0 : _a.replace(/['"]+/g, "")) || null; },
                        renderHTML: function (attrs) { return attrs.fontFamily ? { style: "font-family: " + attrs.fontFamily } : {}; }
                    }
                }
            }];
    },
    addCommands: function () {
        return {
            setFontFamily: function (ff) { return function (_a) {
                var chain = _a.chain;
                return chain().setMark("textStyle", { fontFamily: ff }).run();
            }; },
            unsetFontFamily: function () { return function (_a) {
                var chain = _a.chain;
                return chain().setMark("textStyle", { fontFamily: null }).removeEmptyTextStyle().run();
            }; }
        };
    }
});
var FontSize = react_2.Extension.create({
    name: "fontSize",
    addOptions: function () { return { types: ["textStyle"] }; },
    addGlobalAttributes: function () {
        return [{
                types: this.options.types,
                attributes: {
                    fontSize: {
                        "default": null,
                        parseHTML: function (el) { return el.style.fontSize || null; },
                        renderHTML: function (attrs) { return attrs.fontSize ? { style: "font-size: " + attrs.fontSize } : {}; }
                    }
                }
            }];
    },
    addCommands: function () {
        return {
            setFontSize: function (fs) { return function (_a) {
                var chain = _a.chain;
                return chain().setMark("textStyle", { fontSize: fs }).run();
            }; },
            unsetFontSize: function () { return function (_a) {
                var chain = _a.chain;
                return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
            }; }
        };
    }
});
var HighlightMark = react_2.Mark.create({
    name: "highlight",
    addOptions: function () { return { multicolor: true, HTMLAttributes: {} }; },
    addAttributes: function () {
        if (!this.options.multicolor)
            return {};
        return {
            color: {
                "default": null,
                parseHTML: function (el) { return el.getAttribute("data-color") || el.style.backgroundColor; },
                renderHTML: function (attrs) {
                    if (!attrs.color)
                        return { style: "background-color: #fef08a" };
                    return { "data-color": attrs.color, style: "background-color: " + attrs.color };
                }
            }
        };
    },
    parseHTML: function () { return [{ tag: "mark" }]; },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ["mark", react_2.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            setHighlight: function (a) { return function (_a) {
                var commands = _a.commands;
                return commands.setMark(_this.name, a);
            }; },
            toggleHighlight: function (a) { return function (_a) {
                var commands = _a.commands;
                return commands.toggleMark(_this.name, a);
            }; },
            unsetHighlight: function () { return function (_a) {
                var commands = _a.commands;
                return commands.unsetMark(_this.name);
            }; }
        };
    }
});
var SubscriptMark = react_2.Mark.create({
    name: "subscript",
    parseHTML: function () { return [{ tag: "sub" }]; },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ["sub", react_2.mergeAttributes(HTMLAttributes), 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            toggleSubscript: function () { return function (_a) {
                var commands = _a.commands;
                return commands.toggleMark(_this.name);
            }; }
        };
    }
});
var SuperscriptMark = react_2.Mark.create({
    name: "superscript",
    excludes: "subscript",
    parseHTML: function () { return [{ tag: "sup" }]; },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ["sup", react_2.mergeAttributes(HTMLAttributes), 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            toggleSuperscript: function () { return function (_a) {
                var commands = _a.commands;
                return commands.toggleMark(_this.name);
            }; }
        };
    }
});
var LineSpacing = react_2.Extension.create({
    name: "lineSpacing",
    addGlobalAttributes: function () {
        return [{
                types: ["paragraph", "heading"],
                attributes: {
                    lineHeight: {
                        "default": null,
                        parseHTML: function (el) { return el.style.lineHeight || null; },
                        renderHTML: function (attrs) { return attrs.lineHeight ? { style: "line-height: " + attrs.lineHeight } : {}; }
                    }
                }
            }];
    },
    addCommands: function () {
        return {
            setLineSpacing: function (val) { return function (_a) {
                var tr = _a.tr, state = _a.state, dispatch = _a.dispatch;
                var _b = state.selection, from = _b.from, to = _b.to;
                state.doc.nodesBetween(from, to, function (node, pos) {
                    if (node.type.name === "paragraph" || node.type.name === "heading") {
                        tr.setNodeMarkup(pos, undefined, __assign(__assign({}, node.attrs), { lineHeight: val }));
                    }
                });
                if (dispatch)
                    dispatch(tr);
                return true;
            }; }
        };
    }
});
var Indent = react_2.Extension.create({
    name: "indent",
    addGlobalAttributes: function () {
        return [{
                types: ["paragraph", "heading"],
                attributes: {
                    indent: {
                        "default": 0,
                        parseHTML: function (el) {
                            var ml = el.style.marginLeft;
                            return ml ? parseInt(ml, 10) / 24 : 0;
                        },
                        renderHTML: function (attrs) { return attrs.indent > 0 ? { style: "margin-left: " + attrs.indent * 24 + "px" } : {}; }
                    }
                }
            }];
    },
    addCommands: function () {
        return {
            indent: function () { return function (_a) {
                var tr = _a.tr, state = _a.state, dispatch = _a.dispatch;
                var _b = state.selection, from = _b.from, to = _b.to;
                state.doc.nodesBetween(from, to, function (node, pos) {
                    if (node.type.name === "paragraph" || node.type.name === "heading") {
                        var cur = node.attrs.indent || 0;
                        if (cur < 10)
                            tr.setNodeMarkup(pos, undefined, __assign(__assign({}, node.attrs), { indent: cur + 1 }));
                    }
                });
                if (dispatch)
                    dispatch(tr);
                return true;
            }; },
            outdent: function () { return function (_a) {
                var tr = _a.tr, state = _a.state, dispatch = _a.dispatch;
                var _b = state.selection, from = _b.from, to = _b.to;
                state.doc.nodesBetween(from, to, function (node, pos) {
                    if (node.type.name === "paragraph" || node.type.name === "heading") {
                        var cur = node.attrs.indent || 0;
                        if (cur > 0)
                            tr.setNodeMarkup(pos, undefined, __assign(__assign({}, node.attrs), { indent: cur - 1 }));
                    }
                });
                if (dispatch)
                    dispatch(tr);
                return true;
            }; }
        };
    }
});
var BackgroundColor = react_2.Mark.create({
    name: "backgroundColor",
    addAttributes: function () {
        return {
            color: {
                "default": null,
                parseHTML: function (el) { return el.style.backgroundColor || null; },
                renderHTML: function (attrs) {
                    if (!attrs.color)
                        return {};
                    return { style: "background-color: " + attrs.color + "; padding: 2px 0;" };
                }
            }
        };
    },
    parseHTML: function () { return [{ tag: "span[data-bg-color]" }]; },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return ["span", react_2.mergeAttributes({ "data-bg-color": "" }, HTMLAttributes), 0];
    },
    addCommands: function () {
        var _this = this;
        return {
            setBackgroundColor: function (color) { return function (_a) {
                var commands = _a.commands;
                return commands.setMark(_this.name, { color: color });
            }; },
            unsetBackgroundColor: function () { return function (_a) {
                var commands = _a.commands;
                return commands.unsetMark(_this.name);
            }; }
        };
    }
});
// Resizable Image with alignment and sizing
var ResizableImage = extension_image_1["default"].extend({
    addAttributes: function () {
        var _a;
        return __assign(__assign({}, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.call(this)), { width: {
                "default": null,
                parseHTML: function (el) { return el.style.width || el.getAttribute("width") || null; },
                renderHTML: function (attrs) { return attrs.width ? { style: "width: " + attrs.width } : {}; }
            }, alignment: {
                "default": null,
                parseHTML: function (el) { return el.getAttribute("data-align") || null; },
                renderHTML: function (attrs) { return attrs.alignment ? { "data-align": attrs.alignment } : {}; }
            } });
    }
});
// List style types for bullet and ordered lists
var ListStyles = react_2.Extension.create({
    name: "listStyles",
    addGlobalAttributes: function () {
        return [{
                types: ["bulletList", "orderedList"],
                attributes: {
                    listStyleType: {
                        "default": null,
                        parseHTML: function (el) { return el.style.listStyleType || null; },
                        renderHTML: function (attrs) { return attrs.listStyleType ? { style: "list-style-type: " + attrs.listStyleType } : {}; }
                    }
                }
            }];
    },
    addCommands: function () {
        return {
            setListStyleType: function (type) { return function (_a) {
                var tr = _a.tr, state = _a.state, dispatch = _a.dispatch;
                var $from = state.selection.$from;
                for (var depth = $from.depth; depth >= 0; depth--) {
                    var node = $from.node(depth);
                    if (node.type.name === "bulletList" || node.type.name === "orderedList") {
                        var pos = $from.before(depth);
                        tr.setNodeMarkup(pos, undefined, __assign(__assign({}, node.attrs), { listStyleType: type }));
                        if (dispatch)
                            dispatch(tr);
                        return true;
                    }
                }
                return false;
            }; }
        };
    }
});
// Extended TableCell with text alignment
var CustomTableCell = extension_table_cell_1.TableCell.extend({
    addAttributes: function () {
        var _a;
        return __assign(__assign({}, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.call(this)), { textAlign: {
                "default": null,
                parseHTML: function (el) { return el.style.textAlign || null; },
                renderHTML: function (attrs) { return attrs.textAlign ? { style: "text-align: " + attrs.textAlign } : {}; }
            } });
    }
});
// Extended TableHeader with text alignment
var CustomTableHeader = extension_table_header_1.TableHeader.extend({
    addAttributes: function () {
        var _a;
        return __assign(__assign({}, (_a = this.parent) === null || _a === void 0 ? void 0 : _a.call(this)), { textAlign: {
                "default": null,
                parseHTML: function (el) { return el.style.textAlign || null; },
                renderHTML: function (attrs) { return attrs.textAlign ? { style: "text-align: " + attrs.textAlign } : {}; }
            } });
    }
});
// === Constants ===
var FONT_FAMILIES = [
    { label: "Default", value: "" },
    { label: "Arial", value: "Arial" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Inter", value: "Inter" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Verdana", value: "Verdana" },
];
var FONT_SIZES = [
    { label: "Small", value: "12px" },
    { label: "Normal", value: "14px" },
    { label: "Medium", value: "16px" },
    { label: "Large", value: "18px" },
    { label: "X-Large", value: "24px" },
    { label: "XX-Large", value: "32px" },
];
var HEADING_LEVELS = [
    { label: "Normal", level: 0 },
    { label: "Heading 1", level: 1 },
    { label: "Heading 2", level: 2 },
    { label: "Heading 3", level: 3 },
    { label: "Heading 4", level: 4 },
];
var HIGHLIGHT_COLORS = [
    "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff",
    "#fed7aa", "#fce7f3", "#ccfbf1", "#f1f5f9", "#fef9c3",
    "#d1fae5", "#dbeafe", "#ede9fe", "#fce7f3", "#fff7ed",
];
var TEXT_COLORS = [
    "#000000", "#374151", "#6b7280", "#9ca3af", "#ffffff",
    "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d",
    "#16a34a", "#059669", "#0891b2", "#2563eb", "#4f46e5",
    "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48",
];
var LINE_SPACING_OPTIONS = [
    { label: "1.0", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "2.0", value: "2" },
    { label: "2.5", value: "2.5" },
    { label: "3.0", value: "3" },
];
var BORDER_STYLES = [
    { label: "None", value: "none" },
    { label: "Thin", value: "1px solid #d1d5db" },
    { label: "Medium", value: "2px solid #9ca3af" },
    { label: "Thick", value: "3px solid #6b7280" },
    { label: "Double", value: "3px double #6b7280" },
    { label: "Dashed", value: "2px dashed #9ca3af" },
    { label: "Dotted", value: "2px dotted #9ca3af" },
];
var BULLET_LIST_STYLES = [
    { label: "● Disc", value: "disc" },
    { label: "○ Circle", value: "circle" },
    { label: "■ Square", value: "square" },
];
var ORDERED_LIST_STYLES = [
    { label: "1, 2, 3", value: "decimal" },
    { label: "a, b, c", value: "lower-alpha" },
    { label: "A, B, C", value: "upper-alpha" },
    { label: "i, ii, iii", value: "lower-roman" },
    { label: "I, II, III", value: "upper-roman" },
];
function RichTextEditor(_a) {
    var _b;
    var value = _a.value, onChange = _a.onChange, _c = _a.placeholder, placeholder = _c === void 0 ? "Enter text..." : _c, _d = _a.minHeight, minHeight = _d === void 0 ? "150px" : _d, className = _a.className, _e = _a.readOnly, readOnly = _e === void 0 ? false : _e, _f = _a.enhanced, enhanced = _f === void 0 ? false : _f, variables = _a.variables, onInsertVariable = _a.onInsertVariable;
    var _g = react_1.useState(false), isFullscreen = _g[0], setIsFullscreen = _g[1];
    var _h = react_1.useState(false), tablePickerOpen = _h[0], setTablePickerOpen = _h[1];
    var _j = react_1.useState({ rows: 0, cols: 0 }), tableHover = _j[0], setTableHover = _j[1];
    var _k = react_1.useState(false), showHeadingDD = _k[0], setShowHeadingDD = _k[1];
    var _l = react_1.useState(false), showFontDD = _l[0], setShowFontDD = _l[1];
    var _m = react_1.useState(false), showFontSizeDD = _m[0], setShowFontSizeDD = _m[1];
    var _o = react_1.useState(false), showColorPicker = _o[0], setShowColorPicker = _o[1];
    var _p = react_1.useState(false), showHighlightPicker = _p[0], setShowHighlightPicker = _p[1];
    var _q = react_1.useState(false), showVariableDD = _q[0], setShowVariableDD = _q[1];
    var _r = react_1.useState(false), showHtmlSource = _r[0], setShowHtmlSource = _r[1];
    var _s = react_1.useState(""), htmlSource = _s[0], setHtmlSource = _s[1];
    var _t = react_1.useState(false), showBgColorPicker = _t[0], setShowBgColorPicker = _t[1];
    var _u = react_1.useState(false), showLineSpacing = _u[0], setShowLineSpacing = _u[1];
    var _v = react_1.useState(false), showImageDialog = _v[0], setShowImageDialog = _v[1];
    var _w = react_1.useState(""), imageUrl = _w[0], setImageUrl = _w[1];
    var _x = react_1.useState("#000000"), customTextColor = _x[0], setCustomTextColor = _x[1];
    var _y = react_1.useState("#fef08a"), customHighlightColor = _y[0], setCustomHighlightColor = _y[1];
    var _z = react_1.useState("#ffffff"), customBgColor = _z[0], setCustomBgColor = _z[1];
    var _0 = react_1.useState(false), showListStyleDD = _0[0], setShowListStyleDD = _0[1];
    var _1 = react_1.useState(false), showTextWrapDD = _1[0], setShowTextWrapDD = _1[1];
    var tableRef = react_1.useRef(null);
    var headingRef = react_1.useRef(null);
    var fontRef = react_1.useRef(null);
    var fontSizeRef = react_1.useRef(null);
    var colorRef = react_1.useRef(null);
    var highlightRef = react_1.useRef(null);
    var variableRef = react_1.useRef(null);
    var bgColorRef = react_1.useRef(null);
    var lineSpacingRef = react_1.useRef(null);
    var imageDialogRef = react_1.useRef(null);
    var fileInputRef = react_1.useRef(null);
    var listStyleRef = react_1.useRef(null);
    var textWrapRef = react_1.useRef(null);
    react_1.useEffect(function () {
        var h = function (e) {
            var t = e.target;
            if (tableRef.current && !tableRef.current.contains(t)) {
                setTablePickerOpen(false);
                setTableHover({ rows: 0, cols: 0 });
            }
            if (headingRef.current && !headingRef.current.contains(t))
                setShowHeadingDD(false);
            if (fontRef.current && !fontRef.current.contains(t))
                setShowFontDD(false);
            if (fontSizeRef.current && !fontSizeRef.current.contains(t))
                setShowFontSizeDD(false);
            if (colorRef.current && !colorRef.current.contains(t))
                setShowColorPicker(false);
            if (highlightRef.current && !highlightRef.current.contains(t))
                setShowHighlightPicker(false);
            if (variableRef.current && !variableRef.current.contains(t))
                setShowVariableDD(false);
            if (bgColorRef.current && !bgColorRef.current.contains(t))
                setShowBgColorPicker(false);
            if (lineSpacingRef.current && !lineSpacingRef.current.contains(t))
                setShowLineSpacing(false);
            if (imageDialogRef.current && !imageDialogRef.current.contains(t))
                setShowImageDialog(false);
            if (textWrapRef.current && !textWrapRef.current.contains(t))
                setShowTextWrapDD(false);
            if (listStyleRef.current && !listStyleRef.current.contains(t))
                setShowListStyleDD(false);
        };
        document.addEventListener("mousedown", h);
        return function () { return document.removeEventListener("mousedown", h); };
    }, []);
    var editor = react_2.useEditor({
        extensions: [
            starter_kit_1["default"],
            extension_placeholder_1["default"].configure({ placeholder: placeholder }),
            extension_underline_1["default"],
            extension_text_style_1.TextStyle,
            extension_color_1.Color,
            FontFamily,
            FontSize,
            HighlightMark.configure({ multicolor: true }),
            SubscriptMark,
            SuperscriptMark,
            BackgroundColor,
            LineSpacing,
            Indent,
            ListStyles,
            extension_text_align_1["default"].configure({ types: ["heading", "paragraph", "tableCell", "tableHeader"] }),
            extension_link_1["default"].configure({ openOnClick: false, HTMLAttributes: { "class": "text-primary underline" } }),
            ResizableImage.configure({ inline: false, allowBase64: true }),
            extension_table_1.Table.configure({ resizable: true, handleWidth: 5 }),
            extension_table_row_1.TableRow,
            CustomTableCell,
            CustomTableHeader,
        ],
        content: value || "",
        editable: !readOnly,
        onUpdate: function (_a) {
            var editor = _a.editor;
            return onChange(editor.getHTML());
        }
    });
    var setLink = react_1.useCallback(function () {
        if (!editor)
            return;
        var prev = editor.getAttributes("link").href;
        var url = window.prompt("URL", prev);
        if (url === null)
            return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);
    var addImage = react_1.useCallback(function () {
        setShowImageDialog(true);
        setImageUrl("");
    }, []);
    var insertImageFromUrl = react_1.useCallback(function () {
        if (!editor || !imageUrl.trim())
            return;
        editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
        setShowImageDialog(false);
        setImageUrl("");
    }, [editor, imageUrl]);
    var handleImageFileUpload = react_1.useCallback(function (e) {
        var _a;
        if (!editor)
            return;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (!file.type.startsWith("image/"))
            return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be under 5MB");
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var base64 = reader.result;
            editor.chain().focus().setImage({ src: base64 }).run();
            setShowImageDialog(false);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }, [editor]);
    var insertTextBox = react_1.useCallback(function () {
        if (!editor)
            return;
        editor.chain().focus().insertContent('<div style="border: 2px solid #d1d5db; border-radius: 8px; padding: 16px; margin: 8px 0; background-color: #f9fafb;"><p>Text box content</p></div>').run();
    }, [editor]);
    react_1.useEffect(function () {
        if (!editor)
            return;
        var isEmpty = function (html) { return !html || html === "<p></p>" || html.trim() === ""; };
        if (!editor.isFocused && value !== editor.getHTML()) {
            if (!(isEmpty(value) && isEmpty(editor.getHTML()))) {
                editor.commands.setContent(value || "");
            }
        }
    }, [value, editor]);
    var toggleHtmlSource = react_1.useCallback(function () {
        if (!editor)
            return;
        if (!showHtmlSource) {
            setHtmlSource(editor.getHTML());
        }
        else {
            editor.commands.setContent(htmlSource);
            onChange(htmlSource);
        }
        setShowHtmlSource(!showHtmlSource);
    }, [editor, showHtmlSource, htmlSource, onChange]);
    var insertVariable = react_1.useCallback(function (v) {
        if (!editor)
            return;
        editor.chain().focus().insertContent(v).run();
        onInsertVariable === null || onInsertVariable === void 0 ? void 0 : onInsertVariable(v);
        setShowVariableDD(false);
    }, [editor, onInsertVariable]);
    if (!editor)
        return null;
    var curHeading = function () { for (var i = 1; i <= 4; i++) {
        if (editor.isActive("heading", { level: i }))
            return "Heading " + i;
    } return "Normal"; };
    var curFont = function () { var _a; return ((_a = editor.getAttributes("textStyle")) === null || _a === void 0 ? void 0 : _a.fontFamily) || "Default"; };
    var curFontSize = function () { var _a, _b; var fs = (_a = editor.getAttributes("textStyle")) === null || _a === void 0 ? void 0 : _a.fontSize; if (!fs)
        return "Normal"; return ((_b = FONT_SIZES.find(function (s) { return s.value === fs; })) === null || _b === void 0 ? void 0 : _b.label) || fs; };
    var Separator = function () { return React.createElement("div", { className: "w-px h-6 bg-border mx-0.5 self-center" }); };
    var DDBtn = function (_a) {
        var refEl = _a.refEl, open = _a.open, toggle = _a.toggle, label = _a.label;
        return (React.createElement("div", { className: "relative", ref: refEl },
            React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap", open && "bg-accent text-accent-foreground"), onClick: toggle },
                label,
                React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" }))));
    };
    return (React.createElement("div", { className: utils_1.cn("border rounded-md bg-background", isFullscreen && "fixed inset-0 z-50 rounded-none border-0 flex flex-col overflow-auto", className) },
        !readOnly && !showHtmlSource && (React.createElement("div", { className: "flex flex-wrap gap-0.5 p-1 border-b bg-muted/30 items-center sticky top-0 z-20 backdrop-blur-sm rounded-t-md" },
            React.createElement("div", { className: "relative", ref: headingRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap", showHeadingDD && "bg-accent text-accent-foreground"), onClick: function () { return setShowHeadingDD(!showHeadingDD); } },
                    curHeading(),
                    React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
                showHeadingDD && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-36 max-h-64 overflow-y-auto" }, HEADING_LEVELS.map(function (h) { return (React.createElement("button", { key: h.level, type: "button", className: utils_1.cn("w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", (h.level === 0 ? !editor.isActive("heading") : editor.isActive("heading", { level: h.level })) && "bg-accent font-medium"), style: h.level > 0 ? { fontSize: 22 - h.level * 2 + "px", fontWeight: 600 } : undefined, onClick: function () { h.level === 0 ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: h.level }).run(); setShowHeadingDD(false); } }, h.label)); })))),
            enhanced && (React.createElement(React.Fragment, null,
                React.createElement(Separator, null),
                React.createElement("div", { className: "relative", ref: fontRef },
                    React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap", showFontDD && "bg-accent text-accent-foreground"), onClick: function () { return setShowFontDD(!showFontDD); } },
                        curFont(),
                        React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
                    showFontDD && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-48 max-h-64 overflow-y-auto" }, FONT_FAMILIES.map(function (f) { return (React.createElement("button", { key: f.value || "_", type: "button", className: utils_1.cn("w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", curFont() === (f.value || "Default") && "bg-accent font-medium"), style: f.value ? { fontFamily: f.value } : undefined, onClick: function () { f.value ? editor.chain().focus().setFontFamily(f.value).run() : editor.chain().focus().unsetFontFamily().run(); setShowFontDD(false); } }, f.label)); })))),
                React.createElement("div", { className: "relative", ref: fontSizeRef },
                    React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap", showFontSizeDD && "bg-accent text-accent-foreground"), onClick: function () { return setShowFontSizeDD(!showFontSizeDD); } },
                        curFontSize(),
                        React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
                    showFontSizeDD && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-32 max-h-64 overflow-y-auto" }, FONT_SIZES.map(function (s) { return (React.createElement("button", { key: s.value, type: "button", className: utils_1.cn("w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", curFontSize() === s.label && "bg-accent font-medium"), style: { fontSize: s.value }, onClick: function () { editor.chain().focus().setFontSize(s.value).run(); setShowFontSizeDD(false); } }, s.label)); })))))),
            React.createElement(Separator, null),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("bold"), onPressedChange: function () { return editor.chain().focus().toggleBold().run(); }, "aria-label": "Bold" },
                React.createElement(lucide_react_1.Bold, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("italic"), onPressedChange: function () { return editor.chain().focus().toggleItalic().run(); }, "aria-label": "Italic" },
                React.createElement(lucide_react_1.Italic, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("underline"), onPressedChange: function () { return editor.chain().focus().toggleUnderline().run(); }, "aria-label": "Underline" },
                React.createElement(lucide_react_1.Underline, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("strike"), onPressedChange: function () { return editor.chain().focus().toggleStrike().run(); }, "aria-label": "Strikethrough" },
                React.createElement(lucide_react_1.Strikethrough, { className: "h-4 w-4" })),
            enhanced && (React.createElement(React.Fragment, null,
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("subscript"), onPressedChange: function () { return editor.chain().focus().toggleSubscript().run(); }, "aria-label": "Subscript" },
                    React.createElement(lucide_react_1.Subscript, { className: "h-4 w-4" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("superscript"), onPressedChange: function () { return editor.chain().focus().toggleSuperscript().run(); }, "aria-label": "Superscript" },
                    React.createElement(lucide_react_1.Superscript, { className: "h-4 w-4" })))),
            React.createElement(Separator, null),
            React.createElement("div", { className: "relative", ref: colorRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", showColorPicker && "bg-accent"), onClick: function () { return setShowColorPicker(!showColorPicker); }, title: "Text color" },
                    React.createElement(lucide_react_1.Type, { className: "h-4 w-4" }),
                    React.createElement("div", { className: "absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full", style: { backgroundColor: ((_b = editor.getAttributes("textStyle")) === null || _b === void 0 ? void 0 : _b.color) || "#000" } })),
                showColorPicker && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 w-[200px]" },
                    React.createElement("div", { className: "text-xs font-medium mb-1.5 text-muted-foreground" }, "Text Color"),
                    React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1" }, TEXT_COLORS.map(function (c) { var _a; return React.createElement("button", { key: c, type: "button", className: utils_1.cn("w-7 h-7 rounded border hover:scale-110 transition-transform", ((_a = editor.getAttributes("textStyle")) === null || _a === void 0 ? void 0 : _a.color) === c && "ring-2 ring-primary ring-offset-1"), style: { backgroundColor: c }, onClick: function () { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); } }); })),
                    React.createElement("div", { className: "flex items-center gap-1.5 mt-2 pt-2 border-t" },
                        React.createElement(lucide_react_1.Pipette, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
                        React.createElement("input", { type: "color", value: customTextColor, onChange: function (e) { return setCustomTextColor(e.target.value); }, className: "w-7 h-7 rounded border cursor-pointer p-0" }),
                        React.createElement("input", { type: "text", value: customTextColor, onChange: function (e) { return setCustomTextColor(e.target.value); }, className: "flex-1 h-7 px-1.5 text-xs border rounded bg-background font-mono", placeholder: "#000000" }),
                        React.createElement("button", { type: "button", className: "h-7 px-2 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90", onClick: function () { editor.chain().focus().setColor(customTextColor).run(); setShowColorPicker(false); } }, "Apply")),
                    React.createElement("button", { type: "button", className: "w-full text-xs mt-1.5 px-2 py-1 rounded hover:bg-muted text-muted-foreground", onClick: function () { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); } }, "Remove color")))),
            React.createElement("div", { className: "relative", ref: highlightRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", (editor.isActive("highlight") || showHighlightPicker) && "bg-accent"), onClick: function () { return setShowHighlightPicker(!showHighlightPicker); }, title: "Highlight" },
                    React.createElement(lucide_react_1.Highlighter, { className: "h-4 w-4" })),
                showHighlightPicker && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 w-[200px]" },
                    React.createElement("div", { className: "text-xs font-medium mb-1.5 text-muted-foreground" }, "Highlight"),
                    React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1" }, HIGHLIGHT_COLORS.map(function (c) { return React.createElement("button", { key: c, type: "button", className: "w-7 h-7 rounded border hover:scale-110 transition-transform", style: { backgroundColor: c }, onClick: function () { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlightPicker(false); } }); })),
                    React.createElement("div", { className: "flex items-center gap-1.5 mt-2 pt-2 border-t" },
                        React.createElement("input", { type: "color", value: customHighlightColor, onChange: function (e) { return setCustomHighlightColor(e.target.value); }, className: "w-7 h-7 rounded border cursor-pointer p-0" }),
                        React.createElement("input", { type: "text", value: customHighlightColor, onChange: function (e) { return setCustomHighlightColor(e.target.value); }, className: "flex-1 h-7 px-1.5 text-xs border rounded bg-background font-mono", placeholder: "#fef08a" }),
                        React.createElement("button", { type: "button", className: "h-7 px-2 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90", onClick: function () { editor.chain().focus().toggleHighlight({ color: customHighlightColor }).run(); setShowHighlightPicker(false); } }, "Apply")),
                    React.createElement("button", { type: "button", className: "w-full text-xs mt-1.5 px-2 py-1 rounded hover:bg-muted text-muted-foreground", onClick: function () { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); } }, "Remove highlight")))),
            enhanced && (React.createElement("div", { className: "relative", ref: bgColorRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", showBgColorPicker && "bg-accent"), onClick: function () { return setShowBgColorPicker(!showBgColorPicker); }, title: "Background / Shading" },
                    React.createElement(lucide_react_1.PaintBucket, { className: "h-4 w-4" })),
                showBgColorPicker && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 w-[200px]" },
                    React.createElement("div", { className: "text-xs font-medium mb-1.5 text-muted-foreground" }, "Background / Shading"),
                    React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1" }, HIGHLIGHT_COLORS.map(function (c) { return React.createElement("button", { key: c, type: "button", className: "w-7 h-7 rounded border hover:scale-110 transition-transform", style: { backgroundColor: c }, onClick: function () { editor.chain().focus().setBackgroundColor(c).run(); setShowBgColorPicker(false); } }); })),
                    React.createElement("div", { className: "flex items-center gap-1.5 mt-2 pt-2 border-t" },
                        React.createElement("input", { type: "color", value: customBgColor, onChange: function (e) { return setCustomBgColor(e.target.value); }, className: "w-7 h-7 rounded border cursor-pointer p-0" }),
                        React.createElement("input", { type: "text", value: customBgColor, onChange: function (e) { return setCustomBgColor(e.target.value); }, className: "flex-1 h-7 px-1.5 text-xs border rounded bg-background font-mono", placeholder: "#ffffff" }),
                        React.createElement("button", { type: "button", className: "h-7 px-2 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90", onClick: function () { editor.chain().focus().setBackgroundColor(customBgColor).run(); setShowBgColorPicker(false); } }, "Apply")),
                    React.createElement("button", { type: "button", className: "w-full text-xs mt-1.5 px-2 py-1 rounded hover:bg-muted text-muted-foreground", onClick: function () { editor.chain().focus().unsetBackgroundColor().run(); setShowBgColorPicker(false); } }, "Remove shading"))))),
            React.createElement(Separator, null),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("link"), onPressedChange: setLink, "aria-label": "Link" },
                React.createElement(lucide_react_1.Link, { className: "h-4 w-4" })),
            React.createElement("div", { className: "relative", ref: imageDialogRef },
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: showImageDialog, onPressedChange: addImage, "aria-label": "Image" },
                    React.createElement(lucide_react_1.Image, { className: "h-4 w-4" })),
                showImageDialog && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-3 w-72" },
                    React.createElement("div", { className: "text-xs font-medium mb-2 text-muted-foreground" }, "Insert Image"),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs text-muted-foreground mb-1 block" }, "From URL"),
                            React.createElement("div", { className: "flex gap-1.5" },
                                React.createElement("input", { type: "text", value: imageUrl, onChange: function (e) { return setImageUrl(e.target.value); }, placeholder: "https://example.com/image.jpg", className: "flex-1 h-8 px-2 text-xs border rounded bg-background", onKeyDown: function (e) { if (e.key === "Enter")
                                        insertImageFromUrl(); } }),
                                React.createElement("button", { type: "button", className: "h-8 px-3 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90", onClick: insertImageFromUrl }, "Insert"))),
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "absolute inset-0 flex items-center" },
                                React.createElement("span", { className: "w-full border-t" })),
                            React.createElement("div", { className: "relative flex justify-center text-xs" },
                                React.createElement("span", { className: "bg-popover px-2 text-muted-foreground" }, "or"))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs text-muted-foreground mb-1 block" }, "Upload from device"),
                            React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageFileUpload, className: "hidden" }),
                            React.createElement("button", { type: "button", className: "w-full h-8 px-3 text-xs rounded border border-dashed hover:bg-muted flex items-center justify-center gap-1.5 text-muted-foreground", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                                React.createElement(lucide_react_1.Upload, { className: "h-3.5 w-3.5" }),
                                "Upload image (max 5MB)")))))),
            React.createElement(Separator, null),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive({ textAlign: "left" }), onPressedChange: function () { return editor.chain().focus().setTextAlign("left").run(); }, "aria-label": "Align left" },
                React.createElement(lucide_react_1.AlignLeft, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive({ textAlign: "center" }), onPressedChange: function () { return editor.chain().focus().setTextAlign("center").run(); }, "aria-label": "Align center" },
                React.createElement(lucide_react_1.AlignCenter, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive({ textAlign: "right" }), onPressedChange: function () { return editor.chain().focus().setTextAlign("right").run(); }, "aria-label": "Align right" },
                React.createElement(lucide_react_1.AlignRight, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive({ textAlign: "justify" }), onPressedChange: function () { return editor.chain().focus().setTextAlign("justify").run(); }, "aria-label": "Align justify" },
                React.createElement(lucide_react_1.AlignJustify, { className: "h-4 w-4" })),
            enhanced && (React.createElement(React.Fragment, null,
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().indent().run(); }, "aria-label": "Increase indent", title: "Increase indent" },
                    React.createElement(lucide_react_1.IndentIncrease, { className: "h-4 w-4" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().outdent().run(); }, "aria-label": "Decrease indent", title: "Decrease indent" },
                    React.createElement(lucide_react_1.IndentDecrease, { className: "h-4 w-4" })))),
            enhanced && (React.createElement("div", { className: "relative", ref: lineSpacingRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", showLineSpacing && "bg-accent"), onClick: function () { return setShowLineSpacing(!showLineSpacing); }, title: "Line spacing" },
                    React.createElement(lucide_react_1.LineChart, { className: "h-4 w-4" })),
                showLineSpacing && (React.createElement("div", { className: "absolute top-full right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-32" },
                    React.createElement("div", { className: "text-xs font-medium px-2 py-1 text-muted-foreground border-b mb-1" }, "Line Spacing"),
                    LINE_SPACING_OPTIONS.map(function (ls) { return (React.createElement("button", { key: ls.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", onClick: function () { editor.chain().focus().setLineSpacing(ls.value).run(); setShowLineSpacing(false); } }, ls.label)); }))))),
            enhanced && (React.createElement("div", { className: "relative", ref: textWrapRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", showTextWrapDD && "bg-accent"), onClick: function () { return setShowTextWrapDD(!showTextWrapDD); }, title: "Text wrapping" },
                    React.createElement(lucide_react_1.WrapText, { className: "h-4 w-4" })),
                showTextWrapDD && (React.createElement("div", { className: "absolute top-full right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-44" },
                    React.createElement("div", { className: "text-xs font-medium px-2 py-1 text-muted-foreground border-b mb-1" }, "Text Wrapping"),
                    [
                        { label: "Normal", value: "normal" },
                        { label: "No Wrap", value: "nowrap" },
                        { label: "Pre (preserve)", value: "pre" },
                        { label: "Pre Wrap", value: "pre-wrap" },
                        { label: "Break Word", value: "break-word" },
                    ].map(function (opt) { return (React.createElement("button", { key: opt.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", onClick: function () {
                            if (opt.value === "break-word") {
                                editor.chain().focus().insertContent("<span style=\"word-break: break-all; overflow-wrap: break-word;\">\u200B</span>").run();
                            }
                            else {
                                editor.chain().focus().insertContent("<div style=\"white-space: " + opt.value + ";\">\u200B</div>").run();
                            }
                            setShowTextWrapDD(false);
                        } }, opt.label)); }))))),
            React.createElement(Separator, null),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().setHorizontalRule().run(); }, "aria-label": "Horizontal rule" },
                React.createElement(lucide_react_1.Minus, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("bulletList"), onPressedChange: function () { return editor.chain().focus().toggleBulletList().run(); }, "aria-label": "Bullet list" },
                React.createElement(lucide_react_1.List, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("orderedList"), onPressedChange: function () { return editor.chain().focus().toggleOrderedList().run(); }, "aria-label": "Ordered list" },
                React.createElement(lucide_react_1.ListOrdered, { className: "h-4 w-4" })),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: editor.isActive("blockquote"), onPressedChange: function () { return editor.chain().focus().toggleBlockquote().run(); }, "aria-label": "Blockquote" },
                React.createElement(lucide_react_1.Quote, { className: "h-4 w-4" })),
            (editor.isActive("bulletList") || editor.isActive("orderedList")) && (React.createElement("div", { className: "relative", ref: listStyleRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted whitespace-nowrap", showListStyleDD && "bg-accent text-accent-foreground"), onClick: function () { return setShowListStyleDD(!showListStyleDD); }, title: "List style" },
                    "Style",
                    React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
                showListStyleDD && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 w-36 max-h-64 overflow-y-auto" },
                    React.createElement("div", { className: "text-xs font-medium px-2 py-1 text-muted-foreground border-b mb-1" }, editor.isActive("bulletList") ? "Bullet Style" : "Number Style"),
                    (editor.isActive("bulletList") ? BULLET_LIST_STYLES : ORDERED_LIST_STYLES).map(function (s) { return (React.createElement("button", { key: s.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted", onClick: function () { editor.chain().focus().setListStyleType(s.value).run(); setShowListStyleDD(false); } }, s.label)); }))))),
            enhanced && (React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: insertTextBox, "aria-label": "Text box", title: "Insert text box" },
                React.createElement(lucide_react_1.Square, { className: "h-4 w-4" }))),
            React.createElement(Separator, null),
            React.createElement("div", { className: "relative", ref: tableRef },
                React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted", (editor.isActive("table") || tablePickerOpen) && "bg-accent"), onClick: function () { return setTablePickerOpen(!tablePickerOpen); }, "aria-label": "Insert table" },
                    React.createElement(lucide_react_1.Table, { className: "h-4 w-4" })),
                tablePickerOpen && (React.createElement("div", { className: "absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-3" },
                    React.createElement("div", { className: "text-xs font-medium mb-2 text-muted-foreground" }, tableHover.rows > 0 ? tableHover.rows + " \u00D7 " + tableHover.cols + " Table" : "Select table size"),
                    React.createElement("div", { className: "grid gap-0.5", style: { gridTemplateColumns: "repeat(8, 1fr)" } }, Array.from({ length: 8 }, function (_, row) { return Array.from({ length: 8 }, function (_, col) { return (React.createElement("button", { key: row + "-" + col, type: "button", title: row + 1 + " \u00D7 " + (col + 1), className: utils_1.cn("w-4 h-4 border rounded-[2px] transition-colors", row < tableHover.rows && col < tableHover.cols ? "bg-primary border-primary" : "bg-muted/40 border-border hover:border-primary/50"), onMouseEnter: function () { return setTableHover({ rows: row + 1, cols: col + 1 }); }, onMouseLeave: function () { return setTableHover({ rows: 0, cols: 0 }); }, onClick: function () { editor.chain().focus().insertTable({ rows: row + 1, cols: col + 1, withHeaderRow: true }).run(); setTablePickerOpen(false); setTableHover({ rows: 0, cols: 0 }); } })); }); }))))),
            editor.isActive("table") && (React.createElement(React.Fragment, null,
                React.createElement(Separator, null),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().addRowBefore().run(); }, "aria-label": "Add row above", title: "Add row above" },
                    React.createElement(lucide_react_1.Rows3, { className: "h-4 w-4" }),
                    React.createElement(lucide_react_1.Plus, { className: "h-2.5 w-2.5 -ml-1 -mt-2" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().addRowAfter().run(); }, "aria-label": "Add row below", title: "Add row below" },
                    React.createElement(lucide_react_1.Rows3, { className: "h-4 w-4" }),
                    React.createElement(lucide_react_1.Plus, { className: "h-2.5 w-2.5 -ml-1 mt-2" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().deleteRow().run(); }, "aria-label": "Delete row", title: "Delete row" },
                    React.createElement(lucide_react_1.Rows3, { className: "h-4 w-4 text-destructive" }),
                    React.createElement(lucide_react_1.Minus, { className: "h-2.5 w-2.5 -ml-1 text-destructive" })),
                React.createElement(Separator, null),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().addColumnBefore().run(); }, "aria-label": "Add column before", title: "Add column before" },
                    React.createElement(lucide_react_1.Columns3, { className: "h-4 w-4" }),
                    React.createElement(lucide_react_1.Plus, { className: "h-2.5 w-2.5 -ml-1 -mt-2" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().addColumnAfter().run(); }, "aria-label": "Add column after", title: "Add column after" },
                    React.createElement(lucide_react_1.Columns3, { className: "h-4 w-4" }),
                    React.createElement(lucide_react_1.Plus, { className: "h-2.5 w-2.5 -ml-1 mt-2" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().deleteColumn().run(); }, "aria-label": "Delete column", title: "Delete column" },
                    React.createElement(lucide_react_1.Columns3, { className: "h-4 w-4 text-destructive" }),
                    React.createElement(lucide_react_1.Minus, { className: "h-2.5 w-2.5 -ml-1 text-destructive" })),
                React.createElement(Separator, null),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().mergeCells().run(); }, "aria-label": "Merge cells", title: "Merge cells" },
                    React.createElement(lucide_react_1.MergeIcon, { className: "h-4 w-4" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().splitCell().run(); }, "aria-label": "Split cell", title: "Split cell" },
                    React.createElement(lucide_react_1.SplitIcon, { className: "h-4 w-4" })),
                React.createElement(Separator, null),
                React.createElement("span", { className: "text-[10px] text-muted-foreground px-0.5" }, "Cell:"),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().setCellAttribute('textAlign', 'left').run(); }, "aria-label": "Cell align left", title: "Cell align left" },
                    React.createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().setCellAttribute('textAlign', 'center').run(); }, "aria-label": "Cell align center", title: "Cell align center" },
                    React.createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().setCellAttribute('textAlign', 'right').run(); }, "aria-label": "Cell align right", title: "Cell align right" },
                    React.createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" })),
                React.createElement(Separator, null),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().deleteTable().run(); }, "aria-label": "Delete table", title: "Delete table" },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" })))),
            editor.isActive("image") && (React.createElement(React.Fragment, null,
                React.createElement(Separator, null),
                React.createElement("span", { className: "text-[10px] text-muted-foreground px-0.5" }, "Align:"),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().updateAttributes('image', { alignment: 'left' }).run(); }, title: "Image left" },
                    React.createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().updateAttributes('image', { alignment: 'center' }).run(); }, title: "Image center" },
                    React.createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" })),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().updateAttributes('image', { alignment: 'right' }).run(); }, title: "Image right" },
                    React.createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" })),
                React.createElement(Separator, null),
                React.createElement("span", { className: "text-[10px] text-muted-foreground px-0.5" }, "Size:"),
                ["25%", "50%", "75%", "100%"].map(function (w) { return (React.createElement("button", { key: w, type: "button", className: "h-7 px-1.5 text-[10px] rounded hover:bg-muted border", onClick: function () { return editor.chain().focus().updateAttributes('image', { width: w }).run(); }, title: "Set width " + w }, w)); }),
                React.createElement("button", { type: "button", className: "h-7 px-1.5 text-[10px] rounded hover:bg-muted border", onClick: function () { return editor.chain().focus().updateAttributes('image', { width: null }).run(); }, title: "Auto size" }, "Auto"),
                React.createElement(Separator, null),
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: false, onPressedChange: function () { return editor.chain().focus().deleteSelection().run(); }, "aria-label": "Delete image", title: "Delete image" },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" })))),
            React.createElement(Separator, null),
            React.createElement(toggle_1.Toggle, { size: "sm", pressed: showHtmlSource, onPressedChange: toggleHtmlSource, "aria-label": "HTML source" },
                React.createElement(lucide_react_1.Code, { className: "h-4 w-4" })),
            variables && variables.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement(Separator, null),
                React.createElement("div", { className: "relative", ref: variableRef },
                    React.createElement("button", { type: "button", className: utils_1.cn("inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium transition-colors hover:bg-muted border border-dashed", showVariableDD && "bg-accent"), onClick: function () { return setShowVariableDD(!showVariableDD); }, title: "Insert variable" },
                        React.createElement(lucide_react_1.Palette, { className: "h-3.5 w-3.5" }),
                        "Variables",
                        React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
                    showVariableDD && (React.createElement("div", { className: "absolute top-full right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-1 max-h-64 overflow-y-auto w-56" },
                        React.createElement("div", { className: "text-xs font-medium px-2 py-1 text-muted-foreground border-b mb-1" }, "Click to insert"),
                        variables.map(function (v) { return (React.createElement("button", { key: v.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center justify-between", onClick: function () { return insertVariable(v.value); } },
                            React.createElement("span", { className: "truncate" }, v.label),
                            React.createElement("code", { className: "text-[10px] text-muted-foreground ml-1 shrink-0" }, v.value))); })))))),
            React.createElement("div", { className: "ml-auto" },
                React.createElement(toggle_1.Toggle, { size: "sm", pressed: isFullscreen, onPressedChange: function () { return setIsFullscreen(!isFullscreen); }, "aria-label": "Fullscreen" },
                    React.createElement(lucide_react_1.Maximize, { className: "h-4 w-4" }))))),
        React.createElement("style", null, "\n        .rich-text-editor-content table { border-collapse: collapse; width: 100%; margin: 8px 0; }\n        .rich-text-editor-content table td, .rich-text-editor-content table th { border: 1px solid #d1d5db; padding: 6px 10px; min-width: 60px; vertical-align: top; }\n        .rich-text-editor-content table th { background-color: #f3f4f6; font-weight: 600; }\n        .rich-text-editor-content table .selectedCell { background-color: #dbeafe; }\n        .rich-text-editor-content .column-resize-handle { background-color: #3b82f6; width: 2px; position: absolute; right: -1px; top: 0; bottom: 0; pointer-events: none; }\n        .rich-text-editor-content .tableWrapper { overflow-x: auto; }\n        .rich-text-editor-content blockquote { border-left: 3px solid #d1d5db; padding-left: 12px; margin-left: 0; color: #6b7280; font-style: italic; }\n        .rich-text-editor-content mark { border-radius: 2px; padding: 1px 2px; }\n        .rich-text-editor-content h1 { font-size: 2em; font-weight: 700; }\n        .rich-text-editor-content h2 { font-size: 1.5em; font-weight: 600; }\n        .rich-text-editor-content h3 { font-size: 1.17em; font-weight: 600; }\n        .rich-text-editor-content h4 { font-size: 1em; font-weight: 600; }\n        .rich-text-editor-content img { max-width: 100%; height: auto; border-radius: 4px; cursor: pointer; transition: width 0.2s ease; }\n        .rich-text-editor-content img.ProseMirror-selectednode { outline: 2px solid #3b82f6; border-radius: 4px; }\n        .rich-text-editor-content img[data-align=\"left\"] { float: left; margin-right: 12px; margin-bottom: 8px; }\n        .rich-text-editor-content img[data-align=\"center\"] { display: block; margin-left: auto; margin-right: auto; float: none; }\n        .rich-text-editor-content img[data-align=\"right\"] { float: right; margin-left: 12px; margin-bottom: 8px; }\n        .rich-text-editor-content .column-resize-handle { background-color: #3b82f6; width: 4px; position: absolute; right: -2px; top: 0; bottom: 0; pointer-events: none; cursor: col-resize; }\n        .rich-text-editor-content .resize-cursor { cursor: col-resize; }\n        .rich-text-editor-content ul[style*=\"list-style-type\"] { padding-left: 20px; }\n        .rich-text-editor-content ol[style*=\"list-style-type\"] { padding-left: 20px; }\n        .rich-text-editor-content p[style*=\"margin-left\"] { transition: margin-left 0.15s ease; }\n      "),
        showHtmlSource ? (React.createElement("textarea", { className: "w-full p-3 font-mono text-sm bg-muted/20 resize-none focus:outline-none", style: { minHeight: isFullscreen ? "calc(100vh - 50px)" : minHeight }, value: htmlSource, onChange: function (e) { return setHtmlSource(e.target.value); } })) : (React.createElement(react_2.EditorContent, { editor: editor, style: { minHeight: isFullscreen ? "calc(100vh - 50px)" : minHeight }, className: "rich-text-editor-content" }))));
}
exports.RichTextEditor = RichTextEditor;
/** Renders stored HTML as read-only rich text */
function RichTextDisplay(_a) {
    var html = _a.html, className = _a.className;
    if (!html || html === "<p></p>")
        return null;
    return (React.createElement("div", { className: utils_1.cn("prose prose-sm max-w-none text-foreground", "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1", "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5", "[&_li]:my-0.5 [&_p]:my-1", "[&_table]:border-collapse [&_table]:w-full [&_table]:my-2", "[&_td]:border [&_td]:border-gray-300 [&_td]:px-2.5 [&_td]:py-1.5", "[&_th]:border [&_th]:border-gray-300 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:bg-gray-100 [&_th]:font-semibold", className), dangerouslySetInnerHTML: { __html: html } }));
}
exports.RichTextDisplay = RichTextDisplay;
