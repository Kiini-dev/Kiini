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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EmailBlockEditor = void 0;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("./RichTextEditor");
var lucide_react_1 = require("lucide-react");
// ─── Block Definitions ───────────────────────────────────────────────────────
var BLOCK_TYPES = [
    { type: "text", label: "Text", icon: react_1["default"].createElement(lucide_react_1.Type, { className: "h-5 w-5" }), description: "Rich text paragraph" },
    { type: "image", label: "Image", icon: react_1["default"].createElement(lucide_react_1.Image, { className: "h-5 w-5" }), description: "Upload or link an image" },
    { type: "button", label: "Button", icon: react_1["default"].createElement(lucide_react_1.Square, { className: "h-5 w-5" }), description: "Call-to-action button" },
    { type: "divider", label: "Divider", icon: react_1["default"].createElement(lucide_react_1.Minus, { className: "h-5 w-5" }), description: "Horizontal line separator" },
    { type: "spacer", label: "Spacer", icon: react_1["default"].createElement(lucide_react_1.ArrowUpDown, { className: "h-5 w-5" }), description: "Empty vertical space" },
    { type: "columns", label: "Columns", icon: react_1["default"].createElement(lucide_react_1.Columns, { className: "h-5 w-5" }), description: "Multi-column layout" },
    { type: "social", label: "Social", icon: react_1["default"].createElement(lucide_react_1.Share2, { className: "h-5 w-5" }), description: "Social media links" },
    { type: "video", label: "Video", icon: react_1["default"].createElement(lucide_react_1.Video, { className: "h-5 w-5" }), description: "Embedded video" },
    { type: "html", label: "HTML", icon: react_1["default"].createElement(lucide_react_1.Code, { className: "h-5 w-5" }), description: "Custom HTML code" },
    { type: "header", label: "Header", icon: react_1["default"].createElement(lucide_react_1.Mail, { className: "h-5 w-5" }), description: "Email header / banner" },
    { type: "footer", label: "Footer", icon: react_1["default"].createElement(lucide_react_1.MapPin, { className: "h-5 w-5" }), description: "Footer with address / links" },
];
// ─── Block Rendering ─────────────────────────────────────────────────────────
function createBlockId() {
    return "block-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}
function getDefaultBlock(type) {
    var id = createBlockId();
    switch (type) {
        case "text":
            return { id: id, type: type, content: "<p>Enter your text here...</p>", props: { align: "left", color: "#333333", fontSize: "14px" } };
        case "image":
            return { id: id, type: type, content: "", props: { src: "", alt: "Image", width: "100%", align: "center", link: "" } };
        case "button":
            return { id: id, type: type, content: "Click Here", props: { url: "#", bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: "6px", align: "center", width: "auto", fontSize: "16px", padding: "12px 24px" } };
        case "divider":
            return { id: id, type: type, content: "", props: { color: "#e2e8f0", thickness: "1px", width: "100%", style: "solid" } };
        case "spacer":
            return { id: id, type: type, content: "", props: { height: "20px" } };
        case "columns":
            return { id: id, type: type, content: "", props: { columns: 2, gap: "16px", content1: "<p>Column 1</p>", content2: "<p>Column 2</p>", content3: "" } };
        case "social":
            return { id: id, type: type, content: "", props: { icons: ["facebook", "twitter", "linkedin", "instagram"], align: "center", iconSize: "32px", gap: "12px" } };
        case "video":
            return { id: id, type: type, content: "", props: { url: "", thumbnail: "", width: "100%" } };
        case "html":
            return { id: id, type: type, content: "<div><!-- Custom HTML --></div>", props: {} };
        case "header":
            return { id: id, type: type, content: "", props: { logo: "", title: "Company Name", bgColor: "#1e293b", textColor: "#ffffff", padding: "24px" } };
        case "footer":
            return { id: id, type: type, content: "<p style='color:#888;font-size:12px;text-align:center'>© 2026 Company Name. All rights reserved.<br>123 Street Address, City, Country</p>", props: { bgColor: "#f8fafc" } };
        default:
            return { id: id, type: type, content: "", props: {} };
    }
}
// ─── HTML Serializer ─────────────────────────────────────────────────────────
function blocksToHtml(blocks, globalStyles) {
    var _a = globalStyles.bgColor, bgColor = _a === void 0 ? "#e1ecf7" : _a, _b = globalStyles.contentWidth, contentWidth = _b === void 0 ? "600" : _b, _c = globalStyles.fontFamily, fontFamily = _c === void 0 ? "Arial, sans-serif" : _c;
    var inner = blocks.map(function (b) {
        switch (b.type) {
            case "text":
                return "<div style=\"padding:8px 0;text-align:" + (b.props.align || "left") + ";color:" + (b.props.color || "#333") + ";font-size:" + (b.props.fontSize || "14px") + "\">" + b.content + "</div>";
            case "image":
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:8px 0\">" + (b.props.src ? "<img src=\"" + b.props.src + "\" alt=\"" + (b.props.alt || "") + "\" style=\"max-width:" + (b.props.width || "100%") + ";height:auto;display:inline-block\" />" : '<div style="background:#f1f5f9;padding:40px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px">Drop image here or enter URL</div>') + "</div>";
            case "button":
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:16px 0\"><a href=\"" + (b.props.url || "#") + "\" style=\"display:inline-block;background:" + b.props.bgColor + ";color:" + b.props.textColor + ";padding:" + b.props.padding + ";border-radius:" + b.props.borderRadius + ";text-decoration:none;font-weight:600;font-size:" + b.props.fontSize + "\">" + b.content + "</a></div>";
            case "divider":
                return "<hr style=\"border:none;border-top:" + b.props.thickness + " " + (b.props.style || "solid") + " " + b.props.color + ";margin:16px auto;width:" + b.props.width + "\" />";
            case "spacer":
                return "<div style=\"height:" + b.props.height + "\"></div>";
            case "columns": {
                var cols = b.props.columns || 2;
                var width = Math.floor(100 / cols) + "%";
                var cells = "";
                for (var i = 1; i <= cols; i++) {
                    cells += "<td style=\"width:" + width + ";vertical-align:top;padding:0 " + parseInt(b.props.gap || "16") / 2 + "px\">" + (b.props["content" + i] || "") + "</td>";
                }
                return "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"table-layout:fixed\"><tr>" + cells + "</tr></table>";
            }
            case "social": {
                var icons = (b.props.icons || []).map(function (name) {
                    return "<a href=\"#\" style=\"display:inline-block;margin:0 " + parseInt(b.props.gap || "12") / 2 + "px;text-decoration:none;color:#3b82f6;font-size:" + (b.props.iconSize || "14px") + "\">" + (name.charAt(0).toUpperCase() + name.slice(1)) + "</a>";
                }).join("");
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:16px 0\">" + icons + "</div>";
            }
            case "video":
                return "<div style=\"text-align:center;padding:8px 0\">" + (b.props.url ? "<a href=\"" + b.props.url + "\"><img src=\"" + (b.props.thumbnail || "") + "\" alt=\"Video\" style=\"max-width:" + b.props.width + ";height:auto\" /></a>" : '<div style="background:#f1f5f9;padding:40px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px">Enter video URL</div>') + "</div>";
            case "html":
                return b.content;
            case "header":
                return "<div style=\"background:" + b.props.bgColor + ";color:" + b.props.textColor + ";padding:" + b.props.padding + ";text-align:center\">" + (b.props.logo ? "<img src=\"" + b.props.logo + "\" alt=\"Logo\" style=\"max-height:48px;margin-bottom:8px\" /><br/>" : "") + (b.props.title ? "<h1 style=\"margin:0;font-size:24px;font-weight:700\">" + b.props.title + "</h1>" : "") + "</div>";
            case "footer":
                return "<div style=\"background:" + (b.props.bgColor || "#f8fafc") + ";padding:24px\">" + b.content + "</div>";
            default:
                return "";
        }
    }).join("\n");
    return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"></head><body style=\"margin:0;padding:0;background:" + bgColor + ";font-family:" + fontFamily + "\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:" + bgColor + "\"><tr><td align=\"center\"><table width=\"" + contentWidth + "\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;max-width:" + contentWidth + "px;width:100%\"><tr><td style=\"padding:0\">" + inner + "</td></tr></table></td></tr></table></body></html>";
}
function htmlToBlocks(html) {
    // Simple parser: if it looks like our block HTML, extract blocks; otherwise, wrap as single text block
    if (!html || html.trim().length === 0)
        return { blocks: [], globalStyles: {} };
    // If it doesn't look like structured block HTML, wrap the whole thing as a text block
    return { blocks: [{ id: createBlockId(), type: "text", content: html, props: { align: "left", color: "#333333", fontSize: "14px" } }], globalStyles: {} };
}
// ─── Block Property Editors ──────────────────────────────────────────────────
function TextBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Text Alignment" },
            react_1["default"].createElement("div", { className: "flex gap-1" }, ["left", "center", "right"].map(function (a) { return (react_1["default"].createElement(button_1.Button, { key: a, size: "sm", variant: block.props.align === a ? "default" : "outline", className: "flex-1 h-8", onClick: function () { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { align: a }) })); } }, a === "left" ? react_1["default"].createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" }) : a === "center" ? react_1["default"].createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" }) : react_1["default"].createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" }))); }))),
        react_1["default"].createElement(PropField, { label: "Font Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.fontSize || "14px", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { fontSize: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Text Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.color || "#333333", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { color: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.color || "#333333", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { color: e.target.value }) })); }, className: "flex-1 h-8 text-xs" })))));
}
function ImageBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Image URL" },
            react_1["default"].createElement(input_1.Input, { value: block.props.src || "", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { src: e.target.value }) })); }, placeholder: "https://...", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Alt Text" },
            react_1["default"].createElement(input_1.Input, { value: block.props.alt || "", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { alt: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Width" },
            react_1["default"].createElement(input_1.Input, { value: block.props.width || "100%", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { width: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Link URL" },
            react_1["default"].createElement(input_1.Input, { value: block.props.link || "", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { link: e.target.value }) })); }, placeholder: "Optional link", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Alignment" },
            react_1["default"].createElement("div", { className: "flex gap-1" }, ["left", "center", "right"].map(function (a) { return (react_1["default"].createElement(button_1.Button, { key: a, size: "sm", variant: block.props.align === a ? "default" : "outline", className: "flex-1 h-8", onClick: function () { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { align: a }) })); } }, a === "left" ? react_1["default"].createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" }) : a === "center" ? react_1["default"].createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" }) : react_1["default"].createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" }))); })))));
}
function ButtonBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Button Text" },
            react_1["default"].createElement(input_1.Input, { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Link URL" },
            react_1["default"].createElement(input_1.Input, { value: block.props.url || "#", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { url: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Background Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.bgColor || "#3b82f6", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { bgColor: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.bgColor || "#3b82f6", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { bgColor: e.target.value }) })); }, className: "flex-1 h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Text Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.textColor || "#ffffff", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { textColor: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.textColor || "#ffffff", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { textColor: e.target.value }) })); }, className: "flex-1 h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderRadius || "6px", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { borderRadius: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Alignment" },
            react_1["default"].createElement("div", { className: "flex gap-1" }, ["left", "center", "right"].map(function (a) { return (react_1["default"].createElement(button_1.Button, { key: a, size: "sm", variant: block.props.align === a ? "default" : "outline", className: "flex-1 h-8", onClick: function () { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { align: a }) })); } }, a === "left" ? react_1["default"].createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" }) : a === "center" ? react_1["default"].createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" }) : react_1["default"].createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" }))); })))));
}
function DividerBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.color || "#e2e8f0", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { color: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.color || "#e2e8f0", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { color: e.target.value }) })); }, className: "flex-1 h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Thickness" },
            react_1["default"].createElement(input_1.Input, { value: block.props.thickness || "1px", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { thickness: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Style" },
            react_1["default"].createElement("select", { value: block.props.style || "solid", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { style: e.target.value }) })); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "solid" }, "Solid"),
                react_1["default"].createElement("option", { value: "dashed" }, "Dashed"),
                react_1["default"].createElement("option", { value: "dotted" }, "Dotted")))));
}
function SpacerBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement(PropField, { label: "Height" },
        react_1["default"].createElement(input_1.Input, { value: block.props.height || "20px", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { height: e.target.value }) })); }, className: "h-8 text-xs" })));
}
function HeaderBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Title" },
            react_1["default"].createElement(input_1.Input, { value: block.props.title || "", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { title: e.target.value }) })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Logo URL" },
            react_1["default"].createElement(input_1.Input, { value: block.props.logo || "", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { logo: e.target.value }) })); }, placeholder: "https://...", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Background Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.bgColor || "#1e293b", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { bgColor: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.bgColor || "#1e293b", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { bgColor: e.target.value }) })); }, className: "flex-1 h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Text Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: block.props.textColor || "#ffffff", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { textColor: e.target.value }) })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: block.props.textColor || "#ffffff", onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { textColor: e.target.value }) })); }, className: "flex-1 h-8 text-xs" })))));
}
function HtmlBlockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement(PropField, { label: "HTML Code" },
        react_1["default"].createElement("textarea", { className: "w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono bg-muted/30", value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); } })));
}
function PropField(_a) {
    var label = _a.label, children = _a.children;
    return (react_1["default"].createElement("div", { className: "space-y-1" },
        react_1["default"].createElement("label", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider" }, label),
        children));
}
// ─── Block Canvas Renderer ───────────────────────────────────────────────────
function BlockRenderer(_a) {
    var block = _a.block, selected = _a.selected, onSelect = _a.onSelect, onUpdate = _a.onUpdate, onDelete = _a.onDelete, onDuplicate = _a.onDuplicate, onMoveUp = _a.onMoveUp, onMoveDown = _a.onMoveDown, isFirst = _a.isFirst, isLast = _a.isLast;
    var renderContent = function () {
        switch (block.type) {
            case "text":
                return (react_1["default"].createElement("div", { contentEditable: true, suppressContentEditableWarning: true, className: "outline-none min-h-[24px] px-2 py-1", style: { textAlign: block.props.align || "left", color: block.props.color, fontSize: block.props.fontSize }, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } }));
            case "image":
                return (react_1["default"].createElement("div", { style: { textAlign: block.props.align || "center" }, className: "py-2" }, block.props.src ? (react_1["default"].createElement("img", { src: block.props.src, alt: block.props.alt, style: { maxWidth: block.props.width || "100%", height: "auto", display: "inline-block" } })) : (react_1["default"].createElement("div", { className: "bg-muted/50 p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg" },
                    react_1["default"].createElement(lucide_react_1.Image, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                    react_1["default"].createElement("p", { className: "text-xs" }, "Click to add image URL in properties")))));
            case "button":
                return (react_1["default"].createElement("div", { style: { textAlign: block.props.align || "center" }, className: "py-3" },
                    react_1["default"].createElement("span", { style: {
                            display: "inline-block",
                            background: block.props.bgColor,
                            color: block.props.textColor,
                            padding: block.props.padding,
                            borderRadius: block.props.borderRadius,
                            fontWeight: 600,
                            fontSize: block.props.fontSize,
                            cursor: "default"
                        } }, block.content)));
            case "divider":
                return (react_1["default"].createElement("div", { className: "py-2" },
                    react_1["default"].createElement("hr", { style: { border: "none", borderTop: block.props.thickness + " " + (block.props.style || "solid") + " " + block.props.color, width: block.props.width } })));
            case "spacer":
                return react_1["default"].createElement("div", { style: { height: block.props.height }, className: "bg-muted/20 rounded border border-dashed border-muted-foreground/20 flex items-center justify-center text-[10px] text-muted-foreground" },
                    "Spacer: ",
                    block.props.height);
            case "columns":
                return (react_1["default"].createElement("div", { className: "flex gap-2 py-2", style: { gap: block.props.gap } }, Array.from({ length: block.props.columns || 2 }, function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex-1 border border-dashed border-muted-foreground/30 rounded p-2 min-h-[60px]", contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.props["content" + (i + 1)] || "<p>Column " + (i + 1) + "</p>" }, onBlur: function (e) {
                        var _a;
                        return onUpdate(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a["content" + (i + 1)] = e.currentTarget.innerHTML, _a)) }));
                    } })); })));
            case "social":
                return (react_1["default"].createElement("div", { style: { textAlign: block.props.align || "center" }, className: "py-3 flex items-center justify-center gap-3" }, (block.props.icons || []).map(function (name, i) { return (react_1["default"].createElement("span", { key: i, className: "inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase" }, name.charAt(0))); })));
            case "video":
                return (react_1["default"].createElement("div", { className: "py-2 text-center" }, block.props.url ? (react_1["default"].createElement("div", { className: "bg-muted/50 p-6 rounded inline-block" },
                    react_1["default"].createElement(lucide_react_1.Video, { className: "h-10 w-10 mx-auto mb-2 text-muted-foreground" }),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, block.props.url))) : (react_1["default"].createElement("div", { className: "bg-muted/50 p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg" },
                    react_1["default"].createElement(lucide_react_1.Video, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                    react_1["default"].createElement("p", { className: "text-xs" }, "Enter video URL in properties")))));
            case "html":
                return react_1["default"].createElement("div", { className: "py-2 px-2 bg-muted/20 rounded font-mono text-xs overflow-auto max-h-[120px] border border-dashed", dangerouslySetInnerHTML: { __html: block.content } });
            case "header":
                return (react_1["default"].createElement("div", { style: { background: block.props.bgColor, color: block.props.textColor, padding: block.props.padding }, className: "text-center rounded-t" },
                    block.props.logo && react_1["default"].createElement("img", { src: block.props.logo, alt: "Logo", className: "max-h-12 mx-auto mb-2" }),
                    block.props.title && react_1["default"].createElement("h2", { className: "text-xl font-bold m-0" }, block.props.title)));
            case "footer":
                return (react_1["default"].createElement("div", { style: { background: block.props.bgColor || "#f8fafc" }, className: "py-4 px-4 rounded-b", contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } }));
            default:
                return null;
        }
    };
    return (react_1["default"].createElement("div", { onClick: function (e) { e.stopPropagation(); onSelect(); }, className: utils_1.cn("group relative border rounded-lg transition-all cursor-pointer", selected ? "border-primary ring-2 ring-primary/20 shadow-sm" : "border-transparent hover:border-muted-foreground/30") },
        selected && (react_1["default"].createElement("div", { className: "absolute -top-3 right-2 flex items-center gap-0.5 bg-background border rounded-md shadow-sm px-1 py-0.5 z-10" },
            react_1["default"].createElement("button", { onClick: function (e) { e.stopPropagation(); onMoveUp(); }, disabled: isFirst, className: "p-1 hover:bg-muted rounded disabled:opacity-30", title: "Move up" },
                react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-3 w-3" })),
            react_1["default"].createElement("button", { onClick: function (e) { e.stopPropagation(); onMoveDown(); }, disabled: isLast, className: "p-1 hover:bg-muted rounded disabled:opacity-30", title: "Move down" },
                react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3" })),
            react_1["default"].createElement("button", { onClick: function (e) { e.stopPropagation(); onDuplicate(); }, className: "p-1 hover:bg-muted rounded", title: "Duplicate" },
                react_1["default"].createElement(lucide_react_1.Copy, { className: "h-3 w-3" })),
            react_1["default"].createElement("button", { onClick: function (e) { e.stopPropagation(); onDelete(); }, className: "p-1 hover:bg-destructive/10 hover:text-destructive rounded", title: "Delete" },
                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))),
        react_1["default"].createElement("div", { className: utils_1.cn("absolute -left-1 top-1/2 -translate-y-1/2 transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-60") },
            react_1["default"].createElement("div", { className: "bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-r-md uppercase tracking-wider" }, block.type)),
        react_1["default"].createElement("div", { className: "px-2 py-1" }, renderContent())));
}
// ─── Global Styles Panel ─────────────────────────────────────────────────────
function GlobalStylesPanel(_a) {
    var styles = _a.styles, onChange = _a.onChange;
    return (react_1["default"].createElement("div", { className: "space-y-4 p-3" },
        react_1["default"].createElement("h3", { className: "text-sm font-semibold" }, "Global Styles & Layout"),
        react_1["default"].createElement(PropField, { label: "General Background Color" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "color", value: styles.bgColor || "#e1ecf7", onChange: function (e) { return onChange(__assign(__assign({}, styles), { bgColor: e.target.value })); }, className: "w-8 h-8 rounded border cursor-pointer" }),
                react_1["default"].createElement(input_1.Input, { value: styles.bgColor || "#e1ecf7", onChange: function (e) { return onChange(__assign(__assign({}, styles), { bgColor: e.target.value })); }, className: "flex-1 h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Content Width (px)" },
            react_1["default"].createElement(input_1.Input, { type: "number", value: styles.contentWidth || "600", onChange: function (e) { return onChange(__assign(__assign({}, styles), { contentWidth: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Font Family" },
            react_1["default"].createElement("select", { value: styles.fontFamily || "Arial, sans-serif", onChange: function (e) { return onChange(__assign(__assign({}, styles), { fontFamily: e.target.value })); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "Arial, sans-serif" }, "Arial"),
                react_1["default"].createElement("option", { value: "'Helvetica Neue', Helvetica, sans-serif" }, "Helvetica"),
                react_1["default"].createElement("option", { value: "Georgia, serif" }, "Georgia"),
                react_1["default"].createElement("option", { value: "'Times New Roman', serif" }, "Times New Roman"),
                react_1["default"].createElement("option", { value: "Verdana, sans-serif" }, "Verdana"),
                react_1["default"].createElement("option", { value: "'Trebuchet MS', sans-serif" }, "Trebuchet MS")))));
}
// ─── Main Component ──────────────────────────────────────────────────────────
function EmailBlockEditor(_a) {
    var value = _a.value, onChange = _a.onChange, placeholder = _a.placeholder, variables = _a.variables, _b = _a.minHeight, minHeight = _b === void 0 ? "500px" : _b;
    var _c = react_1.useState("blocks"), mode = _c[0], setMode = _c[1];
    var _d = react_1.useState(function () {
        if (!value || value.trim().length === 0)
            return [];
        return htmlToBlocks(value).blocks;
    }), blocks = _d[0], setBlocks = _d[1];
    var _e = react_1.useState(null), selectedBlockId = _e[0], setSelectedBlockId = _e[1];
    var _f = react_1.useState(value || ""), codeValue = _f[0], setCodeValue = _f[1];
    var _g = react_1.useState("desktop"), previewDevice = _g[0], setPreviewDevice = _g[1];
    var _h = react_1.useState({ bgColor: "#e1ecf7", contentWidth: "600", fontFamily: "Arial, sans-serif" }), globalStyles = _h[0], setGlobalStyles = _h[1];
    var _j = react_1.useState(false), showGlobalStyles = _j[0], setShowGlobalStyles = _j[1];
    var _k = react_1.useState([]), undoStack = _k[0], setUndoStack = _k[1];
    var _l = react_1.useState([]), redoStack = _l[0], setRedoStack = _l[1];
    var codeRef = react_1.useRef(null);
    // Sync blocks → parent onChange
    var syncToParent = react_1.useCallback(function (newBlocks) {
        var html = blocksToHtml(newBlocks, globalStyles);
        onChange(html);
    }, [onChange, globalStyles]);
    // Update blocks with undo support
    var updateBlocks = react_1.useCallback(function (newBlocks) {
        setUndoStack(function (prev) { return __spreadArrays(prev.slice(-20), [blocks]); });
        setRedoStack([]);
        setBlocks(newBlocks);
        syncToParent(newBlocks);
    }, [blocks, syncToParent]);
    var undo = react_1.useCallback(function () {
        if (undoStack.length === 0)
            return;
        var prev = undoStack[undoStack.length - 1];
        setRedoStack(function (r) { return __spreadArrays(r, [blocks]); });
        setUndoStack(function (u) { return u.slice(0, -1); });
        setBlocks(prev);
        syncToParent(prev);
    }, [undoStack, blocks, syncToParent]);
    var redo = react_1.useCallback(function () {
        if (redoStack.length === 0)
            return;
        var next = redoStack[redoStack.length - 1];
        setUndoStack(function (u) { return __spreadArrays(u, [blocks]); });
        setRedoStack(function (r) { return r.slice(0, -1); });
        setBlocks(next);
        syncToParent(next);
    }, [redoStack, blocks, syncToParent]);
    // Add block
    var addBlock = react_1.useCallback(function (type) {
        var newBlock = getDefaultBlock(type);
        var newBlocks = __spreadArrays(blocks, [newBlock]);
        updateBlocks(newBlocks);
        setSelectedBlockId(newBlock.id);
    }, [blocks, updateBlocks]);
    // Update single block
    var updateBlock = react_1.useCallback(function (updated) {
        var newBlocks = blocks.map(function (b) { return b.id === updated.id ? updated : b; });
        updateBlocks(newBlocks);
    }, [blocks, updateBlocks]);
    // Delete block
    var deleteBlock = react_1.useCallback(function (id) {
        var newBlocks = blocks.filter(function (b) { return b.id !== id; });
        updateBlocks(newBlocks);
        if (selectedBlockId === id)
            setSelectedBlockId(null);
    }, [blocks, updateBlocks, selectedBlockId]);
    // Duplicate block
    var duplicateBlock = react_1.useCallback(function (id) {
        var idx = blocks.findIndex(function (b) { return b.id === id; });
        if (idx === -1)
            return;
        var clone = __assign(__assign({}, blocks[idx]), { id: createBlockId(), props: __assign({}, blocks[idx].props) });
        var newBlocks = __spreadArrays(blocks.slice(0, idx + 1), [clone], blocks.slice(idx + 1));
        updateBlocks(newBlocks);
        setSelectedBlockId(clone.id);
    }, [blocks, updateBlocks]);
    // Move block
    var moveBlock = react_1.useCallback(function (id, direction) {
        var _a;
        var idx = blocks.findIndex(function (b) { return b.id === id; });
        if (idx === -1)
            return;
        if (direction === "up" && idx === 0)
            return;
        if (direction === "down" && idx === blocks.length - 1)
            return;
        var newBlocks = __spreadArrays(blocks);
        var swapIdx = direction === "up" ? idx - 1 : idx + 1;
        _a = [newBlocks[swapIdx], newBlocks[idx]], newBlocks[idx] = _a[0], newBlocks[swapIdx] = _a[1];
        updateBlocks(newBlocks);
    }, [blocks, updateBlocks]);
    // Mode switching
    var switchMode = react_1.useCallback(function (newMode) {
        if (newMode === "code") {
            setCodeValue(blocksToHtml(blocks, globalStyles));
        }
        else if (mode === "code" && newMode === "blocks") {
            var parsed = htmlToBlocks(codeValue).blocks;
            setBlocks(parsed);
        }
        else if (mode === "code" && newMode === "richtext") {
            // Pass through
        }
        setMode(newMode);
    }, [mode, blocks, codeValue, globalStyles]);
    // Handle code mode save
    var handleCodeChange = react_1.useCallback(function (newCode) {
        setCodeValue(newCode);
        onChange(newCode);
    }, [onChange]);
    var selectedBlock = blocks.find(function (b) { return b.id === selectedBlockId; }) || null;
    var deviceWidth = previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";
    return (react_1["default"].createElement("div", { className: "border rounded-lg bg-background overflow-hidden flex flex-col", style: { minHeight: minHeight } },
        react_1["default"].createElement("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30" },
            react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                react_1["default"].createElement("div", { className: "flex items-center rounded-md border bg-background p-0.5" },
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("blocks"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "blocks" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        "Block Editor"),
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("richtext"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "richtext" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        "Rich Text"),
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("code"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "code" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        "HTML Code"))),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                mode === "blocks" && (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("button", { onClick: undo, disabled: undoStack.length === 0, className: "p-1.5 rounded hover:bg-muted disabled:opacity-30", title: "Undo" },
                        react_1["default"].createElement(lucide_react_1.Undo2, { className: "h-4 w-4" })),
                    react_1["default"].createElement("button", { onClick: redo, disabled: redoStack.length === 0, className: "p-1.5 rounded hover:bg-muted disabled:opacity-30", title: "Redo" },
                        react_1["default"].createElement(lucide_react_1.Redo2, { className: "h-4 w-4" })),
                    react_1["default"].createElement("div", { className: "w-px h-5 bg-border" }))),
                react_1["default"].createElement("div", { className: "flex items-center gap-0.5 rounded-md border bg-background p-0.5" },
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("desktop"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Desktop" },
                        react_1["default"].createElement(lucide_react_1.Monitor, { className: "h-3.5 w-3.5" })),
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("tablet"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "tablet" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Tablet" },
                        react_1["default"].createElement(lucide_react_1.Tablet, { className: "h-3.5 w-3.5" })),
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("mobile"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Mobile" },
                        react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-3.5 w-3.5" }))))),
        react_1["default"].createElement("div", { className: "flex flex-1 overflow-hidden" },
            mode === "blocks" && (react_1["default"].createElement("div", { className: "w-[72px] border-r bg-muted/20 overflow-y-auto shrink-0" },
                react_1["default"].createElement("div", { className: "py-2 space-y-0.5" }, BLOCK_TYPES.map(function (bt) { return (react_1["default"].createElement("button", { key: bt.type, onClick: function () { return addBlock(bt.type); }, className: "w-full flex flex-col items-center gap-0.5 py-2 px-1 hover:bg-primary/10 transition-colors rounded-lg mx-auto group", title: bt.description },
                    react_1["default"].createElement("div", { className: "text-muted-foreground group-hover:text-primary transition-colors" }, bt.icon),
                    react_1["default"].createElement("span", { className: "text-[9px] font-medium text-muted-foreground group-hover:text-foreground leading-tight text-center" }, bt.label))); })))),
            react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto", style: { background: mode === "blocks" ? (globalStyles.bgColor || "#e1ecf7") : undefined } },
                mode === "blocks" && (react_1["default"].createElement("div", { className: "flex justify-center py-6 px-4", onClick: function () { return setSelectedBlockId(null); } },
                    react_1["default"].createElement("div", { className: "bg-white rounded-sm shadow-sm", style: { width: deviceWidth, maxWidth: (globalStyles.contentWidth || 600) + "px", minHeight: "400px" } }, blocks.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-[400px] text-muted-foreground" },
                        react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "h-12 w-12 mb-4 opacity-30" }),
                        react_1["default"].createElement("p", { className: "text-sm font-medium mb-1" }, "Start building your email"),
                        react_1["default"].createElement("p", { className: "text-xs opacity-60" }, "Click a block on the left sidebar to add it"))) : (react_1["default"].createElement("div", { className: "p-2 space-y-1" }, blocks.map(function (block, idx) { return (react_1["default"].createElement(BlockRenderer, { key: block.id, block: block, selected: selectedBlockId === block.id, onSelect: function () { return setSelectedBlockId(block.id); }, onUpdate: updateBlock, onDelete: function () { return deleteBlock(block.id); }, onDuplicate: function () { return duplicateBlock(block.id); }, onMoveUp: function () { return moveBlock(block.id, "up"); }, onMoveDown: function () { return moveBlock(block.id, "down"); }, isFirst: idx === 0, isLast: idx === blocks.length - 1 })); })))))),
                mode === "richtext" && (react_1["default"].createElement("div", { className: "p-4" },
                    react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: value, onChange: onChange, placeholder: placeholder || "Design your email template here...", minHeight: "400px", enhanced: true, variables: variables }))),
                mode === "code" && (react_1["default"].createElement("div", { className: "p-4 h-full" },
                    react_1["default"].createElement("textarea", { ref: codeRef, className: "w-full h-full min-h-[500px] rounded-md border bg-muted/30 px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30", value: codeValue, onChange: function (e) { return handleCodeChange(e.target.value); }, placeholder: "<!-- Enter your HTML email code here -->", spellCheck: false })))),
            mode === "blocks" && (react_1["default"].createElement("div", { className: "w-[280px] border-l bg-background overflow-y-auto shrink-0" },
                react_1["default"].createElement("div", { className: "flex border-b" },
                    react_1["default"].createElement("button", { onClick: function () { return setShowGlobalStyles(false); }, className: utils_1.cn("flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors", !showGlobalStyles ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground") },
                        react_1["default"].createElement(lucide_react_1.Settings2, { className: "h-3.5 w-3.5 inline mr-1" }),
                        "Block"),
                    react_1["default"].createElement("button", { onClick: function () { return setShowGlobalStyles(true); }, className: utils_1.cn("flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors", showGlobalStyles ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground") },
                        react_1["default"].createElement(lucide_react_1.Palette, { className: "h-3.5 w-3.5 inline mr-1" }),
                        "Styles")),
                showGlobalStyles ? (react_1["default"].createElement(GlobalStylesPanel, { styles: globalStyles, onChange: setGlobalStyles })) : selectedBlock ? (react_1["default"].createElement("div", { className: "p-3 space-y-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("h3", { className: "text-sm font-semibold capitalize" },
                            selectedBlock.type,
                            " Block"),
                        react_1["default"].createElement("button", { onClick: function () { return deleteBlock(selectedBlock.id); }, className: "p-1 hover:bg-destructive/10 hover:text-destructive rounded", title: "Delete block" },
                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))),
                    selectedBlock.type === "text" && react_1["default"].createElement(TextBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "image" && react_1["default"].createElement(ImageBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "button" && react_1["default"].createElement(ButtonBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "divider" && react_1["default"].createElement(DividerBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "spacer" && react_1["default"].createElement(SpacerBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "header" && react_1["default"].createElement(HeaderBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "html" && react_1["default"].createElement(HtmlBlockProps, { block: selectedBlock, onChange: updateBlock }),
                    selectedBlock.type === "footer" && react_1["default"].createElement(HtmlBlockProps, { block: selectedBlock, onChange: updateBlock }))) : (react_1["default"].createElement("div", { className: "p-4 text-center text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.Settings2, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
                    react_1["default"].createElement("p", { className: "text-xs" }, "Select a block to edit its properties"),
                    react_1["default"].createElement("p", { className: "text-[10px] mt-1 opacity-60" }, "Or click \"Styles\" tab for global settings"))),
                variables && variables.length > 0 && (react_1["default"].createElement("div", { className: "border-t mt-4 pt-3 px-3" },
                    react_1["default"].createElement("h4", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Variables"),
                    react_1["default"].createElement("div", { className: "max-h-[200px] overflow-y-auto space-y-0.5" }, variables.map(function (v) { return (react_1["default"].createElement("button", { key: v.value, className: "w-full text-left px-2 py-1 text-[11px] rounded hover:bg-muted transition-colors flex items-center justify-between", onClick: function () {
                            if (selectedBlock && (selectedBlock.type === "text" || selectedBlock.type === "footer" || selectedBlock.type === "html")) {
                                updateBlock(__assign(__assign({}, selectedBlock), { content: selectedBlock.content + v.value }));
                            }
                        }, title: v.value },
                        react_1["default"].createElement("span", null, v.label),
                        react_1["default"].createElement("code", { className: "text-[9px] text-muted-foreground" }, v.value))); })))))))));
}
exports.EmailBlockEditor = EmailBlockEditor;
exports["default"] = EmailBlockEditor;
