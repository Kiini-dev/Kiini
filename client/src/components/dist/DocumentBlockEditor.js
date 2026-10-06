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
exports.DocumentBlockEditor = void 0;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("./RichTextEditor");
var lucide_react_1 = require("lucide-react");
// ─── Block Definitions ───────────────────────────────────────────────────────
var BLOCK_CATEGORIES = [
    {
        label: "Content",
        blocks: [
            { type: "text", label: "Text", icon: react_1["default"].createElement(lucide_react_1.Type, { className: "h-4 w-4" }), description: "Rich text paragraph" },
            { type: "heading", label: "Heading", icon: react_1["default"].createElement(lucide_react_1.Heading1, { className: "h-4 w-4" }), description: "Section heading" },
            { type: "quote", label: "Quote", icon: react_1["default"].createElement(lucide_react_1.Quote, { className: "h-4 w-4" }), description: "Blockquote" },
            { type: "list", label: "List", icon: react_1["default"].createElement(lucide_react_1.List, { className: "h-4 w-4" }), description: "Bullet or numbered list" },
            { type: "checklist", label: "Checklist", icon: react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4" }), description: "Task checklist" },
            { type: "callout", label: "Callout", icon: react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }), description: "Alert / info callout box" },
            { type: "codeblock", label: "Code", icon: react_1["default"].createElement(lucide_react_1.Terminal, { className: "h-4 w-4" }), description: "Code snippet block" },
        ]
    },
    {
        label: "Media",
        blocks: [
            { type: "image", label: "Image", icon: react_1["default"].createElement(lucide_react_1.Image, { className: "h-4 w-4" }), description: "Upload or link an image" },
            { type: "logo", label: "Logo", icon: react_1["default"].createElement(lucide_react_1.Upload, { className: "h-4 w-4" }), description: "Company logo upload" },
            { type: "attachment", label: "Attachment", icon: react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-4 w-4" }), description: "Attach a document" },
            { type: "social", label: "Social", icon: react_1["default"].createElement(lucide_react_1.Globe, { className: "h-4 w-4" }), description: "Social media links" },
        ]
    },
    {
        label: "Layout",
        blocks: [
            { type: "columns", label: "Columns", icon: react_1["default"].createElement(lucide_react_1.Columns, { className: "h-4 w-4" }), description: "Multi-column layout" },
            { type: "table", label: "Table", icon: react_1["default"].createElement(lucide_react_1.Table, { className: "h-4 w-4" }), description: "Data table" },
            { type: "divider", label: "Divider", icon: react_1["default"].createElement(lucide_react_1.Minus, { className: "h-4 w-4" }), description: "Horizontal line" },
            { type: "spacer", label: "Spacer", icon: react_1["default"].createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" }), description: "Empty space" },
            { type: "pagebreak", label: "Page Break", icon: react_1["default"].createElement(lucide_react_1.SplitSquareHorizontal, { className: "h-4 w-4" }), description: "PDF page break" },
            { type: "toc", label: "TOC", icon: react_1["default"].createElement(lucide_react_1.Hash, { className: "h-4 w-4" }), description: "Table of contents" },
        ]
    },
    {
        label: "Structure",
        blocks: [
            { type: "header", label: "Header", icon: react_1["default"].createElement(lucide_react_1.PanelLeftClose, { className: "h-4 w-4" }), description: "Document header with logo" },
            { type: "footer", label: "Footer", icon: react_1["default"].createElement(lucide_react_1.PanelRightClose, { className: "h-4 w-4" }), description: "Document footer" },
            { type: "button", label: "Button", icon: react_1["default"].createElement(lucide_react_1.Square, { className: "h-4 w-4" }), description: "Call-to-action button" },
            { type: "signature", label: "Signature", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-4 w-4" }), description: "Signature block" },
            { type: "html", label: "HTML", icon: react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }), description: "Custom HTML code" },
        ]
    },
    {
        label: "Special",
        blocks: [
            { type: "progress", label: "Progress", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }), description: "Progress bar indicator" },
            { type: "rating", label: "Rating", icon: react_1["default"].createElement(lucide_react_1.Bookmark, { className: "h-4 w-4" }), description: "Star rating display" },
            { type: "badge", label: "Badge", icon: react_1["default"].createElement(lucide_react_1.BoxSelect, { className: "h-4 w-4" }), description: "Status badge / tag" },
        ]
    },
];
var ALL_BLOCK_TYPES = BLOCK_CATEGORIES.flatMap(function (c) { return c.blocks; });
// ─── Helpers ─────────────────────────────────────────────────────────────────
function createBlockId() {
    return "blk-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}
function getDefaultBlock(type) {
    var id = createBlockId();
    var defaults = {
        text: function () { return ({ id: id, type: type, content: "<p>Enter your text here...</p>", props: { align: "left", color: "#333333", fontSize: "14px", lineHeight: "1.6", padding: "8px 0" } }); },
        heading: function () { return ({ id: id, type: type, content: "Section Heading", props: { level: "h2", align: "left", color: "#111827", fontSize: "24px", fontWeight: "700", borderBottom: false } }); },
        image: function () { return ({ id: id, type: type, content: "", props: { src: "", alt: "Image", width: "100%", maxWidth: "400px", align: "center", borderRadius: "8px", border: "", caption: "" } }); },
        logo: function () { return ({ id: id, type: type, content: "", props: { src: "", alt: "Company Logo", width: "180px", height: "auto", align: "left", padding: "16px 0" } }); },
        button: function () { return ({ id: id, type: type, content: "Click Here", props: { url: "#", bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: "6px", align: "center", width: "auto", fontSize: "14px", padding: "10px 24px", fontWeight: "600" } }); },
        divider: function () { return ({ id: id, type: type, content: "", props: { color: "#e2e8f0", thickness: "1px", width: "100%", style: "solid", margin: "16px 0" } }); },
        spacer: function () { return ({ id: id, type: type, content: "", props: { height: "24px" } }); },
        columns: function () { return ({
            id: id, type: type,
            content: "", props: {
                columns: 2, gap: "16px", layout: "equal",
                widths: ["50%", "50%"],
                content1: "<p>Column 1 content</p>",
                content2: "<p>Column 2 content</p>",
                content3: "",
                content4: "",
                verticalAlign: "top",
                bgColor1: "", bgColor2: "", bgColor3: "", bgColor4: "",
                padding: "0"
            }
        }); },
        table: function () { return ({
            id: id, type: type,
            content: "", props: {
                rows: 3, cols: 3,
                headerRow: true,
                stripeRows: true,
                borderColor: "#e2e8f0",
                headerBg: "#1e293b",
                headerColor: "#ffffff",
                cellPadding: "10px 12px",
                fontSize: "13px",
                data: [
                    ["Header 1", "Header 2", "Header 3"],
                    ["Cell 1", "Cell 2", "Cell 3"],
                    ["Cell 4", "Cell 5", "Cell 6"],
                ],
                colWidths: ["33.33%", "33.33%", "33.33%"]
            }
        }); },
        quote: function () { return ({ id: id, type: type, content: "This is a blockquote. Use it for important callouts or testimonials.", props: { borderColor: "#3b82f6", bgColor: "#eff6ff", textColor: "#1e40af", fontSize: "15px", style: "border-left" } }); },
        list: function () { return ({ id: id, type: type, content: "", props: { style: "unordered", items: ["First item", "Second item", "Third item"], color: "#333333", fontSize: "14px", spacing: "8px" } }); },
        checklist: function () { return ({ id: id, type: type, content: "", props: { items: [{ text: "Task one", checked: false }, { text: "Task two", checked: true }, { text: "Task three", checked: false }], fontSize: "14px" } }); },
        html: function () { return ({ id: id, type: type, content: "<div><!-- Custom HTML --></div>", props: {} }); },
        header: function () { return ({ id: id, type: type, content: "", props: { logo: "", title: "Company Name", subtitle: "Document Title", bgColor: "#1e293b", textColor: "#ffffff", padding: "32px", layout: "logo-left", borderBottom: "3px solid #3b82f6" } }); },
        footer: function () { return ({ id: id, type: type, content: "<p style='color:#666;font-size:11px;text-align:center;margin:0'>© 2026 Company Name. All rights reserved.<br/>123 Street Address, City, Country<br/>Phone: +254 700 000 000 | Email: info@company.com</p>", props: { bgColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "20px 24px" } }); },
        pagebreak: function () { return ({ id: id, type: type, content: "", props: {} }); },
        signature: function () { return ({ id: id, type: type, content: "", props: { label: "Authorized Signature", name: "", title: "", date: true, lineWidth: "200px", align: "left" } }); },
        attachment: function () { return ({ id: id, type: type, content: "", props: { fileName: "", fileUrl: "", fileSize: "", fileType: "" } }); },
        callout: function () { return ({ id: id, type: type, content: "This is an important notice. Pay attention to the details below.", props: { variant: "info", icon: true, title: "", bgColor: "", textColor: "", borderColor: "", padding: "16px", borderRadius: "8px" } }); },
        codeblock: function () { return ({ id: id, type: type, content: "const greeting = 'Hello World';\nconsole.log(greeting);", props: { language: "javascript", theme: "dark", showLineNumbers: true, fontSize: "13px", padding: "16px" } }); },
        social: function () { return ({ id: id, type: type, content: "", props: { align: "center", iconSize: "24px", gap: "12px", style: "colored", links: [{ platform: "website", url: "https://", label: "Website" }, { platform: "email", url: "mailto:", label: "Email" }, { platform: "phone", url: "tel:", label: "Phone" }] } }); },
        progress: function () { return ({ id: id, type: type, content: "", props: { value: 75, max: 100, label: "Progress", showValue: true, height: "12px", bgColor: "#e2e8f0", fillColor: "#3b82f6", borderRadius: "6px", labelPosition: "top" } }); },
        toc: function () { return ({ id: id, type: type, content: "", props: { title: "Table of Contents", maxDepth: 3, numbered: true, bgColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" } }); },
        rating: function () { return ({ id: id, type: type, content: "", props: { value: 4, max: 5, size: "24px", color: "#f59e0b", emptyColor: "#e2e8f0", label: "", align: "left" } }); },
        badge: function () { return ({ id: id, type: type, content: "Status", props: { variant: "default", bgColor: "#3b82f6", textColor: "#ffffff", fontSize: "12px", padding: "4px 12px", borderRadius: "9999px", align: "left" } }); }
    };
    return defaults[type]();
}
// ─── HTML Serializer ─────────────────────────────────────────────────────────
function blocksToHtml(blocks, globalStyles) {
    var _a = globalStyles.bgColor, bgColor = _a === void 0 ? "#ffffff" : _a, _b = globalStyles.contentWidth, contentWidth = _b === void 0 ? "800" : _b, _c = globalStyles.fontFamily, fontFamily = _c === void 0 ? "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" : _c, _d = globalStyles.pageMargin, pageMargin = _d === void 0 ? "40px" : _d, _e = globalStyles.headerBg, headerBg = _e === void 0 ? "" : _e, _f = globalStyles.footerBg, footerBg = _f === void 0 ? "" : _f;
    var inner = blocks.map(function (b) {
        switch (b.type) {
            case "text":
                return "<div style=\"padding:" + (b.props.padding || "8px 0") + ";text-align:" + (b.props.align || "left") + ";color:" + (b.props.color || "#333") + ";font-size:" + (b.props.fontSize || "14px") + ";line-height:" + (b.props.lineHeight || "1.6") + "\">" + b.content + "</div>";
            case "heading": {
                var tag = b.props.level || "h2";
                var bb = b.props.borderBottom ? "border-bottom:2px solid #e2e8f0;padding-bottom:8px;" : "";
                return "<" + tag + " style=\"text-align:" + (b.props.align || "left") + ";color:" + (b.props.color || "#111827") + ";font-size:" + (b.props.fontSize || "24px") + ";font-weight:" + (b.props.fontWeight || "700") + ";margin:16px 0 8px;" + bb + "\">" + b.content + "</" + tag + ">";
            }
            case "image":
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:12px 0\">" + (b.props.src
                    ? "<img src=\"" + b.props.src + "\" alt=\"" + (b.props.alt || "") + "\" style=\"max-width:" + (b.props.maxWidth || "100%") + ";width:" + (b.props.width || "auto") + ";height:auto;border-radius:" + (b.props.borderRadius || "0") + ";" + (b.props.border ? "border:" + b.props.border + ";" : "") + "\" />" + (b.props.caption ? "<p style=\"font-size:12px;color:#666;margin-top:8px;text-align:center\">" + b.props.caption + "</p>" : "")
                    : '<div style="background:#f1f5f9;padding:40px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px">Upload or enter image URL</div>') + "</div>";
            case "logo":
                return "<div style=\"text-align:" + (b.props.align || "left") + ";padding:" + (b.props.padding || "16px 0") + "\">" + (b.props.src
                    ? "<img src=\"" + b.props.src + "\" alt=\"" + (b.props.alt || "Logo") + "\" style=\"width:" + (b.props.width || "180px") + ";height:" + (b.props.height || "auto") + "\" />"
                    : '<div style="display:inline-block;background:#f1f5f9;padding:20px 40px;border:2px dashed #cbd5e1;border-radius:8px;color:#94a3b8;font-size:13px">Upload Logo</div>') + "</div>";
            case "button":
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:16px 0\"><a href=\"" + (b.props.url || "#") + "\" style=\"display:inline-block;background:" + b.props.bgColor + ";color:" + b.props.textColor + ";padding:" + b.props.padding + ";border-radius:" + b.props.borderRadius + ";text-decoration:none;font-weight:" + (b.props.fontWeight || "600") + ";font-size:" + b.props.fontSize + "\">" + b.content + "</a></div>";
            case "divider":
                return "<hr style=\"border:none;border-top:" + b.props.thickness + " " + (b.props.style || "solid") + " " + b.props.color + ";margin:" + (b.props.margin || "16px 0") + ";width:" + b.props.width + "\" />";
            case "spacer":
                return "<div style=\"height:" + b.props.height + "\"></div>";
            case "pagebreak":
                return "<div style=\"page-break-after:always;height:0;margin:24px 0;border-top:2px dashed #94a3b8\"></div>";
            case "columns": {
                var cols = b.props.columns || 2;
                var widths = b.props.widths || Array(cols).fill(Math.floor(100 / cols) + "%");
                var cells = "";
                for (var i = 0; i < cols; i++) {
                    var bg = b.props["bgColor" + (i + 1)] ? "background:" + b.props["bgColor" + (i + 1)] + ";" : "";
                    cells += "<td style=\"width:" + widths[i] + ";vertical-align:" + (b.props.verticalAlign || "top") + ";padding:" + (b.props.padding || "0") + " " + parseInt(b.props.gap || "16") / 2 + "px;" + bg + "\">" + (b.props["content" + (i + 1)] || "") + "</td>";
                }
                return "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"table-layout:fixed\"><tr>" + cells + "</tr></table>";
            }
            case "table": {
                var _a = b.props, _b = _a.data, data = _b === void 0 ? [] : _b, _c = _a.headerRow, headerRow_1 = _c === void 0 ? true : _c, _d = _a.stripeRows, stripeRows_1 = _d === void 0 ? true : _d, _e = _a.borderColor, borderColor_1 = _e === void 0 ? "#e2e8f0" : _e, _f = _a.headerBg, hBg_1 = _f === void 0 ? "#1e293b" : _f, _g = _a.headerColor, hColor_1 = _g === void 0 ? "#ffffff" : _g, _h = _a.cellPadding, cellPadding_1 = _h === void 0 ? "10px 12px" : _h, _j = _a.fontSize, fontSize_1 = _j === void 0 ? "13px" : _j, _k = _a.colWidths, colWidths = _k === void 0 ? [] : _k;
                if (!data.length)
                    return "";
                var colGroup = colWidths.length > 0 ? "<colgroup>" + colWidths.map(function (w) { return "<col style=\"width:" + w + "\" />"; }).join("") + "</colgroup>" : "";
                var rows = data.map(function (row, ri) {
                    var isHeader = headerRow_1 && ri === 0;
                    var stripe = !isHeader && stripeRows_1 && ri % 2 === 0 ? "background:#f8fafc;" : "";
                    var cells = row.map(function (cell, ci) {
                        return isHeader
                            ? "<th style=\"padding:" + cellPadding_1 + ";background:" + hBg_1 + ";color:" + hColor_1 + ";font-weight:600;font-size:" + fontSize_1 + ";text-align:left;border:1px solid " + borderColor_1 + "\">" + cell + "</th>"
                            : "<td style=\"padding:" + cellPadding_1 + ";font-size:" + fontSize_1 + ";border:1px solid " + borderColor_1 + ";" + stripe + "\">" + cell + "</td>";
                    }).join("");
                    return "<tr>" + cells + "</tr>";
                }).join("");
                return "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;margin:12px 0\">" + colGroup + rows + "</table>";
            }
            case "quote": {
                if (b.props.style === "border-left") {
                    return "<blockquote style=\"border-left:4px solid " + (b.props.borderColor || "#3b82f6") + ";background:" + (b.props.bgColor || "#eff6ff") + ";color:" + (b.props.textColor || "#1e40af") + ";padding:16px 20px;margin:12px 0;border-radius:0 8px 8px 0;font-size:" + (b.props.fontSize || "15px") + ";font-style:italic\">" + b.content + "</blockquote>";
                }
                return "<blockquote style=\"background:" + (b.props.bgColor || "#f8fafc") + ";color:" + (b.props.textColor || "#333") + ";padding:20px;margin:12px 0;border-radius:8px;font-size:" + (b.props.fontSize || "15px") + ";text-align:center;font-style:italic;border:1px solid " + (b.props.borderColor || "#e2e8f0") + "\">" + b.content + "</blockquote>";
            }
            case "list": {
                var tag = b.props.style === "ordered" ? "ol" : "ul";
                var items = (b.props.items || []).map(function (it) { return "<li style=\"margin-bottom:" + (b.props.spacing || "8px") + "\">" + it + "</li>"; }).join("");
                return "<" + tag + " style=\"color:" + (b.props.color || "#333") + ";font-size:" + (b.props.fontSize || "14px") + ";padding-left:24px;margin:12px 0\">" + items + "</" + tag + ">";
            }
            case "checklist": {
                var items = (b.props.items || []).map(function (it) {
                    return "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:" + (b.props.fontSize || "14px") + "\"><span style=\"display:inline-block;width:16px;height:16px;border:2px solid " + (it.checked ? "#22c55e" : "#cbd5e1") + ";border-radius:3px;background:" + (it.checked ? "#22c55e" : "transparent") + ";flex-shrink:0\">" + (it.checked ? '<span style="color:white;font-size:11px;display:flex;align-items:center;justify-content:center;height:100%">✓</span>' : "") + "</span><span style=\"" + (it.checked ? "text-decoration:line-through;color:#999" : "") + "\">" + it.text + "</span></div>";
                }).join("");
                return "<div style=\"padding:8px 0\">" + items + "</div>";
            }
            case "html":
                return b.content;
            case "header": {
                var layout = b.props.layout || "logo-left";
                var logoHtml = b.props.logo ? "<img src=\"" + b.props.logo + "\" alt=\"Logo\" style=\"max-height:56px\" />" : "";
                var titleHtml = "<div>" + (b.props.title ? "<h1 style=\"margin:0;font-size:22px;font-weight:700;color:" + b.props.textColor + "\">" + b.props.title + "</h1>" : "") + (b.props.subtitle ? "<p style=\"margin:4px 0 0;font-size:14px;opacity:0.8;color:" + b.props.textColor + "\">" + b.props.subtitle + "</p>" : "") + "</div>";
                if (layout === "logo-left") {
                    return "<div style=\"background:" + b.props.bgColor + ";padding:" + b.props.padding + ";display:flex;align-items:center;gap:20px;" + (b.props.borderBottom ? "border-bottom:" + b.props.borderBottom + ";" : "") + "\">" + logoHtml + titleHtml + "</div>";
                }
                if (layout === "centered") {
                    return "<div style=\"background:" + b.props.bgColor + ";padding:" + b.props.padding + ";text-align:center;" + (b.props.borderBottom ? "border-bottom:" + b.props.borderBottom + ";" : "") + "\">" + logoHtml + "<br/>" + titleHtml + "</div>";
                }
                return "<div style=\"background:" + b.props.bgColor + ";padding:" + b.props.padding + ";display:flex;align-items:center;justify-content:space-between;" + (b.props.borderBottom ? "border-bottom:" + b.props.borderBottom + ";" : "") + "\">" + titleHtml + logoHtml + "</div>";
            }
            case "footer":
                return "<div style=\"background:" + (b.props.bgColor || "#f8fafc") + ";padding:" + (b.props.padding || "20px 24px") + ";" + (b.props.borderTop ? "border-top:" + b.props.borderTop + ";" : "") + "\">" + b.content + "</div>";
            case "signature":
                return "<div style=\"text-align:" + (b.props.align || "left") + ";padding:24px 0\"><div style=\"display:inline-block\"><div style=\"border-bottom:1px solid #333;width:" + (b.props.lineWidth || "200px") + ";margin-bottom:8px;padding-bottom:40px\"></div><p style=\"margin:0;font-size:12px;font-weight:600;color:#333\">" + (b.props.label || "Authorized Signature") + "</p>" + (b.props.name ? "<p style=\"margin:2px 0 0;font-size:12px;color:#666\">" + b.props.name + "</p>" : "") + (b.props.title ? "<p style=\"margin:2px 0 0;font-size:11px;color:#999\">" + b.props.title + "</p>" : "") + (b.props.date ? "<p style=\"margin:4px 0 0;font-size:11px;color:#999\">Date: _______________</p>" : "") + "</div></div>";
            case "attachment":
                return b.props.fileName
                    ? "<div style=\"padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;margin:8px 0;display:flex;align-items:center;gap:12px;background:#f8fafc\"><span style=\"font-size:20px\">\uD83D\uDCCE</span><div><p style=\"margin:0;font-size:13px;font-weight:600\">" + b.props.fileName + "</p><p style=\"margin:2px 0 0;font-size:11px;color:#666\">" + (b.props.fileSize || "") + " " + (b.props.fileType || "") + "</p></div></div>"
                    : '<div style="padding:20px;border:2px dashed #cbd5e1;border-radius:8px;text-align:center;color:#94a3b8;font-size:13px">Click to attach a document</div>';
            case "callout": {
                var variants = {
                    info: { bg: "#eff6ff", border: "#3b82f6", color: "#1e40af", icon: "ℹ️" },
                    warning: { bg: "#fffbeb", border: "#f59e0b", color: "#92400e", icon: "⚠️" },
                    error: { bg: "#fef2f2", border: "#ef4444", color: "#991b1b", icon: "❌" },
                    success: { bg: "#f0fdf4", border: "#22c55e", color: "#166534", icon: "✅" },
                    tip: { bg: "#f5f3ff", border: "#8b5cf6", color: "#5b21b6", icon: "💡" }
                };
                var v = variants[b.props.variant] || variants.info;
                var bg = b.props.bgColor || v.bg;
                var border = b.props.borderColor || v.border;
                var color = b.props.textColor || v.color;
                return "<div style=\"padding:" + (b.props.padding || "16px") + ";background:" + bg + ";border-left:4px solid " + border + ";border-radius:" + (b.props.borderRadius || "8px") + ";margin:12px 0;color:" + color + "\">" + (b.props.icon !== false ? "<span style=\"margin-right:8px\">" + v.icon + "</span>" : "") + (b.props.title ? "<strong style=\"display:block;margin-bottom:4px\">" + b.props.title + "</strong>" : "") + b.content + "</div>";
            }
            case "codeblock":
                return "<pre style=\"background:" + (b.props.theme === "dark" ? "#1e293b" : "#f8fafc") + ";color:" + (b.props.theme === "dark" ? "#e2e8f0" : "#334155") + ";padding:" + (b.props.padding || "16px") + ";border-radius:8px;font-size:" + (b.props.fontSize || "13px") + ";font-family:'Courier New',monospace;overflow-x:auto;margin:12px 0;border:1px solid " + (b.props.theme === "dark" ? "#334155" : "#e2e8f0") + ";line-height:1.6\"><code>" + b.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</code></pre>";
            case "social": {
                var links = b.props.links || [];
                var linkHtml = links.map(function (l) { return "<a href=\"" + l.url + "\" style=\"display:inline-block;margin:0 " + (b.props.gap ? parseInt(b.props.gap) / 2 + "px" : "6px") + ";text-decoration:none;color:#666;font-size:" + (b.props.iconSize || "14px") + "\">" + (l.label || l.platform) + "</a>"; }).join("");
                return "<div style=\"text-align:" + (b.props.align || "center") + ";padding:16px 0\">" + linkHtml + "</div>";
            }
            case "progress":
                return "<div style=\"margin:12px 0\">" + (b.props.label && b.props.labelPosition !== "none" ? "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:6px\"><span style=\"font-size:13px;font-weight:600;color:#333\">" + b.props.label + "</span>" + (b.props.showValue ? "<span style=\"font-size:12px;color:#666\">" + b.props.value + "%</span>" : "") + "</div>" : "") + "<div style=\"background:" + (b.props.bgColor || "#e2e8f0") + ";border-radius:" + (b.props.borderRadius || "6px") + ";height:" + (b.props.height || "12px") + ";overflow:hidden\"><div style=\"width:" + Math.min(100, (b.props.value / b.props.max) * 100) + "%;height:100%;background:" + (b.props.fillColor || "#3b82f6") + ";border-radius:" + (b.props.borderRadius || "6px") + ";transition:width 0.3s\"></div></div></div>";
            case "toc":
                return "<div style=\"background:" + (b.props.bgColor || "#f8fafc") + ";padding:" + (b.props.padding || "20px") + ";border-radius:" + (b.props.borderRadius || "8px") + ";border:" + (b.props.border || "1px solid #e2e8f0") + ";margin:16px 0\"><h3 style=\"margin:0 0 12px;font-size:16px;font-weight:700;color:#111827\">" + (b.props.title || "Table of Contents") + "</h3><p style=\"margin:0;font-size:12px;color:#666;font-style:italic\">Auto-generated from document headings</p></div>";
            case "rating": {
                var filled_1 = Math.min(b.props.value || 0, b.props.max || 5);
                var stars = Array.from({ length: b.props.max || 5 }, function (_, i) { return i < filled_1 ? "<span style=\"color:" + (b.props.color || "#f59e0b") + ";font-size:" + (b.props.size || "24px") + "\">\u2605</span>" : "<span style=\"color:" + (b.props.emptyColor || "#e2e8f0") + ";font-size:" + (b.props.size || "24px") + "\">\u2605</span>"; }).join("");
                return "<div style=\"text-align:" + (b.props.align || "left") + ";padding:8px 0\">" + (b.props.label ? "<span style=\"font-size:13px;margin-right:8px;color:#333\">" + b.props.label + "</span>" : "") + stars + "</div>";
            }
            case "badge":
                return "<div style=\"text-align:" + (b.props.align || "left") + ";padding:8px 0\"><span style=\"display:inline-block;background:" + (b.props.bgColor || "#3b82f6") + ";color:" + (b.props.textColor || "#fff") + ";padding:" + (b.props.padding || "4px 12px") + ";border-radius:" + (b.props.borderRadius || "9999px") + ";font-size:" + (b.props.fontSize || "12px") + ";font-weight:600\">" + b.content + "</span></div>";
            default:
                return "";
        }
    }).join("\n");
    return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"><style>@page{margin:" + pageMargin + ";size:A4}@media print{body{margin:0;padding:0}}*{box-sizing:border-box}body{margin:0;padding:0;font-family:" + fontFamily + ";color:#333;line-height:1.5}</style></head><body style=\"margin:0;padding:0;background:" + bgColor + ";font-family:" + fontFamily + "\"><div style=\"max-width:" + contentWidth + "px;margin:0 auto;background:#ffffff;padding:" + pageMargin + "\">" + inner + "</div></body></html>";
}
function htmlToBlocks(html) {
    if (!html || html.trim().length === 0)
        return { blocks: [], globalStyles: {} };
    return { blocks: [{ id: createBlockId(), type: "text", content: html, props: { align: "left", color: "#333333", fontSize: "14px", lineHeight: "1.6", padding: "8px 0" } }], globalStyles: {} };
}
// ─── Property Editor Components ──────────────────────────────────────────────
function PropField(_a) {
    var label = _a.label, children = _a.children, hint = _a.hint;
    return (react_1["default"].createElement("div", { className: "space-y-1" },
        react_1["default"].createElement("label", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider" }, label),
        children,
        hint && react_1["default"].createElement("p", { className: "text-[10px] text-muted-foreground/60" }, hint)));
}
function ColorPicker(_a) {
    var value = _a.value, onChange = _a.onChange, label = _a.label;
    return (react_1["default"].createElement(PropField, { label: label },
        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            react_1["default"].createElement("input", { type: "color", value: (value || "").startsWith("rgba") || (value || "").startsWith("oklch") ? "#1e293b" : (value || "#333333"), onChange: function (e) { return onChange(e.target.value); }, className: "w-8 h-8 rounded border cursor-pointer shrink-0" }),
            react_1["default"].createElement(input_1.Input, { value: value || "", onChange: function (e) { return onChange(e.target.value); }, className: "flex-1 h-8 text-xs" }))));
}
function AlignmentPicker(_a) {
    var value = _a.value, onChange = _a.onChange;
    return (react_1["default"].createElement(PropField, { label: "Alignment" },
        react_1["default"].createElement("div", { className: "flex gap-1" }, ["left", "center", "right"].map(function (a) { return (react_1["default"].createElement(button_1.Button, { key: a, size: "sm", variant: value === a ? "default" : "outline", className: "flex-1 h-8", onClick: function () { return onChange(a); } }, a === "left" ? react_1["default"].createElement(lucide_react_1.AlignLeft, { className: "h-3.5 w-3.5" }) : a === "center" ? react_1["default"].createElement(lucide_react_1.AlignCenter, { className: "h-3.5 w-3.5" }) : react_1["default"].createElement(lucide_react_1.AlignRight, { className: "h-3.5 w-3.5" }))); }))));
}
// ─── Block Property Editors ──────────────────────────────────────────────────
function TextProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } }),
        react_1["default"].createElement(PropField, { label: "Font Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.fontSize || "14px", onChange: function (e) { return up("fontSize", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Line Height" },
            react_1["default"].createElement(input_1.Input, { value: block.props.lineHeight || "1.6", onChange: function (e) { return up("lineHeight", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.color || "#333333", onChange: function (v) { return up("color", v); } }),
        react_1["default"].createElement(PropField, { label: "Padding" },
            react_1["default"].createElement(input_1.Input, { value: block.props.padding || "8px 0", onChange: function (e) { return up("padding", e.target.value); }, className: "h-8 text-xs" }))));
}
function HeadingProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Heading Text" },
            react_1["default"].createElement(input_1.Input, { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Level" },
            react_1["default"].createElement("select", { value: block.props.level || "h2", onChange: function (e) { return up("level", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "h1" }, "H1 \u2014 Main Title"),
                react_1["default"].createElement("option", { value: "h2" }, "H2 \u2014 Section"),
                react_1["default"].createElement("option", { value: "h3" }, "H3 \u2014 Subsection"),
                react_1["default"].createElement("option", { value: "h4" }, "H4 \u2014 Minor"))),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } }),
        react_1["default"].createElement(PropField, { label: "Font Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.fontSize || "24px", onChange: function (e) { return up("fontSize", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(ColorPicker, { label: "Color", value: block.props.color || "#111827", onChange: function (v) { return up("color", v); } }),
        react_1["default"].createElement(PropField, { label: "Bottom Border" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: !!block.props.borderBottom, onChange: function (e) { return up("borderBottom", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Show underline")))));
}
function ImageProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var fileRef = react_1.useRef(null);
    var handleUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function () { return up("src", reader.result); };
        reader.readAsDataURL(file);
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Image" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(input_1.Input, { value: block.props.src || "", onChange: function (e) { return up("src", e.target.value); }, placeholder: "https://...", className: "h-8 text-xs" }),
                react_1["default"].createElement("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleUpload }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-8 text-xs", onClick: function () { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-3.5 w-3.5 mr-1.5" }),
                    "Upload Image"))),
        react_1["default"].createElement(PropField, { label: "Alt Text" },
            react_1["default"].createElement(input_1.Input, { value: block.props.alt || "", onChange: function (e) { return up("alt", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Max Width" },
            react_1["default"].createElement(input_1.Input, { value: block.props.maxWidth || "400px", onChange: function (e) { return up("maxWidth", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderRadius || "8px", onChange: function (e) { return up("borderRadius", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Caption" },
            react_1["default"].createElement(input_1.Input, { value: block.props.caption || "", onChange: function (e) { return up("caption", e.target.value); }, placeholder: "Optional caption", className: "h-8 text-xs" })),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "center", onChange: function (v) { return up("align", v); } })));
}
function LogoProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var fileRef = react_1.useRef(null);
    var handleUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function () { return up("src", reader.result); };
        reader.readAsDataURL(file);
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Logo" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                block.props.src && (react_1["default"].createElement("div", { className: "p-3 border rounded-md bg-muted/30 text-center" },
                    react_1["default"].createElement("img", { src: block.props.src, alt: "Logo preview", className: "max-h-16 inline-block" }))),
                react_1["default"].createElement(input_1.Input, { value: block.props.src || "", onChange: function (e) { return up("src", e.target.value); }, placeholder: "https://...", className: "h-8 text-xs" }),
                react_1["default"].createElement("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleUpload }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-8 text-xs", onClick: function () { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-3.5 w-3.5 mr-1.5" }),
                    "Upload Logo"))),
        react_1["default"].createElement(PropField, { label: "Width" },
            react_1["default"].createElement(input_1.Input, { value: block.props.width || "180px", onChange: function (e) { return up("width", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } })));
}
function ButtonProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Button Text" },
            react_1["default"].createElement(input_1.Input, { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Link URL" },
            react_1["default"].createElement(input_1.Input, { value: block.props.url || "#", onChange: function (e) { return up("url", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#3b82f6", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.textColor || "#ffffff", onChange: function (v) { return up("textColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderRadius || "6px", onChange: function (e) { return up("borderRadius", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Padding" },
            react_1["default"].createElement(input_1.Input, { value: block.props.padding || "10px 24px", onChange: function (e) { return up("padding", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "center", onChange: function (v) { return up("align", v); } })));
}
function DividerProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(ColorPicker, { label: "Color", value: block.props.color || "#e2e8f0", onChange: function (v) { return up("color", v); } }),
        react_1["default"].createElement(PropField, { label: "Thickness" },
            react_1["default"].createElement(input_1.Input, { value: block.props.thickness || "1px", onChange: function (e) { return up("thickness", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Style" },
            react_1["default"].createElement("select", { value: block.props.style || "solid", onChange: function (e) { return up("style", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "solid" }, "Solid"),
                react_1["default"].createElement("option", { value: "dashed" }, "Dashed"),
                react_1["default"].createElement("option", { value: "dotted" }, "Dotted"),
                react_1["default"].createElement("option", { value: "double" }, "Double"))),
        react_1["default"].createElement(PropField, { label: "Width" },
            react_1["default"].createElement(input_1.Input, { value: block.props.width || "100%", onChange: function (e) { return up("width", e.target.value); }, className: "h-8 text-xs" }))));
}
function SpacerProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement(PropField, { label: "Height" },
        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            react_1["default"].createElement("input", { type: "range", min: "4", max: "120", value: parseInt(block.props.height) || 24, onChange: function (e) { return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { height: e.target.value + "px" }) })); }, className: "flex-1" }),
            react_1["default"].createElement("span", { className: "text-xs text-muted-foreground w-10 text-right" }, block.props.height))));
}
function ColumnsProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var cols = block.props.columns || 2;
    var widths = block.props.widths || Array(cols).fill(Math.floor(100 / cols) + "%");
    var layouts = [
        { label: "Equal", cols: 2, widths: ["50%", "50%"] },
        { label: "2/3 + 1/3", cols: 2, widths: ["66.66%", "33.33%"] },
        { label: "1/3 + 2/3", cols: 2, widths: ["33.33%", "66.66%"] },
        { label: "3 Equal", cols: 3, widths: ["33.33%", "33.33%", "33.33%"] },
        { label: "1/4+1/2+1/4", cols: 3, widths: ["25%", "50%", "25%"] },
        { label: "4 Equal", cols: 4, widths: ["25%", "25%", "25%", "25%"] },
    ];
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Column Layout" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1" }, layouts.map(function (l, i) { return (react_1["default"].createElement("button", { key: i, onClick: function () { up("columns", l.cols); up("widths", l.widths); }, className: utils_1.cn("px-2 py-1.5 text-[10px] rounded border text-center transition-colors", cols === l.cols && JSON.stringify(widths) === JSON.stringify(l.widths) ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted") }, l.label)); }))),
        react_1["default"].createElement(PropField, { label: "Column Widths", hint: "Drag to resize columns" },
            react_1["default"].createElement("div", { className: "space-y-1" }, widths.slice(0, cols).map(function (w, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-2" },
                react_1["default"].createElement("span", { className: "text-[10px] text-muted-foreground w-8" },
                    "Col ",
                    i + 1),
                react_1["default"].createElement(input_1.Input, { value: w, onChange: function (e) { var nw = __spreadArrays(widths); nw[i] = e.target.value; up("widths", nw); }, className: "flex-1 h-7 text-xs" }))); }))),
        react_1["default"].createElement(PropField, { label: "Gap" },
            react_1["default"].createElement(input_1.Input, { value: block.props.gap || "16px", onChange: function (e) { return up("gap", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Vertical Align" },
            react_1["default"].createElement("select", { value: block.props.verticalAlign || "top", onChange: function (e) { return up("verticalAlign", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "top" }, "Top"),
                react_1["default"].createElement("option", { value: "middle" }, "Middle"),
                react_1["default"].createElement("option", { value: "bottom" }, "Bottom")))));
}
function TableProps(_a) {
    var _b;
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var data = block.props.data || [["", ""], ["", ""]];
    var rows = data.length;
    var colCount = ((_b = data[0]) === null || _b === void 0 ? void 0 : _b.length) || 2;
    var colWidths = block.props.colWidths || Array(colCount).fill(Math.floor(100 / colCount) + "%");
    var updateCell = function (ri, ci, val) {
        var nd = data.map(function (r, i) { return i === ri ? r.map(function (c, j) { return j === ci ? val : c; }) : __spreadArrays(r); });
        up("data", nd);
    };
    var addRow = function () { return up("data", __spreadArrays(data, [Array(colCount).fill("")])); };
    var removeRow = function (ri) { if (rows <= 1)
        return; up("data", data.filter(function (_, i) { return i !== ri; })); };
    var addCol = function () {
        up("data", data.map(function (r) { return __spreadArrays(r, [""]); }));
        up("colWidths", __spreadArrays(colWidths, [Math.floor(100 / (colCount + 1)) + "%"]));
    };
    var removeCol = function (ci) {
        if (colCount <= 1)
            return;
        up("data", data.map(function (r) { return r.filter(function (_, j) { return j !== ci; }); }));
        up("colWidths", colWidths.filter(function (_, j) { return j !== ci; }));
    };
    var mergeRows = function () {
        // Simple merge: combine last two rows into one
        if (rows < 2)
            return;
        var merged = data.slice(0, -2);
        var r1 = data[rows - 2];
        var r2 = data[rows - 1];
        merged.push(r1.map(function (c, i) { return (c + " " + r2[i]).trim(); }));
        up("data", merged);
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Table Data" },
            react_1["default"].createElement("div", { className: "max-h-[300px] overflow-auto border rounded-md" },
                react_1["default"].createElement("table", { className: "w-full text-xs" },
                    react_1["default"].createElement("tbody", null, data.map(function (row, ri) { return (react_1["default"].createElement("tr", { key: ri },
                        row.map(function (cell, ci) { return (react_1["default"].createElement("td", { key: ci, className: "border p-0" },
                            react_1["default"].createElement("input", { value: cell, onChange: function (e) { return updateCell(ri, ci, e.target.value); }, className: "w-full px-2 py-1.5 text-xs bg-transparent outline-none", placeholder: block.props.headerRow && ri === 0 ? "Header" : "Cell" }))); }),
                        react_1["default"].createElement("td", { className: "border-0 w-6" },
                            react_1["default"].createElement("button", { onClick: function () { return removeRow(ri); }, className: "p-0.5 text-muted-foreground hover:text-destructive" },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))); })))),
            react_1["default"].createElement("div", { className: "flex gap-1 mt-1" },
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1 h-7 text-[10px]", onClick: addRow },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                    "Row"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1 h-7 text-[10px]", onClick: addCol },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                    "Column"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1 h-7 text-[10px]", onClick: mergeRows },
                    react_1["default"].createElement(lucide_react_1.Merge, { className: "h-3 w-3 mr-1" }),
                    "Merge"))),
        react_1["default"].createElement(PropField, { label: "Column Widths" },
            react_1["default"].createElement("div", { className: "space-y-1" }, colWidths.map(function (w, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-2" },
                react_1["default"].createElement("span", { className: "text-[10px] text-muted-foreground w-6" },
                    "C",
                    i + 1),
                react_1["default"].createElement(input_1.Input, { value: w, onChange: function (e) { var nw = __spreadArrays(colWidths); nw[i] = e.target.value; up("colWidths", nw); }, className: "flex-1 h-7 text-xs" }),
                react_1["default"].createElement("button", { onClick: function () { return removeCol(i); }, className: "p-0.5 text-muted-foreground hover:text-destructive" },
                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))); }))),
        react_1["default"].createElement(PropField, { label: "Options" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: block.props.headerRow !== false, onChange: function (e) { return up("headerRow", e.target.checked); }, className: "rounded" }),
                    react_1["default"].createElement("span", { className: "text-xs" }, "Header Row")),
                react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: block.props.stripeRows !== false, onChange: function (e) { return up("stripeRows", e.target.checked); }, className: "rounded" }),
                    react_1["default"].createElement("span", { className: "text-xs" }, "Striped Rows")))),
        react_1["default"].createElement(ColorPicker, { label: "Header Background", value: block.props.headerBg || "#1e293b", onChange: function (v) { return up("headerBg", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Border Color", value: block.props.borderColor || "#e2e8f0", onChange: function (v) { return up("borderColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Cell Padding" },
            react_1["default"].createElement(input_1.Input, { value: block.props.cellPadding || "10px 12px", onChange: function (e) { return up("cellPadding", e.target.value); }, className: "h-8 text-xs" }))));
}
function QuoteProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Quote Text" },
            react_1["default"].createElement("textarea", { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "w-full min-h-[80px] rounded-md border px-3 py-2 text-xs bg-background" })),
        react_1["default"].createElement(PropField, { label: "Style" },
            react_1["default"].createElement("select", { value: block.props.style || "border-left", onChange: function (e) { return up("style", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "border-left" }, "Left Border"),
                react_1["default"].createElement("option", { value: "boxed" }, "Boxed"))),
        react_1["default"].createElement(ColorPicker, { label: "Accent Color", value: block.props.borderColor || "#3b82f6", onChange: function (v) { return up("borderColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#eff6ff", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.textColor || "#1e40af", onChange: function (v) { return up("textColor", v); } })));
}
function ListProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var items = block.props.items || [];
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "List Style" },
            react_1["default"].createElement("select", { value: block.props.style || "unordered", onChange: function (e) { return up("style", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "unordered" }, "Bullet List"),
                react_1["default"].createElement("option", { value: "ordered" }, "Numbered List"))),
        react_1["default"].createElement(PropField, { label: "Items" },
            react_1["default"].createElement("div", { className: "space-y-1" },
                items.map(function (item, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-1" },
                    react_1["default"].createElement("span", { className: "text-[10px] text-muted-foreground w-4" }, i + 1),
                    react_1["default"].createElement(input_1.Input, { value: item, onChange: function (e) { var ni = __spreadArrays(items); ni[i] = e.target.value; up("items", ni); }, className: "flex-1 h-7 text-xs" }),
                    react_1["default"].createElement("button", { onClick: function () { return up("items", items.filter(function (_, j) { return j !== i; })); }, className: "p-0.5 text-muted-foreground hover:text-destructive" },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))); }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-7 text-[10px]", onClick: function () { return up("items", __spreadArrays(items, ["New item"])); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                    "Add Item"))),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.color || "#333333", onChange: function (v) { return up("color", v); } })));
}
function ChecklistProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var items = block.props.items || [];
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Items" },
            react_1["default"].createElement("div", { className: "space-y-1" },
                items.map(function (item, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-1.5" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: item.checked, onChange: function (e) { var ni = __spreadArrays(items); ni[i] = __assign(__assign({}, ni[i]), { checked: e.target.checked }); up("items", ni); }, className: "rounded shrink-0" }),
                    react_1["default"].createElement(input_1.Input, { value: item.text, onChange: function (e) { var ni = __spreadArrays(items); ni[i] = __assign(__assign({}, ni[i]), { text: e.target.value }); up("items", ni); }, className: "flex-1 h-7 text-xs" }),
                    react_1["default"].createElement("button", { onClick: function () { return up("items", items.filter(function (_, j) { return j !== i; })); }, className: "p-0.5 text-muted-foreground hover:text-destructive" },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))); }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-7 text-[10px]", onClick: function () { return up("items", __spreadArrays(items, [{ text: "New task", checked: false }])); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                    "Add Task")))));
}
function HeaderProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var fileRef = react_1.useRef(null);
    var handleUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function () { return up("logo", reader.result); };
        reader.readAsDataURL(file);
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Title" },
            react_1["default"].createElement(input_1.Input, { value: block.props.title || "", onChange: function (e) { return up("title", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Subtitle" },
            react_1["default"].createElement(input_1.Input, { value: block.props.subtitle || "", onChange: function (e) { return up("subtitle", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Logo" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                block.props.logo && (react_1["default"].createElement("div", { className: "p-2 border rounded-md bg-muted/30 text-center" },
                    react_1["default"].createElement("img", { src: block.props.logo, alt: "Logo", className: "max-h-12 inline-block" }))),
                react_1["default"].createElement("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleUpload }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-8 text-xs", onClick: function () { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-3.5 w-3.5 mr-1.5" }),
                    "Upload Logo"),
                react_1["default"].createElement(input_1.Input, { value: block.props.logo || "", onChange: function (e) { return up("logo", e.target.value); }, placeholder: "Or paste URL...", className: "h-8 text-xs" }))),
        react_1["default"].createElement(PropField, { label: "Layout" },
            react_1["default"].createElement("select", { value: block.props.layout || "logo-left", onChange: function (e) { return up("layout", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "logo-left" }, "Logo Left"),
                react_1["default"].createElement("option", { value: "logo-right" }, "Logo Right"),
                react_1["default"].createElement("option", { value: "centered" }, "Centered"))),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#1e293b", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.textColor || "#ffffff", onChange: function (v) { return up("textColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Padding" },
            react_1["default"].createElement(input_1.Input, { value: block.props.padding || "32px", onChange: function (e) { return up("padding", e.target.value); }, className: "h-8 text-xs" }))));
}
function FooterProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Footer Content" },
            react_1["default"].createElement("textarea", { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "w-full min-h-[100px] rounded-md border px-3 py-2 text-xs font-mono bg-muted/30" })),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#f8fafc", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Border Top" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderTop || "", onChange: function (e) { return up("borderTop", e.target.value); }, placeholder: "1px solid #e2e8f0", className: "h-8 text-xs" }))));
}
function SignatureProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Label" },
            react_1["default"].createElement(input_1.Input, { value: block.props.label || "", onChange: function (e) { return up("label", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Name" },
            react_1["default"].createElement(input_1.Input, { value: block.props.name || "", onChange: function (e) { return up("name", e.target.value); }, placeholder: "Signatory name", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Title/Role" },
            react_1["default"].createElement(input_1.Input, { value: block.props.title || "", onChange: function (e) { return up("title", e.target.value); }, placeholder: "Job title", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Line Width" },
            react_1["default"].createElement(input_1.Input, { value: block.props.lineWidth || "200px", onChange: function (e) { return up("lineWidth", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Show Date Line" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.props.date !== false, onChange: function (e) { return up("date", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Include date field"))),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } })));
}
function AttachmentProps(_a) {
    var block = _a.block, onChange = _a.onChange, onAttach = _a.onAttach;
    var fileRef = react_1.useRef(null);
    var handleFile = function (e) {
        var _a, _b;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + " KB", fileType: ((_b = file.type.split("/")[1]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "FILE" }) }));
        onAttach === null || onAttach === void 0 ? void 0 : onAttach([file]);
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Attach Document" },
            react_1["default"].createElement("input", { ref: fileRef, type: "file", className: "hidden", onChange: handleFile }),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-8 text-xs", onClick: function () { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-3.5 w-3.5 mr-1.5" }),
                "Choose File")),
        block.props.fileName && (react_1["default"].createElement("div", { className: "p-2 border rounded-md bg-muted/30 text-xs" },
            react_1["default"].createElement("p", { className: "font-medium" }, block.props.fileName),
            react_1["default"].createElement("p", { className: "text-muted-foreground" },
                block.props.fileSize,
                " ",
                block.props.fileType)))));
}
function CalloutProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Variant" },
            react_1["default"].createElement("select", { value: block.props.variant || "info", onChange: function (e) { return up("variant", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "info" }, "\u2139\uFE0F Info"),
                react_1["default"].createElement("option", { value: "warning" }, "\u26A0\uFE0F Warning"),
                react_1["default"].createElement("option", { value: "error" }, "\u274C Error / Danger"),
                react_1["default"].createElement("option", { value: "success" }, "\u2705 Success"),
                react_1["default"].createElement("option", { value: "tip" }, "\uD83D\uDCA1 Tip"))),
        react_1["default"].createElement(PropField, { label: "Title (optional)" },
            react_1["default"].createElement(input_1.Input, { value: block.props.title || "", onChange: function (e) { return up("title", e.target.value); }, placeholder: "Callout title...", className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Content" },
            react_1["default"].createElement("textarea", { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "w-full min-h-[80px] rounded-md border px-3 py-2 text-xs bg-background" })),
        react_1["default"].createElement(PropField, { label: "Show Icon" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.props.icon !== false, onChange: function (e) { return up("icon", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Display variant icon"))),
        react_1["default"].createElement(ColorPicker, { label: "Background Override", value: block.props.bgColor || "", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Border Override", value: block.props.borderColor || "", onChange: function (v) { return up("borderColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderRadius || "8px", onChange: function (e) { return up("borderRadius", e.target.value); }, className: "h-8 text-xs" }))));
}
function CodeblockProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Code" },
            react_1["default"].createElement("textarea", { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "w-full min-h-[150px] rounded-md border px-3 py-2 text-xs font-mono bg-muted/30", spellCheck: false })),
        react_1["default"].createElement(PropField, { label: "Language" },
            react_1["default"].createElement("select", { value: block.props.language || "javascript", onChange: function (e) { return up("language", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "javascript" }, "JavaScript"),
                react_1["default"].createElement("option", { value: "typescript" }, "TypeScript"),
                react_1["default"].createElement("option", { value: "python" }, "Python"),
                react_1["default"].createElement("option", { value: "html" }, "HTML"),
                react_1["default"].createElement("option", { value: "css" }, "CSS"),
                react_1["default"].createElement("option", { value: "sql" }, "SQL"),
                react_1["default"].createElement("option", { value: "json" }, "JSON"),
                react_1["default"].createElement("option", { value: "bash" }, "Bash / Shell"),
                react_1["default"].createElement("option", { value: "text" }, "Plain Text"))),
        react_1["default"].createElement(PropField, { label: "Theme" },
            react_1["default"].createElement("select", { value: block.props.theme || "dark", onChange: function (e) { return up("theme", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "dark" }, "Dark"),
                react_1["default"].createElement("option", { value: "light" }, "Light"))),
        react_1["default"].createElement(PropField, { label: "Show Line Numbers" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.props.showLineNumbers !== false, onChange: function (e) { return up("showLineNumbers", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Display line numbers"))),
        react_1["default"].createElement(PropField, { label: "Font Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.fontSize || "13px", onChange: function (e) { return up("fontSize", e.target.value); }, className: "h-8 text-xs" }))));
}
function SocialProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var links = block.props.links || [];
    var platforms = ["website", "email", "phone", "facebook", "twitter", "linkedin", "instagram", "youtube", "github", "tiktok"];
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Social Links" },
            react_1["default"].createElement("div", { className: "space-y-1.5" },
                links.map(function (link, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-1 border rounded-md p-1.5" },
                    react_1["default"].createElement("select", { value: link.platform, onChange: function (e) { var nl = __spreadArrays(links); nl[i] = __assign(__assign({}, nl[i]), { platform: e.target.value }); up("links", nl); }, className: "h-7 text-[10px] px-1 border rounded bg-background w-20 shrink-0" }, platforms.map(function (p) { return react_1["default"].createElement("option", { key: p, value: p }, p); })),
                    react_1["default"].createElement(input_1.Input, { value: link.url, onChange: function (e) { var nl = __spreadArrays(links); nl[i] = __assign(__assign({}, nl[i]), { url: e.target.value }); up("links", nl); }, placeholder: "URL...", className: "flex-1 h-7 text-[10px]" }),
                    react_1["default"].createElement(input_1.Input, { value: link.label, onChange: function (e) { var nl = __spreadArrays(links); nl[i] = __assign(__assign({}, nl[i]), { label: e.target.value }); up("links", nl); }, placeholder: "Label", className: "w-16 h-7 text-[10px]" }),
                    react_1["default"].createElement("button", { onClick: function () { return up("links", links.filter(function (_, j) { return j !== i; })); }, className: "p-0.5 text-muted-foreground hover:text-destructive shrink-0" },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3 w-3" })))); }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full h-7 text-[10px]", onClick: function () { return up("links", __spreadArrays(links, [{ platform: "website", url: "https://", label: "" }])); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                    "Add Link"))),
        react_1["default"].createElement(PropField, { label: "Style" },
            react_1["default"].createElement("select", { value: block.props.style || "colored", onChange: function (e) { return up("style", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "colored" }, "Colored Icons"),
                react_1["default"].createElement("option", { value: "dark" }, "Dark Icons"),
                react_1["default"].createElement("option", { value: "light" }, "Light Icons"),
                react_1["default"].createElement("option", { value: "outlined" }, "Outlined"))),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "center", onChange: function (v) { return up("align", v); } }),
        react_1["default"].createElement(PropField, { label: "Gap" },
            react_1["default"].createElement(input_1.Input, { value: block.props.gap || "12px", onChange: function (e) { return up("gap", e.target.value); }, className: "h-8 text-xs" }))));
}
function ProgressProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Value" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "range", min: "0", max: block.props.max || 100, value: block.props.value || 0, onChange: function (e) { return up("value", Number(e.target.value)); }, className: "flex-1" }),
                react_1["default"].createElement("span", { className: "text-xs text-muted-foreground w-10 text-right" },
                    block.props.value || 0,
                    "%"))),
        react_1["default"].createElement(PropField, { label: "Label" },
            react_1["default"].createElement(input_1.Input, { value: block.props.label || "", onChange: function (e) { return up("label", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Show Value" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.props.showValue !== false, onChange: function (e) { return up("showValue", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Display percentage"))),
        react_1["default"].createElement(PropField, { label: "Bar Height" },
            react_1["default"].createElement(input_1.Input, { value: block.props.height || "12px", onChange: function (e) { return up("height", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(ColorPicker, { label: "Fill Color", value: block.props.fillColor || "#3b82f6", onChange: function (v) { return up("fillColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Track Color", value: block.props.bgColor || "#e2e8f0", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement(input_1.Input, { value: block.props.borderRadius || "6px", onChange: function (e) { return up("borderRadius", e.target.value); }, className: "h-8 text-xs" }))));
}
function TocProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Title" },
            react_1["default"].createElement(input_1.Input, { value: block.props.title || "Table of Contents", onChange: function (e) { return up("title", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Max Depth" },
            react_1["default"].createElement("select", { value: block.props.maxDepth || 3, onChange: function (e) { return up("maxDepth", Number(e.target.value)); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: 1 }, "H1 only"),
                react_1["default"].createElement("option", { value: 2 }, "H1 \u2013 H2"),
                react_1["default"].createElement("option", { value: 3 }, "H1 \u2013 H3"),
                react_1["default"].createElement("option", { value: 4 }, "H1 \u2013 H4"))),
        react_1["default"].createElement(PropField, { label: "Numbered" },
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.props.numbered !== false, onChange: function (e) { return up("numbered", e.target.checked); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs" }, "Show numbers"))),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#f8fafc", onChange: function (v) { return up("bgColor", v); } })));
}
function RatingProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Rating" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "range", min: "0", max: block.props.max || 5, step: "1", value: block.props.value || 0, onChange: function (e) { return up("value", Number(e.target.value)); }, className: "flex-1" }),
                react_1["default"].createElement("span", { className: "text-xs text-muted-foreground w-8 text-right" },
                    block.props.value || 0,
                    "/",
                    block.props.max || 5))),
        react_1["default"].createElement(PropField, { label: "Max Stars" },
            react_1["default"].createElement("select", { value: block.props.max || 5, onChange: function (e) { return up("max", Number(e.target.value)); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: 3 }, "3 Stars"),
                react_1["default"].createElement("option", { value: 5 }, "5 Stars"),
                react_1["default"].createElement("option", { value: 10 }, "10 Stars"))),
        react_1["default"].createElement(PropField, { label: "Label" },
            react_1["default"].createElement(input_1.Input, { value: block.props.label || "", onChange: function (e) { return up("label", e.target.value); }, placeholder: "Optional label...", className: "h-8 text-xs" })),
        react_1["default"].createElement(ColorPicker, { label: "Star Color", value: block.props.color || "#f59e0b", onChange: function (v) { return up("color", v); } }),
        react_1["default"].createElement(PropField, { label: "Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.size || "24px", onChange: function (e) { return up("size", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } })));
}
function BadgeProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    var up = function (k, v) {
        var _a;
        return onChange(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a[k] = v, _a)) }));
    };
    var presets = [
        { label: "Blue", bg: "#3b82f6", text: "#ffffff" },
        { label: "Green", bg: "#22c55e", text: "#ffffff" },
        { label: "Red", bg: "#ef4444", text: "#ffffff" },
        { label: "Yellow", bg: "#f59e0b", text: "#000000" },
        { label: "Purple", bg: "#8b5cf6", text: "#ffffff" },
        { label: "Gray", bg: "#6b7280", text: "#ffffff" },
        { label: "Outlined", bg: "transparent", text: "#333333" },
    ];
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement(PropField, { label: "Badge Text" },
            react_1["default"].createElement(input_1.Input, { value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Quick Presets" },
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-1" }, presets.map(function (p) { return (react_1["default"].createElement("button", { key: p.label, onClick: function () { up("bgColor", p.bg); up("textColor", p.text); }, className: "px-2 py-0.5 rounded-full text-[10px] font-medium border hover:opacity-80", style: { background: p.bg, color: p.text, borderColor: p.bg === "transparent" ? "#d1d5db" : p.bg } }, p.label)); }))),
        react_1["default"].createElement(ColorPicker, { label: "Background", value: block.props.bgColor || "#3b82f6", onChange: function (v) { return up("bgColor", v); } }),
        react_1["default"].createElement(ColorPicker, { label: "Text Color", value: block.props.textColor || "#ffffff", onChange: function (v) { return up("textColor", v); } }),
        react_1["default"].createElement(PropField, { label: "Border Radius" },
            react_1["default"].createElement("select", { value: block.props.borderRadius || "9999px", onChange: function (e) { return up("borderRadius", e.target.value); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "9999px" }, "Pill"),
                react_1["default"].createElement("option", { value: "6px" }, "Rounded"),
                react_1["default"].createElement("option", { value: "2px" }, "Square"))),
        react_1["default"].createElement(PropField, { label: "Font Size" },
            react_1["default"].createElement(input_1.Input, { value: block.props.fontSize || "12px", onChange: function (e) { return up("fontSize", e.target.value); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(AlignmentPicker, { value: block.props.align || "left", onChange: function (v) { return up("align", v); } })));
}
function HtmlProps(_a) {
    var block = _a.block, onChange = _a.onChange;
    return (react_1["default"].createElement(PropField, { label: "HTML Code" },
        react_1["default"].createElement("textarea", { className: "w-full min-h-[150px] rounded-md border px-3 py-2 text-xs font-mono bg-muted/30", value: block.content, onChange: function (e) { return onChange(__assign(__assign({}, block), { content: e.target.value })); } })));
}
// ─── Block Canvas Renderer ───────────────────────────────────────────────────
function BlockRenderer(_a) {
    var block = _a.block, selected = _a.selected, onSelect = _a.onSelect, onUpdate = _a.onUpdate, onDelete = _a.onDelete, onDuplicate = _a.onDuplicate, onMoveUp = _a.onMoveUp, onMoveDown = _a.onMoveDown, isFirst = _a.isFirst, isLast = _a.isLast;
    var renderContent = function () {
        switch (block.type) {
            case "text":
                return (react_1["default"].createElement("div", { contentEditable: true, suppressContentEditableWarning: true, className: "outline-none min-h-[24px] px-2 py-1", style: { textAlign: (block.props.align || "left"), color: block.props.color, fontSize: block.props.fontSize, lineHeight: block.props.lineHeight }, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } }));
            case "heading": {
                var Tag = (block.props.level || "h2");
                var sizes = { h1: "28px", h2: "24px", h3: "20px", h4: "16px" };
                return (react_1["default"].createElement("div", { contentEditable: true, suppressContentEditableWarning: true, className: "outline-none px-2", style: { textAlign: (block.props.align || "left"), color: block.props.color, fontSize: block.props.fontSize || sizes[block.props.level || "h2"], fontWeight: block.props.fontWeight || "700", borderBottom: block.props.borderBottom ? "2px solid #e2e8f0" : undefined, paddingBottom: block.props.borderBottom ? "8px" : undefined }, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.textContent || "" })); } }));
            }
            case "image":
                return (react_1["default"].createElement("div", { style: { textAlign: (block.props.align || "center") }, className: "py-2" }, block.props.src ? (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("img", { src: block.props.src, alt: block.props.alt, style: { maxWidth: block.props.maxWidth || "400px", width: block.props.width, borderRadius: block.props.borderRadius, display: "inline-block" } }),
                    block.props.caption && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-2 text-center" }, block.props.caption))) : (react_1["default"].createElement("div", { className: "bg-muted/50 p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg inline-block" },
                    react_1["default"].createElement(lucide_react_1.Image, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                    react_1["default"].createElement("p", { className: "text-xs" }, "Upload or enter image URL")))));
            case "logo":
                return (react_1["default"].createElement("div", { style: { textAlign: (block.props.align || "left"), padding: block.props.padding || "16px 0" } }, block.props.src ? (react_1["default"].createElement("img", { src: block.props.src, alt: block.props.alt || "Logo", style: { width: block.props.width || "180px", height: block.props.height || "auto" } })) : (react_1["default"].createElement("div", { className: "inline-block bg-muted/50 px-8 py-5 text-center text-muted-foreground border-2 border-dashed rounded-lg" },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-6 w-6 mx-auto mb-1.5 opacity-40" }),
                    react_1["default"].createElement("p", { className: "text-[10px]" }, "Upload Logo")))));
            case "button":
                return (react_1["default"].createElement("div", { style: { textAlign: (block.props.align || "center") }, className: "py-3" },
                    react_1["default"].createElement("span", { style: { display: "inline-block", background: block.props.bgColor, color: block.props.textColor, padding: block.props.padding, borderRadius: block.props.borderRadius, fontWeight: block.props.fontWeight, fontSize: block.props.fontSize, cursor: "default" } }, block.content)));
            case "divider":
                return react_1["default"].createElement("div", { className: "py-2" },
                    react_1["default"].createElement("hr", { style: { border: "none", borderTop: block.props.thickness + " " + (block.props.style || "solid") + " " + block.props.color, width: block.props.width } }));
            case "spacer":
                return react_1["default"].createElement("div", { style: { height: block.props.height }, className: "bg-muted/20 rounded border border-dashed border-muted-foreground/20 flex items-center justify-center text-[10px] text-muted-foreground" },
                    "Spacer: ",
                    block.props.height);
            case "pagebreak":
                return react_1["default"].createElement("div", { className: "my-2 border-t-2 border-dashed border-orange-300 py-2 text-center text-[10px] text-orange-500 font-medium bg-orange-50/50 rounded" }, "\u2014 PAGE BREAK \u2014");
            case "columns":
                return (react_1["default"].createElement("div", { className: "flex py-2", style: { gap: block.props.gap } }, Array.from({ length: block.props.columns || 2 }, function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "border border-dashed border-muted-foreground/30 rounded p-2 min-h-[60px]", style: { width: (block.props.widths || [])[i] || "auto", background: block.props["bgColor" + (i + 1)] || undefined }, contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.props["content" + (i + 1)] || "<p>Column " + (i + 1) + "</p>" }, onBlur: function (e) {
                        var _a;
                        return onUpdate(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), (_a = {}, _a["content" + (i + 1)] = e.currentTarget.innerHTML, _a)) }));
                    } })); })));
            case "table": {
                var _a = block.props, _b = _a.data, data_1 = _b === void 0 ? [] : _b, _c = _a.headerRow, headerRow_2 = _c === void 0 ? true : _c, _d = _a.stripeRows, stripeRows_2 = _d === void 0 ? true : _d, _e = _a.borderColor, borderColor_2 = _e === void 0 ? "#e2e8f0" : _e, _f = _a.headerBg, headerBg_1 = _f === void 0 ? "#1e293b" : _f, _g = _a.headerColor, headerColor_1 = _g === void 0 ? "#ffffff" : _g, _h = _a.cellPadding, cellPadding_2 = _h === void 0 ? "10px 12px" : _h, _j = _a.fontSize, fontSize_2 = _j === void 0 ? "13px" : _j;
                return (react_1["default"].createElement("div", { className: "py-2 overflow-x-auto" },
                    react_1["default"].createElement("table", { className: "w-full", style: { borderCollapse: "collapse" } },
                        react_1["default"].createElement("tbody", null, data_1.map(function (row, ri) {
                            var isH = headerRow_2 && ri === 0;
                            var stripe = !isH && stripeRows_2 && ri % 2 === 0;
                            return (react_1["default"].createElement("tr", { key: ri }, row.map(function (cell, ci) { return (react_1["default"].createElement("td", { key: ci, contentEditable: true, suppressContentEditableWarning: true, className: "outline-none", style: __assign(__assign({ padding: cellPadding_2, fontSize: fontSize_2, border: "1px solid " + borderColor_2 }, (isH ? { background: headerBg_1, color: headerColor_1, fontWeight: 600 } : {})), (stripe ? { background: "#f8fafc" } : {})), dangerouslySetInnerHTML: { __html: cell }, onBlur: function (e) {
                                    var nd = data_1.map(function (r, i) { return i === ri ? r.map(function (c, j) { return j === ci ? e.currentTarget.textContent || "" : c; }) : __spreadArrays(r); });
                                    onUpdate(__assign(__assign({}, block), { props: __assign(__assign({}, block.props), { data: nd }) }));
                                } })); })));
                        })))));
            }
            case "quote":
                return block.props.style === "border-left"
                    ? react_1["default"].createElement("blockquote", { className: "my-2 py-3 px-4 italic rounded-r-lg", style: { borderLeft: "4px solid " + (block.props.borderColor || "#3b82f6"), background: block.props.bgColor, color: block.props.textColor, fontSize: block.props.fontSize }, contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } })
                    : react_1["default"].createElement("blockquote", { className: "my-2 py-4 px-5 italic rounded-lg text-center border", style: { background: block.props.bgColor, color: block.props.textColor, fontSize: block.props.fontSize, borderColor: block.props.borderColor }, contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } });
            case "list": {
                var Tag = block.props.style === "ordered" ? "ol" : "ul";
                return (react_1["default"].createElement(Tag, { className: "py-1 px-6", style: { color: block.props.color, fontSize: block.props.fontSize } }, (block.props.items || []).map(function (it, i) { return (react_1["default"].createElement("li", { key: i, style: { marginBottom: block.props.spacing } }, it)); })));
            }
            case "checklist":
                return (react_1["default"].createElement("div", { className: "py-2 px-2 space-y-1.5" }, (block.props.items || []).map(function (it, i) { return (react_1["default"].createElement("label", { key: i, className: "flex items-center gap-2 cursor-pointer", style: { fontSize: block.props.fontSize } },
                    react_1["default"].createElement("input", { type: "checkbox", checked: it.checked, readOnly: true, className: "rounded" }),
                    react_1["default"].createElement("span", { className: it.checked ? "line-through text-muted-foreground" : "" }, it.text))); })));
            case "html":
                return react_1["default"].createElement("div", { className: "py-2 px-2 bg-muted/20 rounded font-mono text-xs overflow-auto max-h-[120px] border border-dashed", dangerouslySetInnerHTML: { __html: block.content } });
            case "header": {
                var layout = block.props.layout || "logo-left";
                return (react_1["default"].createElement("div", { style: { background: block.props.bgColor, color: block.props.textColor, padding: block.props.padding, borderBottom: block.props.borderBottom }, className: utils_1.cn("rounded-t", layout === "centered" ? "text-center" : "flex items-center gap-5", layout === "logo-right" ? "flex-row-reverse" : "") },
                    block.props.logo && react_1["default"].createElement("img", { src: block.props.logo, alt: "Logo", className: "max-h-14" }),
                    react_1["default"].createElement("div", null,
                        block.props.title && react_1["default"].createElement("h2", { className: "text-xl font-bold m-0" }, block.props.title),
                        block.props.subtitle && react_1["default"].createElement("p", { className: "text-sm opacity-80 m-0 mt-1" }, block.props.subtitle))));
            }
            case "footer":
                return (react_1["default"].createElement("div", { style: { background: block.props.bgColor, padding: block.props.padding, borderTop: block.props.borderTop }, className: "rounded-b", contentEditable: true, suppressContentEditableWarning: true, dangerouslySetInnerHTML: { __html: block.content }, onBlur: function (e) { return onUpdate(__assign(__assign({}, block), { content: e.currentTarget.innerHTML })); } }));
            case "signature":
                return (react_1["default"].createElement("div", { style: { textAlign: (block.props.align || "left") }, className: "py-4" },
                    react_1["default"].createElement("div", { className: "inline-block" },
                        react_1["default"].createElement("div", { className: "border-b border-foreground/50", style: { width: block.props.lineWidth || "200px", paddingBottom: "40px" } }),
                        react_1["default"].createElement("p", { className: "text-xs font-semibold mt-2 mb-0" }, block.props.label || "Authorized Signature"),
                        block.props.name && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground m-0" }, block.props.name),
                        block.props.title && react_1["default"].createElement("p", { className: "text-[11px] text-muted-foreground/70 m-0" }, block.props.title),
                        block.props.date && react_1["default"].createElement("p", { className: "text-[11px] text-muted-foreground/70 mt-1" }, "Date: _______________"))));
            case "attachment":
                return (react_1["default"].createElement("div", { className: utils_1.cn("py-2 px-3 border rounded-lg my-1", block.props.fileName ? "bg-muted/30" : "border-dashed border-2 bg-muted/10") }, block.props.fileName ? (react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-5 w-5 text-primary shrink-0" }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm font-medium" }, block.props.fileName),
                        react_1["default"].createElement("p", { className: "text-[11px] text-muted-foreground" },
                            block.props.fileSize,
                            " ",
                            block.props.fileType)))) : (react_1["default"].createElement("div", { className: "py-4 text-center text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-6 w-6 mx-auto mb-1.5 opacity-40" }),
                    react_1["default"].createElement("p", { className: "text-xs" }, "Click to attach document")))));
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
        react_1["default"].createElement("h3", { className: "text-sm font-semibold flex items-center gap-2" },
            react_1["default"].createElement(lucide_react_1.Palette, { className: "h-4 w-4" }),
            "Global Styles & Layout"),
        react_1["default"].createElement(ColorPicker, { label: "Page Background", value: styles.bgColor || "#ffffff", onChange: function (v) { return onChange(__assign(__assign({}, styles), { bgColor: v })); } }),
        react_1["default"].createElement(PropField, { label: "Content Width (px)" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-8 w-8 p-0", onClick: function () { return onChange(__assign(__assign({}, styles), { contentWidth: String(Math.max(400, parseInt(styles.contentWidth || "800") - 50)) })); } }, "\u2212"),
                react_1["default"].createElement(input_1.Input, { type: "number", value: styles.contentWidth || "800", onChange: function (e) { return onChange(__assign(__assign({}, styles), { contentWidth: e.target.value })); }, className: "flex-1 h-8 text-xs text-center" }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-8 w-8 p-0", onClick: function () { return onChange(__assign(__assign({}, styles), { contentWidth: String(Math.min(1200, parseInt(styles.contentWidth || "800") + 50)) })); } }, "+"))),
        react_1["default"].createElement(PropField, { label: "Page Margin" },
            react_1["default"].createElement(input_1.Input, { value: styles.pageMargin || "40px", onChange: function (e) { return onChange(__assign(__assign({}, styles), { pageMargin: e.target.value })); }, className: "h-8 text-xs" })),
        react_1["default"].createElement(PropField, { label: "Font Family" },
            react_1["default"].createElement("select", { value: styles.fontFamily || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", onChange: function (e) { return onChange(__assign(__assign({}, styles), { fontFamily: e.target.value })); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                react_1["default"].createElement("option", { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }, "Segoe UI"),
                react_1["default"].createElement("option", { value: "Arial, sans-serif" }, "Arial"),
                react_1["default"].createElement("option", { value: "'Helvetica Neue', Helvetica, sans-serif" }, "Helvetica"),
                react_1["default"].createElement("option", { value: "Georgia, serif" }, "Georgia"),
                react_1["default"].createElement("option", { value: "'Times New Roman', serif" }, "Times New Roman"),
                react_1["default"].createElement("option", { value: "Verdana, sans-serif" }, "Verdana"),
                react_1["default"].createElement("option", { value: "'Courier New', monospace" }, "Courier New"),
                react_1["default"].createElement("option", { value: "'Inter', sans-serif" }, "Inter"))),
        react_1["default"].createElement("div", { className: "border-t pt-3" },
            react_1["default"].createElement("h4", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Heading Styles"),
            react_1["default"].createElement(PropField, { label: "Heading Font" },
                react_1["default"].createElement("select", { value: styles.headingFont || "", onChange: function (e) { return onChange(__assign(__assign({}, styles), { headingFont: e.target.value })); }, className: "w-full h-8 text-xs px-2 border rounded-md bg-background" },
                    react_1["default"].createElement("option", { value: "" }, "Same as body"),
                    react_1["default"].createElement("option", { value: "Georgia, serif" }, "Georgia"),
                    react_1["default"].createElement("option", { value: "'Times New Roman', serif" }, "Times New Roman"),
                    react_1["default"].createElement("option", { value: "Arial, sans-serif" }, "Arial"))),
            react_1["default"].createElement(ColorPicker, { label: "Heading Color", value: styles.headingColor || "#111827", onChange: function (v) { return onChange(__assign(__assign({}, styles), { headingColor: v })); } })),
        react_1["default"].createElement("div", { className: "border-t pt-3" },
            react_1["default"].createElement("h4", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Button Styles"),
            react_1["default"].createElement(ColorPicker, { label: "Default Button Color", value: styles.buttonColor || "#3b82f6", onChange: function (v) { return onChange(__assign(__assign({}, styles), { buttonColor: v })); } }),
            react_1["default"].createElement(PropField, { label: "Border Radius" },
                react_1["default"].createElement(input_1.Input, { value: styles.buttonRadius || "6px", onChange: function (e) { return onChange(__assign(__assign({}, styles), { buttonRadius: e.target.value })); }, className: "h-8 text-xs" })))));
}
// ─── Main Component ──────────────────────────────────────────────────────────
function DocumentBlockEditor(_a) {
    var value = _a.value, onChange = _a.onChange, placeholder = _a.placeholder, variables = _a.variables, _b = _a.minHeight, minHeight = _b === void 0 ? "600px" : _b, onAttach = _a.onAttach, attachments = _a.attachments;
    var _c = react_1.useState("blocks"), mode = _c[0], setMode = _c[1];
    var _d = react_1.useState(function () {
        if (!value || value.trim().length === 0)
            return [];
        return htmlToBlocks(value).blocks;
    }), blocks = _d[0], setBlocks = _d[1];
    var _e = react_1.useState(null), selectedBlockId = _e[0], setSelectedBlockId = _e[1];
    var _f = react_1.useState(value || ""), codeValue = _f[0], setCodeValue = _f[1];
    var _g = react_1.useState("desktop"), previewDevice = _g[0], setPreviewDevice = _g[1];
    var _h = react_1.useState({ bgColor: "#ffffff", contentWidth: "800", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", pageMargin: "40px" }), globalStyles = _h[0], setGlobalStyles = _h[1];
    var _j = react_1.useState("blocks"), sidebarTab = _j[0], setSidebarTab = _j[1];
    var _k = react_1.useState([]), undoStack = _k[0], setUndoStack = _k[1];
    var _l = react_1.useState([]), redoStack = _l[0], setRedoStack = _l[1];
    var _m = react_1.useState(false), showPreview = _m[0], setShowPreview = _m[1];
    var _o = react_1.useState(false), sidebarCollapsed = _o[0], setSidebarCollapsed = _o[1];
    var _p = react_1.useState("none"), mobilePanel = _p[0], setMobilePanel = _p[1];
    var fileAttachRef = react_1.useRef(null);
    var syncToParent = react_1.useCallback(function (newBlocks) {
        var html = blocksToHtml(newBlocks, globalStyles);
        onChange(html);
    }, [onChange, globalStyles]);
    var updateBlocks = react_1.useCallback(function (newBlocks) {
        setUndoStack(function (prev) { return __spreadArrays(prev.slice(-30), [blocks]); });
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
    var addBlock = react_1.useCallback(function (type) {
        var newBlock = getDefaultBlock(type);
        var newBlocks = __spreadArrays(blocks, [newBlock]);
        updateBlocks(newBlocks);
        setSelectedBlockId(newBlock.id);
        setSidebarTab("properties");
    }, [blocks, updateBlocks]);
    var updateBlock = react_1.useCallback(function (updated) {
        var newBlocks = blocks.map(function (b) { return b.id === updated.id ? updated : b; });
        updateBlocks(newBlocks);
    }, [blocks, updateBlocks]);
    var deleteBlock = react_1.useCallback(function (id) {
        updateBlocks(blocks.filter(function (b) { return b.id !== id; }));
        if (selectedBlockId === id)
            setSelectedBlockId(null);
    }, [blocks, updateBlocks, selectedBlockId]);
    var duplicateBlock = react_1.useCallback(function (id) {
        var idx = blocks.findIndex(function (b) { return b.id === id; });
        if (idx === -1)
            return;
        var clone = __assign(__assign({}, blocks[idx]), { id: createBlockId(), props: __assign({}, blocks[idx].props) });
        updateBlocks(__spreadArrays(blocks.slice(0, idx + 1), [clone], blocks.slice(idx + 1)));
        setSelectedBlockId(clone.id);
    }, [blocks, updateBlocks]);
    var moveBlock = react_1.useCallback(function (id, direction) {
        var _a;
        var idx = blocks.findIndex(function (b) { return b.id === id; });
        if (idx === -1 || (direction === "up" && idx === 0) || (direction === "down" && idx === blocks.length - 1))
            return;
        var newBlocks = __spreadArrays(blocks);
        var swapIdx = direction === "up" ? idx - 1 : idx + 1;
        _a = [newBlocks[swapIdx], newBlocks[idx]], newBlocks[idx] = _a[0], newBlocks[swapIdx] = _a[1];
        updateBlocks(newBlocks);
    }, [blocks, updateBlocks]);
    // Mode switching with content preservation
    var switchMode = react_1.useCallback(function (newMode) {
        if (mode === "blocks" && newMode !== "blocks") {
            var html = blocksToHtml(blocks, globalStyles);
            setCodeValue(html);
            if (newMode === "richtext")
                onChange(html);
        }
        else if (mode === "code" && newMode === "blocks") {
            var parsed = htmlToBlocks(codeValue).blocks;
            setBlocks(parsed);
        }
        else if (mode === "code" && newMode === "richtext") {
            onChange(codeValue);
        }
        else if (mode === "richtext" && newMode === "blocks") {
            var parsed = htmlToBlocks(value).blocks;
            setBlocks(parsed);
        }
        else if (mode === "richtext" && newMode === "code") {
            setCodeValue(value);
        }
        setMode(newMode);
    }, [mode, blocks, codeValue, globalStyles, value, onChange]);
    var handleCodeChange = react_1.useCallback(function (newCode) {
        setCodeValue(newCode);
        onChange(newCode);
    }, [onChange]);
    var handleAttachFile = function () { var _a; return (_a = fileAttachRef.current) === null || _a === void 0 ? void 0 : _a.click(); };
    var onFileAttach = function (e) {
        var files = Array.from(e.target.files || []);
        if (files.length > 0)
            onAttach === null || onAttach === void 0 ? void 0 : onAttach(files);
        e.target.value = "";
    };
    var selectedBlock = blocks.find(function (b) { return b.id === selectedBlockId; }) || null;
    var deviceWidth = previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";
    // Keyboard shortcuts
    react_1.useEffect(function () {
        var handler = function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        document.addEventListener("keydown", handler);
        return function () { return document.removeEventListener("keydown", handler); };
    }, [undo, redo]);
    var renderPropertyEditor = function () {
        var _a;
        if (!selectedBlock)
            return (react_1["default"].createElement("div", { className: "p-6 text-center text-muted-foreground" },
                react_1["default"].createElement(lucide_react_1.Settings2, { className: "h-10 w-10 mx-auto mb-3 opacity-20" }),
                react_1["default"].createElement("p", { className: "text-sm font-medium mb-1" }, "No block selected"),
                react_1["default"].createElement("p", { className: "text-[11px] opacity-60" }, "Click a block in the canvas to edit its properties, or add a new block from the sidebar.")));
        var props = { block: selectedBlock, onChange: updateBlock };
        return (react_1["default"].createElement("div", { className: "p-3 space-y-4" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("h3", { className: "text-sm font-semibold capitalize flex items-center gap-2" }, (_a = ALL_BLOCK_TYPES.find(function (b) { return b.type === selectedBlock.type; })) === null || _a === void 0 ? void 0 :
                    _a.icon,
                    selectedBlock.type,
                    " Block"),
                react_1["default"].createElement("button", { onClick: function () { return deleteBlock(selectedBlock.id); }, className: "p-1.5 hover:bg-destructive/10 hover:text-destructive rounded", title: "Delete" },
                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))),
            selectedBlock.type === "text" && react_1["default"].createElement(TextProps, __assign({}, props)),
            selectedBlock.type === "heading" && react_1["default"].createElement(HeadingProps, __assign({}, props)),
            selectedBlock.type === "image" && react_1["default"].createElement(ImageProps, __assign({}, props)),
            selectedBlock.type === "logo" && react_1["default"].createElement(LogoProps, __assign({}, props)),
            selectedBlock.type === "button" && react_1["default"].createElement(ButtonProps, __assign({}, props)),
            selectedBlock.type === "divider" && react_1["default"].createElement(DividerProps, __assign({}, props)),
            selectedBlock.type === "spacer" && react_1["default"].createElement(SpacerProps, __assign({}, props)),
            selectedBlock.type === "columns" && react_1["default"].createElement(ColumnsProps, __assign({}, props)),
            selectedBlock.type === "table" && react_1["default"].createElement(TableProps, __assign({}, props)),
            selectedBlock.type === "quote" && react_1["default"].createElement(QuoteProps, __assign({}, props)),
            selectedBlock.type === "list" && react_1["default"].createElement(ListProps, __assign({}, props)),
            selectedBlock.type === "checklist" && react_1["default"].createElement(ChecklistProps, __assign({}, props)),
            selectedBlock.type === "header" && react_1["default"].createElement(HeaderProps, __assign({}, props)),
            selectedBlock.type === "footer" && react_1["default"].createElement(FooterProps, __assign({}, props)),
            selectedBlock.type === "signature" && react_1["default"].createElement(SignatureProps, __assign({}, props)),
            selectedBlock.type === "attachment" && react_1["default"].createElement(AttachmentProps, __assign({}, props, { onAttach: onAttach })),
            selectedBlock.type === "html" && react_1["default"].createElement(HtmlProps, __assign({}, props))));
    };
    return (react_1["default"].createElement("div", { className: "border rounded-lg bg-background overflow-hidden flex flex-col", style: { minHeight: minHeight } },
        react_1["default"].createElement("input", { ref: fileAttachRef, type: "file", multiple: true, className: "hidden", onChange: onFileAttach }),
        react_1["default"].createElement("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30 gap-2 flex-wrap" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                mode === "blocks" && (react_1["default"].createElement("button", { onClick: function () { return setMobilePanel(function (prev) { return prev === "none" ? "blocks" : "none"; }); }, className: "lg:hidden p-1.5 rounded hover:bg-muted", title: "Toggle panels" }, mobilePanel !== "none" ? react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4" }) : react_1["default"].createElement(lucide_react_1.Menu, { className: "h-4 w-4" }))),
                react_1["default"].createElement("div", { className: "flex items-center rounded-md border bg-background p-0.5" },
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("blocks"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "blocks" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        react_1["default"].createElement("span", { className: "hidden sm:inline" }, "Block Editor"),
                        react_1["default"].createElement("span", { className: "sm:hidden" }, "Blocks")),
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("richtext"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "richtext" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        react_1["default"].createElement("span", { className: "hidden sm:inline" }, "Rich Text"),
                        react_1["default"].createElement("span", { className: "sm:hidden" }, "Rich")),
                    react_1["default"].createElement("button", { onClick: function () { return switchMode("code"); }, className: utils_1.cn("px-3 py-1.5 text-xs font-medium rounded-sm transition-colors", mode === "code" ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-3.5 w-3.5 inline mr-1.5" }),
                        react_1["default"].createElement("span", { className: "hidden sm:inline" }, "HTML Code"),
                        react_1["default"].createElement("span", { className: "sm:hidden" }, "HTML"))),
                mode === "blocks" && (react_1["default"].createElement("div", { className: "lg:hidden flex items-center gap-0.5 rounded-md border bg-background p-0.5" },
                    react_1["default"].createElement("button", { onClick: function () { return setMobilePanel(function (prev) { return prev === "blocks" ? "none" : "blocks"; }); }, className: utils_1.cn("p-1.5 rounded-sm text-xs", mobilePanel === "blocks" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Block palette" },
                        react_1["default"].createElement(lucide_react_1.PanelLeftClose, { className: "h-3.5 w-3.5" })),
                    react_1["default"].createElement("button", { onClick: function () { return setMobilePanel(function (prev) { return prev === "properties" ? "none" : "properties"; }); }, className: utils_1.cn("p-1.5 rounded-sm text-xs", mobilePanel === "properties" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Properties" },
                        react_1["default"].createElement(lucide_react_1.Settings2, { className: "h-3.5 w-3.5" }))))),
            react_1["default"].createElement("div", { className: "flex items-center gap-1.5" },
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-8 text-xs gap-1.5", onClick: handleAttachFile },
                    react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-3.5 w-3.5" }),
                    "Attach"),
                mode === "blocks" && (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("div", { className: "w-px h-5 bg-border" }),
                    react_1["default"].createElement("button", { onClick: undo, disabled: undoStack.length === 0, className: "p-1.5 rounded hover:bg-muted disabled:opacity-30", title: "Undo (Ctrl+Z)" },
                        react_1["default"].createElement(lucide_react_1.Undo2, { className: "h-4 w-4" })),
                    react_1["default"].createElement("button", { onClick: redo, disabled: redoStack.length === 0, className: "p-1.5 rounded hover:bg-muted disabled:opacity-30", title: "Redo (Ctrl+Y)" },
                        react_1["default"].createElement(lucide_react_1.Redo2, { className: "h-4 w-4" })))),
                react_1["default"].createElement("div", { className: "hidden sm:block w-px h-5 bg-border" }),
                react_1["default"].createElement("div", { className: "hidden sm:flex items-center gap-0.5 rounded-md border bg-background p-0.5" },
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("desktop"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Desktop" },
                        react_1["default"].createElement(lucide_react_1.Monitor, { className: "h-3.5 w-3.5" })),
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("tablet"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "tablet" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Tablet" },
                        react_1["default"].createElement(lucide_react_1.Tablet, { className: "h-3.5 w-3.5" })),
                    react_1["default"].createElement("button", { onClick: function () { return setPreviewDevice("mobile"); }, className: utils_1.cn("p-1.5 rounded-sm", previewDevice === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), title: "Mobile" },
                        react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-3.5 w-3.5" }))),
                react_1["default"].createElement("button", { onClick: function () { return setShowPreview(!showPreview); }, className: utils_1.cn("p-1.5 rounded hover:bg-muted", showPreview && "bg-primary text-primary-foreground"), title: "Preview" },
                    react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })))),
        showPreview && (react_1["default"].createElement("div", { className: "absolute inset-0 z-50 bg-background flex flex-col" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between border-b px-4 py-2 bg-muted/30" },
                react_1["default"].createElement("h3", { className: "text-sm font-semibold" }, "Document Preview"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setShowPreview(false); } }, "Close Preview")),
            react_1["default"].createElement("div", { className: "flex-1 overflow-auto bg-gray-100 p-8 flex justify-center" },
                react_1["default"].createElement("div", { className: "bg-white shadow-lg", style: { width: deviceWidth, maxWidth: (globalStyles.contentWidth || 800) + "px" } },
                    react_1["default"].createElement("div", { dangerouslySetInnerHTML: { __html: mode === "code" ? codeValue : blocksToHtml(blocks, globalStyles) } }))))),
        mobilePanel !== "none" && (react_1["default"].createElement("div", { className: "lg:hidden fixed inset-0 bg-black/30 z-30", onClick: function () { return setMobilePanel("none"); } })),
        react_1["default"].createElement("div", { className: "flex flex-1 overflow-hidden relative" },
            mode === "blocks" && (react_1["default"].createElement("div", { className: utils_1.cn("border-r bg-muted/20 overflow-y-auto shrink-0 transition-all", sidebarCollapsed ? "w-0 overflow-hidden" : "w-[220px]", "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:bg-background max-lg:shadow-xl max-lg:border-r", mobilePanel === "blocks" ? "max-lg:w-[220px]" : "max-lg:w-0 max-lg:overflow-hidden") },
                react_1["default"].createElement("div", { className: "p-2" }, BLOCK_CATEGORIES.map(function (cat) { return (react_1["default"].createElement("div", { key: cat.label, className: "mb-3" },
                    react_1["default"].createElement("h4", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5" }, cat.label),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1" }, cat.blocks.map(function (bt) { return (react_1["default"].createElement("button", { key: bt.type, onClick: function () { return addBlock(bt.type); }, className: "flex flex-col items-center gap-1 py-2 px-1.5 hover:bg-primary/10 transition-colors rounded-lg group border border-transparent hover:border-primary/20", title: bt.description },
                        react_1["default"].createElement("div", { className: "text-muted-foreground group-hover:text-primary transition-colors" }, bt.icon),
                        react_1["default"].createElement("span", { className: "text-[10px] font-medium text-muted-foreground group-hover:text-foreground leading-tight text-center" }, bt.label))); })))); })))),
            mode === "blocks" && (react_1["default"].createElement("button", { onClick: function () { return setSidebarCollapsed(!sidebarCollapsed); }, className: "hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background border rounded-r-md p-1 hover:bg-muted shadow-sm", style: { left: sidebarCollapsed ? 0 : 220 } }, sidebarCollapsed ? react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "h-3 w-3" }) : react_1["default"].createElement(lucide_react_1.ChevronLeft, { className: "h-3 w-3" }))),
            react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto", style: { background: mode === "blocks" ? "#f1f5f9" : undefined } },
                mode === "blocks" && (react_1["default"].createElement("div", { className: "flex justify-center py-6 px-4", onClick: function () { return setSelectedBlockId(null); } },
                    react_1["default"].createElement("div", { className: "bg-white rounded shadow-sm", style: { width: deviceWidth, maxWidth: (globalStyles.contentWidth || 800) + "px", minHeight: "500px" } }, blocks.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-[500px] text-muted-foreground" },
                        react_1["default"].createElement(lucide_react_1.LayoutGrid, { className: "h-14 w-14 mb-4 opacity-20" }),
                        react_1["default"].createElement("p", { className: "text-base font-medium mb-1" }, "Start building your document"),
                        react_1["default"].createElement("p", { className: "text-sm opacity-60 mb-6" }, "Click a block on the left sidebar to add it"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return addBlock("header"); } },
                                react_1["default"].createElement(lucide_react_1.PanelLeftClose, { className: "h-4 w-4 mr-1.5" }),
                                "Add Header"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return addBlock("text"); } },
                                react_1["default"].createElement(lucide_react_1.Type, { className: "h-4 w-4 mr-1.5" }),
                                "Add Text"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return addBlock("table"); } },
                                react_1["default"].createElement(lucide_react_1.Table, { className: "h-4 w-4 mr-1.5" }),
                                "Add Table")))) : (react_1["default"].createElement("div", { className: "p-3 space-y-1" },
                        blocks.map(function (block, idx) { return (react_1["default"].createElement(BlockRenderer, { key: block.id, block: block, selected: selectedBlockId === block.id, onSelect: function () { setSelectedBlockId(block.id); setSidebarTab("properties"); setMobilePanel("properties"); }, onUpdate: updateBlock, onDelete: function () { return deleteBlock(block.id); }, onDuplicate: function () { return duplicateBlock(block.id); }, onMoveUp: function () { return moveBlock(block.id, "up"); }, onMoveDown: function () { return moveBlock(block.id, "down"); }, isFirst: idx === 0, isLast: idx === blocks.length - 1 })); }),
                        react_1["default"].createElement("div", { className: "flex justify-center py-4" },
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-muted-foreground", onClick: function () { return setSidebarCollapsed(false); } },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1.5" }),
                                "Add Block"))))))),
                mode === "richtext" && (react_1["default"].createElement("div", { className: "p-4" },
                    react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: value, onChange: onChange, placeholder: placeholder || "Design your document template here...", minHeight: "500px", enhanced: true, variables: variables }))),
                mode === "code" && (react_1["default"].createElement("div", { className: "p-4 h-full" },
                    react_1["default"].createElement("textarea", { className: "w-full h-full min-h-[600px] rounded-md border bg-muted/30 px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30", value: codeValue, onChange: function (e) { return handleCodeChange(e.target.value); }, placeholder: "<!-- Enter your HTML document code here -->", spellCheck: false })))),
            mode === "blocks" && (react_1["default"].createElement("div", { className: utils_1.cn("w-[300px] border-l bg-background overflow-y-auto shrink-0", "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:bg-background max-lg:shadow-xl max-lg:border-l", mobilePanel === "properties" ? "max-lg:w-[300px]" : "max-lg:w-0 max-lg:overflow-hidden") },
                react_1["default"].createElement("div", { className: "flex border-b" },
                    react_1["default"].createElement("button", { onClick: function () { return setSidebarTab("properties"); }, className: utils_1.cn("flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors", sidebarTab === "properties" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground") },
                        react_1["default"].createElement(lucide_react_1.Settings2, { className: "h-3.5 w-3.5 inline mr-1" }),
                        "Properties"),
                    react_1["default"].createElement("button", { onClick: function () { return setSidebarTab("styles"); }, className: utils_1.cn("flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors", sidebarTab === "styles" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground") },
                        react_1["default"].createElement(lucide_react_1.Palette, { className: "h-3.5 w-3.5 inline mr-1" }),
                        "Styles")),
                sidebarTab === "styles" ? (react_1["default"].createElement(GlobalStylesPanel, { styles: globalStyles, onChange: setGlobalStyles })) : (renderPropertyEditor()),
                variables && variables.length > 0 && (react_1["default"].createElement("div", { className: "border-t mt-2 pt-3 px-3 pb-3" },
                    react_1["default"].createElement("h4", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Template Variables"),
                    react_1["default"].createElement("div", { className: "max-h-[200px] overflow-y-auto space-y-0.5" }, variables.map(function (v) { return (react_1["default"].createElement("button", { key: v.value, className: "w-full text-left px-2 py-1 text-[11px] rounded hover:bg-muted transition-colors flex items-center justify-between group", onClick: function () {
                            if (selectedBlock && ["text", "footer", "html", "heading"].includes(selectedBlock.type)) {
                                updateBlock(__assign(__assign({}, selectedBlock), { content: selectedBlock.content + v.value }));
                            }
                        }, title: "Insert " + v.value },
                        react_1["default"].createElement("span", { className: "truncate" }, v.label),
                        react_1["default"].createElement("code", { className: "text-[9px] text-muted-foreground group-hover:text-primary shrink-0 ml-1" }, v.value))); })))),
                attachments && attachments.length > 0 && (react_1["default"].createElement("div", { className: "border-t mt-2 pt-3 px-3 pb-3" },
                    react_1["default"].createElement("h4", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2" }, "Attachments"),
                    react_1["default"].createElement("div", { className: "space-y-1" }, attachments.map(function (a, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-2 px-2 py-1.5 text-xs rounded bg-muted/30" },
                        react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-3 w-3 shrink-0" }),
                        react_1["default"].createElement("span", { className: "truncate flex-1" }, a.name),
                        react_1["default"].createElement("span", { className: "text-muted-foreground text-[10px] shrink-0" }, a.size))); })))))))));
}
exports.DocumentBlockEditor = DocumentBlockEditor;
exports["default"] = DocumentBlockEditor;
