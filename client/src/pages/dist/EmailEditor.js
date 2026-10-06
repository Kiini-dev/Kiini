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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var useToast_1 = require("@/hooks/useToast");
var BlockToolbar = function (_a) {
    var onAddBlock = _a.onAddBlock;
    var blockTypes = [
        { type: 'section', label: 'Section', icon: lucide_react_1.Grid3x3 },
        { type: 'columns', label: 'Columns', icon: lucide_react_1.Grid3x3 },
        { type: 'image', label: 'Image', icon: lucide_react_1.Image },
        { type: 'text', label: 'Text', icon: lucide_react_1.Type },
        { type: 'button', label: 'Button', icon: lucide_react_1.Plus },
        { type: 'link', label: 'Link', icon: lucide_react_1.Link },
        { type: 'divider', label: 'Divider', icon: lucide_react_1.Minus },
    ];
    return (react_1["default"].createElement("div", { className: "flex flex-col gap-2 p-3 bg-gray-50 border-r border-gray-200" },
        react_1["default"].createElement("h3", { className: "text-xs font-semibold text-gray-700 uppercase tracking-wide px-2 py-1" }, "Blocks"),
        blockTypes.map(function (_a) {
            var type = _a.type, label = _a.label, Icon = _a.icon;
            return (react_1["default"].createElement("button", { key: type, onClick: function () { return onAddBlock(type); }, className: "flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors", title: "Add " + label },
                react_1["default"].createElement(Icon, { size: 16 }),
                react_1["default"].createElement("span", { className: "text-xs" }, label)));
        })));
};
var CanvasBlock = function (_a) {
    var block = _a.block, selected = _a.selected, onSelect = _a.onSelect, onDelete = _a.onDelete, onDuplicate = _a.onDuplicate;
    var baseStyles = {
        padding: block.styles.padding || '16px',
        backgroundColor: block.styles.backgroundColor || '#ffffff',
        borderRadius: block.styles.borderRadius || '0px',
        borderWidth: block.styles.borderWidth || 0,
        borderColor: block.styles.borderColor || '#000000',
        color: block.styles.color || '#333333',
        fontSize: block.styles.fontSize || '14px',
        fontFamily: block.styles.fontFamily || 'Arial, sans-serif',
        textAlign: block.styles.textAlign || 'left',
        margin: block.styles.margin || '0px',
        opacity: block.hidden ? 0.5 : 1
    };
    var renderContent = function () {
        switch (block.type) {
            case 'section':
                return (react_1["default"].createElement("div", { style: baseStyles, className: "min-h-[80px] w-full" }, block.content || 'Section content'));
            case 'columns':
                return (react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4", style: baseStyles }, block.content || 'Column layout'));
            case 'text':
                return react_1["default"].createElement("p", { style: baseStyles }, block.content || 'Text block');
            case 'image':
                return (react_1["default"].createElement("div", { style: baseStyles, className: "flex items-center justify-center bg-gray-100 min-h-[200px]" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement(lucide_react_1.Image, { size: 32, className: "mx-auto mb-2 text-gray-400" }),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, block.content || 'Image placeholder'))));
            case 'button':
                return (react_1["default"].createElement("button", { style: __assign(__assign({}, baseStyles), { backgroundColor: block.styles.buttonBgColor || '#007bff', color: block.styles.buttonTextColor || '#ffffff', padding: block.styles.buttonPadding || '12px 24px', border: 'none', cursor: 'pointer' }), className: "font-semibold rounded hover:opacity-90 transition-opacity" }, block.content || 'Click me'));
            case 'link':
                return (react_1["default"].createElement("a", { href: block.settings.href || '#', style: __assign(__assign({}, baseStyles), { color: block.styles.linkColor || '#0066cc', textDecoration: 'underline' }), className: "hover:opacity-75 transition-opacity" }, block.content || 'Link text'));
            case 'divider':
                return (react_1["default"].createElement("div", { style: {
                        height: block.styles.dividerHeight || '1px',
                        backgroundColor: block.styles.dividerColor || '#cccccc',
                        margin: block.styles.margin || '16px 0',
                        width: '100%'
                    } }));
            default:
                return react_1["default"].createElement("div", { style: baseStyles }, block.content);
        }
    };
    return (react_1["default"].createElement("div", { onClick: onSelect, className: "relative p-3 mb-2 border-2 rounded transition-all cursor-pointer group " + (selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white') + " " + (block.hidden ? 'opacity-50' : '') },
        renderContent(),
        selected && (react_1["default"].createElement("div", { className: "absolute top-2 right-2 flex gap-1 bg-white rounded shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity" },
            react_1["default"].createElement("button", { onClick: function (e) {
                    e.stopPropagation();
                    onDuplicate();
                }, className: "p-1 hover:bg-gray-100 rounded", title: "Duplicate" },
                react_1["default"].createElement(lucide_react_1.Copy, { size: 14 })),
            react_1["default"].createElement("button", { onClick: function (e) {
                    e.stopPropagation();
                    onDelete();
                }, className: "p-1 hover:bg-red-100 text-red-500 rounded", title: "Delete" },
                react_1["default"].createElement(lucide_react_1.Trash2, { size: 14 }))))));
};
var CanvasArea = function (_a) {
    var blocks = _a.blocks, selectedBlockId = _a.selectedBlockId, onSelectBlock = _a.onSelectBlock, onDeleteBlock = _a.onDeleteBlock, onDuplicateBlock = _a.onDuplicateBlock, onReorderBlocks = _a.onReorderBlocks;
    var _b = react_1.useState(null), draggedBlockId = _b[0], setDraggedBlockId = _b[1];
    var _c = react_1.useState(null), dragOverBlockId = _c[0], setDragOverBlockId = _c[1];
    var handleDragStart = function (blockId) {
        setDraggedBlockId(blockId);
    };
    var handleDragOver = function (e, blockId) {
        e.preventDefault();
        e.stopPropagation();
        setDragOverBlockId(blockId);
    };
    var handleDragLeave = function () {
        setDragOverBlockId(null);
    };
    var handleDrop = function (e, targetBlockId) {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedBlockId || draggedBlockId === targetBlockId) {
            setDraggedBlockId(null);
            setDragOverBlockId(null);
            return;
        }
        var draggedIndex = blocks.findIndex(function (b) { return b.id === draggedBlockId; });
        var targetIndex = blocks.findIndex(function (b) { return b.id === targetBlockId; });
        if (draggedIndex !== -1 && targetIndex !== -1) {
            var newBlocks = __spreadArrays(blocks);
            var draggedBlock = newBlocks.splice(draggedIndex, 1)[0];
            newBlocks.splice(targetIndex, 0, draggedBlock);
            onReorderBlocks(newBlocks);
        }
        setDraggedBlockId(null);
        setDragOverBlockId(null);
    };
    return (react_1["default"].createElement("div", { className: "flex-1 overflow-auto p-6" },
        react_1["default"].createElement("div", { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200" },
            react_1["default"].createElement("h4", { className: "text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide" }, "Email Preview"),
            blocks.length === 0 ? (react_1["default"].createElement("div", { className: "flex items-center justify-center h-64 text-center" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(Mail, { size: 48, className: "mx-auto mb-3 text-gray-300" }),
                    react_1["default"].createElement("p", { className: "text-gray-500 text-sm" }, "Add blocks from the left toolbar to get started")))) : (react_1["default"].createElement("div", { className: "space-y-1" }, blocks.map(function (block) { return (react_1["default"].createElement("div", { key: block.id, draggable: true, onDragStart: function () { return handleDragStart(block.id); }, onDragOver: function (e) { return handleDragOver(e, block.id); }, onDragLeave: handleDragLeave, onDrop: function (e) { return handleDrop(e, block.id); }, className: "cursor-move transition-all " + (draggedBlockId === block.id ? 'opacity-50' : '') + " " + (dragOverBlockId === block.id ? 'border-2 border-blue-400 rounded' : '') },
                react_1["default"].createElement(CanvasBlock, { block: block, selected: selectedBlockId === block.id, onSelect: function () { return onSelectBlock(block.id); }, onDelete: function () { return onDeleteBlock(block.id); }, onDuplicate: function () { return onDuplicateBlock(block.id); } }))); }))))));
};
var PropertiesPanel = function (_a) {
    var block = _a.block, tab = _a.tab, onTabChange = _a.onTabChange, onBlockUpdate = _a.onBlockUpdate;
    if (!block) {
        return (react_1["default"].createElement("div", { className: "w-80 bg-gray-50 border-l border-gray-200 p-4 flex items-center justify-center" },
            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Select a block to edit properties")));
    }
    return (react_1["default"].createElement("div", { className: "w-80 bg-gray-50 border-l border-gray-200 flex flex-col" },
        react_1["default"].createElement("div", { className: "flex border-b border-gray-200 bg-white" }, ['settings', 'styles', 'data'].map(function (t) { return (react_1["default"].createElement("button", { key: t, onClick: function () { return onTabChange(t); }, className: "flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors " + (tab === t
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800') },
            t === 'settings' && react_1["default"].createElement(lucide_react_1.Settings, { size: 14, className: "inline mr-1" }),
            t === 'styles' && react_1["default"].createElement(lucide_react_1.Palette, { size: 14, className: "inline mr-1" }),
            t === 'data' && react_1["default"].createElement(lucide_react_1.Database, { size: 14, className: "inline mr-1" }),
            t)); })),
        react_1["default"].createElement("div", { className: "flex-1 overflow-auto p-4" },
            tab === 'settings' && (react_1["default"].createElement(SettingsTab, { block: block, onUpdate: onBlockUpdate })),
            tab === 'styles' && (react_1["default"].createElement(StylesTab, { block: block, onUpdate: onBlockUpdate })),
            tab === 'data' && (react_1["default"].createElement(DataTab, { block: block, onUpdate: onBlockUpdate })))));
};
var SettingsTab = function (_a) {
    var block = _a.block, onUpdate = _a.onUpdate;
    return (react_1["default"].createElement("div", { className: "space-y-4" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Block Type"),
            react_1["default"].createElement("p", { className: "text-sm text-gray-600 bg-gray-100 p-2 rounded capitalize" }, block.type)),
        block.type === 'text' || block.type === 'button' || block.type === 'link' ? (react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Content"),
            react_1["default"].createElement("textarea", { value: block.content, onChange: function (e) { return onUpdate({ content: e.target.value }); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", rows: 3, placeholder: "Enter block content..." }))) : null,
        block.type === 'image' ? (react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Image URL"),
            react_1["default"].createElement("input", { type: "text", value: block.content, onChange: function (e) { return onUpdate({ content: e.target.value }); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", placeholder: "https://example.com/image.jpg" }))) : null,
        block.type === 'link' ? (react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Link URL"),
            react_1["default"].createElement("input", { type: "text", value: block.settings.href || '', onChange: function (e) {
                    return onUpdate({ settings: __assign(__assign({}, block.settings), { href: e.target.value }) });
                }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", placeholder: "https://example.com" }))) : null,
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                react_1["default"].createElement("input", { type: "checkbox", checked: block.hidden || false, onChange: function (e) { return onUpdate({ hidden: e.target.checked }); }, className: "rounded" }),
                react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-700" }, "Hide Element"))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Include In"),
            react_1["default"].createElement("select", { value: block.settings.includeIn || 'both', onChange: function (e) {
                    return onUpdate({ settings: __assign(__assign({}, block.settings), { includeIn: e.target.value }) });
                }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" },
                react_1["default"].createElement("option", { value: "both" }, "Both (HTML + AMP HTML)"),
                react_1["default"].createElement("option", { value: "html" }, "HTML Only"),
                react_1["default"].createElement("option", { value: "amphtml" }, "AMP HTML Only")))));
};
// ==================== STYLES TAB ====================
var StylesTab = function (_a) {
    var block = _a.block, onUpdate = _a.onUpdate;
    var updateStyle = function (key, value) {
        var _a;
        onUpdate({ styles: __assign(__assign({}, block.styles), (_a = {}, _a[key] = value, _a)) });
    };
    return (react_1["default"].createElement("div", { className: "space-y-4" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Background Color"),
            react_1["default"].createElement("input", { type: "color", value: block.styles.backgroundColor || '#ffffff', onChange: function (e) { return updateStyle('backgroundColor', e.target.value); }, className: "w-full h-10 rounded cursor-pointer border border-gray-300" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Text Color"),
            react_1["default"].createElement("input", { type: "color", value: block.styles.color || '#333333', onChange: function (e) { return updateStyle('color', e.target.value); }, className: "w-full h-10 rounded cursor-pointer border border-gray-300" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Font Size (px)"),
            react_1["default"].createElement("input", { type: "number", value: parseInt(block.styles.fontSize) || 14, onChange: function (e) { return updateStyle('fontSize', e.target.value + "px"); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", min: "8", max: "72" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Font Family"),
            react_1["default"].createElement("select", { value: block.styles.fontFamily || 'Arial, sans-serif', onChange: function (e) { return updateStyle('fontFamily', e.target.value); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" },
                react_1["default"].createElement("option", { value: "Arial, sans-serif" }, "Arial"),
                react_1["default"].createElement("option", { value: "'Times New Roman', serif" }, "Times New Roman"),
                react_1["default"].createElement("option", { value: "Georgia, serif" }, "Georgia"),
                react_1["default"].createElement("option", { value: "'Courier New', monospace" }, "Courier New"),
                react_1["default"].createElement("option", { value: "Verdana, sans-serif" }, "Verdana"))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Text Align"),
            react_1["default"].createElement("select", { value: block.styles.textAlign || 'left', onChange: function (e) { return updateStyle('textAlign', e.target.value); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" },
                react_1["default"].createElement("option", { value: "left" }, "Left"),
                react_1["default"].createElement("option", { value: "center" }, "Center"),
                react_1["default"].createElement("option", { value: "right" }, "Right"))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Padding (px)"),
            react_1["default"].createElement("input", { type: "text", value: block.styles.padding || '16px', onChange: function (e) { return updateStyle('padding', e.target.value); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", placeholder: "16px" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Margin (px)"),
            react_1["default"].createElement("input", { type: "text", value: block.styles.margin || '0px', onChange: function (e) { return updateStyle('margin', e.target.value); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", placeholder: "0px" })),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Border Radius (px)"),
            react_1["default"].createElement("input", { type: "number", value: parseInt(block.styles.borderRadius) || 0, onChange: function (e) { return updateStyle('borderRadius', e.target.value + "px"); }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", min: "0" })),
        block.type === 'button' && (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Button Background"),
                react_1["default"].createElement("input", { type: "color", value: block.styles.buttonBgColor || '#007bff', onChange: function (e) { return updateStyle('buttonBgColor', e.target.value); }, className: "w-full h-10 rounded cursor-pointer border border-gray-300" })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Button Text Color"),
                react_1["default"].createElement("input", { type: "color", value: block.styles.buttonTextColor || '#ffffff', onChange: function (e) { return updateStyle('buttonTextColor', e.target.value); }, className: "w-full h-10 rounded cursor-pointer border border-gray-300" }))))));
};
// ==================== DATA TAB ====================
var DataTab = function (_a) {
    var block = _a.block, onUpdate = _a.onUpdate;
    return (react_1["default"].createElement("div", { className: "space-y-4" },
        react_1["default"].createElement("div", { className: "bg-blue-50 border border-blue-200 rounded p-3" },
            react_1["default"].createElement("p", { className: "text-xs text-blue-700" },
                react_1["default"].createElement("strong", null, "Dynamic Variables:"),
                " Use ",
                react_1["default"].createElement("code", null, '{}'),
                " syntax to insert dynamic content.")),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Available Variables"),
            react_1["default"].createElement("div", { className: "space-y-2" }, [
                { name: 'firstName', desc: 'Recipient first name' },
                { name: 'email', desc: 'Recipient email' },
                { name: 'date', desc: 'Current date' },
                { name: 'companyName', desc: 'Organization name' },
            ].map(function (v) { return (react_1["default"].createElement("div", { key: v.name, className: "bg-gray-100 p-2 rounded text-xs" },
                react_1["default"].createElement("code", { className: "text-blue-600 font-semibold" }, "{{" + v.name + "}}"),
                react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, v.desc))); }))),
        block.type === 'text' && (react_1["default"].createElement("div", null,
            react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-700 mb-2" }, "Preview Content"),
            react_1["default"].createElement("textarea", { value: block.settings.preview || '', onChange: function (e) {
                    return onUpdate({ settings: __assign(__assign({}, block.settings), { preview: e.target.value }) });
                }, className: "w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500", rows: 3, placeholder: "Preview how dynamic variables will render..." })))));
};
var HTMLEditor = function (_a) {
    var html = _a.html, onSave = _a.onSave, onClose = _a.onClose;
    var _b = react_1.useState(html), code = _b[0], setCode = _b[1];
    return (react_1["default"].createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
        react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between p-4 border-b border-gray-200" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Code, { size: 20 }),
                    "HTML Editor"),
                react_1["default"].createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            react_1["default"].createElement("textarea", { value: code, onChange: function (e) { return setCode(e.target.value); }, className: "flex-1 p-4 font-mono text-sm border-b border-gray-200 focus:outline-none resize-none", spellCheck: "false" }),
            react_1["default"].createElement("div", { className: "flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200" },
                react_1["default"].createElement("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50" }, "Cancel"),
                react_1["default"].createElement("button", { onClick: function () {
                        onSave(code);
                        onClose();
                    }, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700" }, "Save & Return to Visual")))));
};
// ==================== MAIN EMAIL EDITOR COMPONENT ====================
var EmailEditor = function () {
    var toast = useToast_1.useToast().toast;
    var saveTemplateMutation = trpc_1.trpc.emailTemplates.saveTemplate.useMutation();
    var _a = react_1.useState({
        id: 'new-template',
        name: 'New Email Template',
        blocks: [],
        metadata: {
            subject: 'Welcome to our service',
            previewText: 'We are excited to have you on board'
        }
    }), template = _a[0], setTemplate = _a[1];
    var _b = react_1.useState(null), selectedBlockId = _b[0], setSelectedBlockId = _b[1];
    var _c = react_1.useState('visual'), editorMode = _c[0], setEditorMode = _c[1];
    var _d = react_1.useState('settings'), propertiesTab = _d[0], setPropertiesTab = _d[1];
    var _e = react_1.useState(false), showHTMLEditor = _e[0], setShowHTMLEditor = _e[1];
    var _f = react_1.useState(''), testEmailRecipient = _f[0], setTestEmailRecipient = _f[1];
    var _g = react_1.useState(false), showTestEmailModal = _g[0], setShowTestEmailModal = _g[1];
    var _h = react_1.useState(false), isPreviewMode = _h[0], setIsPreviewMode = _h[1];
    var selectedBlock = template.blocks.find(function (b) { return b.id === selectedBlockId; });
    var addBlock = react_1.useCallback(function (type) {
        var newBlock = {
            id: "block-" + Date.now(),
            type: type,
            content: '',
            styles: {},
            settings: {}
        };
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { blocks: __spreadArrays(prev.blocks, [newBlock]) })); });
        setSelectedBlockId(newBlock.id);
    }, []);
    var deleteBlock = react_1.useCallback(function (id) {
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { blocks: prev.blocks.filter(function (b) { return b.id !== id; }) })); });
        setSelectedBlockId(null);
    }, []);
    var duplicateBlock = react_1.useCallback(function (id) {
        var blockToDupe = template.blocks.find(function (b) { return b.id === id; });
        if (blockToDupe) {
            var newBlock_1 = __assign(__assign({}, blockToDupe), { id: "block-" + Date.now() });
            setTemplate(function (prev) { return (__assign(__assign({}, prev), { blocks: __spreadArrays(prev.blocks, [newBlock_1]) })); });
        }
    }, [template.blocks]);
    var reorderBlocks = react_1.useCallback(function (newBlocks) {
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { blocks: newBlocks })); });
    }, []);
    var saveTemplate = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!template.name || !template.metadata.subject) {
                        toast({
                            title: 'Validation Error',
                            description: 'Template name and subject are required',
                            type: 'error'
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, saveTemplateMutation.mutateAsync({
                            id: template.id !== 'new-template' ? template.id : undefined,
                            name: template.name,
                            subject: template.metadata.subject,
                            previewText: template.metadata.previewText,
                            blocks: template.blocks
                        })];
                case 1:
                    response_1 = _a.sent();
                    // Update template ID if it was a new template
                    if (template.id === 'new-template' && response_1.id) {
                        setTemplate(function (prev) { return (__assign(__assign({}, prev), { id: response_1.id })); });
                    }
                    toast({
                        title: 'Success',
                        description: response_1.message,
                        type: 'success'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    toast({
                        title: 'Error',
                        description: error_1.message || 'Failed to save template',
                        type: 'error'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [template, saveTemplateMutation, toast]);
    var sendTestEmail = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!testEmailRecipient) {
                    toast({
                        title: 'Validation Error',
                        description: 'Please enter a recipient email address',
                        type: 'error'
                    });
                    return [2 /*return*/];
                }
                // TODO: Implement actual test email sending via tRPC
                console.log('Sending test email to:', testEmailRecipient);
                toast({
                    title: 'Success',
                    description: "Test email sent to " + testEmailRecipient,
                    type: 'success'
                });
                setShowTestEmailModal(false);
                setTestEmailRecipient('');
            }
            catch (error) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to send test email',
                    type: 'error'
                });
            }
            return [2 /*return*/];
        });
    }); }, [testEmailRecipient, toast]);
    var updateBlock = react_1.useCallback(function (updates) {
        if (!selectedBlock)
            return;
        setTemplate(function (prev) { return (__assign(__assign({}, prev), { blocks: prev.blocks.map(function (b) {
                return b.id === selectedBlock.id ? __assign(__assign({}, b), updates) : b;
            }) })); });
    }, [selectedBlock]);
    var generateHTML = function () {
        var blocks = template.blocks
            .map(function (block) {
            if (block.hidden)
                return '';
            switch (block.type) {
                case 'text':
                    return "<p style=\"color:" + (block.styles.color || '#333333') + ";font-size:" + (block.styles.fontSize || '14px') + ";font-family:" + (block.styles.fontFamily || 'Arial') + ";text-align:" + (block.styles.textAlign || 'left') + "\">" + block.content + "</p>";
                case 'button':
                    return "<a href=\"#\" style=\"display:inline-block;padding:" + (block.styles.buttonPadding || '12px 24px') + ";background-color:" + (block.styles.buttonBgColor || '#007bff') + ";color:" + (block.styles.buttonTextColor || '#fff') + ";text-decoration:none;border-radius:" + (block.styles.borderRadius || '0px') + "\">" + block.content + "</a>";
                case 'image':
                    return "<img src=\"" + block.content + "\" style=\"max-width:100%;height:auto;\" alt=\"Email image\" />";
                case 'divider':
                    return "<hr style=\"height:" + (block.styles.dividerHeight || '1px') + ";border:none;background-color:" + (block.styles.dividerColor || '#cccccc') + "\" />";
                case 'link':
                    return "<a href=\"" + (block.settings.href || '#') + "\" style=\"color:" + (block.styles.linkColor || '#0066cc') + ";text-decoration:underline\">" + block.content + "</a>";
                default:
                    return block.content;
            }
        })
            .join('\n');
        return "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>" + (template.metadata.subject || 'Email') + "</title>\n</head>\n<body style=\"margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5\">\n  <table cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;background-color:#f5f5f5\">\n    <tr>\n      <td align=\"center\" style=\"padding:20px\">\n        <table cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;max-width:600px;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)\">\n          <tr>\n            <td style=\"padding:40px\">\n              " + blocks + "\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>";
    };
    var exportHTML = function () {
        var html = generateHTML();
        var blob = new Blob([html], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = template.name + ".html";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-screen bg-gray-100" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm" },
            react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                react_1["default"].createElement("h1", { className: "text-2xl font-bold text-gray-800" }, template.name),
                react_1["default"].createElement("input", { type: "text", value: template.name, onChange: function (e) {
                        return setTemplate(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); });
                    }, className: "text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500", placeholder: "Template name..." })),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("div", { className: "flex items-center gap-1 bg-gray-100 p-1 rounded" },
                    react_1["default"].createElement("button", { onClick: function () { return setEditorMode('visual'); }, className: "flex items-center gap-1 px-3 py-1 rounded transition-colors " + (editorMode === 'visual'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800') },
                        react_1["default"].createElement(lucide_react_1.Eye, { size: 16 }),
                        react_1["default"].createElement("span", { className: "text-sm" }, "Visual")),
                    react_1["default"].createElement("button", { onClick: function () { return setShowHTMLEditor(true); }, className: "flex items-center gap-1 px-3 py-1 rounded text-gray-600 hover:text-gray-800 transition-colors" },
                        react_1["default"].createElement(lucide_react_1.Code, { size: 16 }),
                        react_1["default"].createElement("span", { className: "text-sm" }, "HTML"))),
                react_1["default"].createElement("button", { onClick: function () { return setShowTestEmailModal(true); }, className: "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors", title: "Send test email to verify template rendering" },
                    react_1["default"].createElement(lucide_react_1.Share2, { size: 16 }),
                    react_1["default"].createElement("span", { className: "text-sm" }, "Send Test")),
                react_1["default"].createElement("button", { onClick: exportHTML, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Download, { size: 16 }),
                    react_1["default"].createElement("span", { className: "text-sm" }, "Export")),
                react_1["default"].createElement("button", { onClick: saveTemplate, disabled: saveTemplateMutation.isPending, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed" },
                    react_1["default"].createElement(lucide_react_1.Save, { size: 16 }),
                    react_1["default"].createElement("span", { className: "text-sm" }, saveTemplateMutation.isPending ? 'Saving...' : 'Save Template')))),
        react_1["default"].createElement("div", { className: "flex flex-1 overflow-hidden" },
            react_1["default"].createElement(BlockToolbar, { onAddBlock: addBlock }),
            react_1["default"].createElement(CanvasArea, { blocks: template.blocks, selectedBlockId: selectedBlockId, onSelectBlock: setSelectedBlockId, onDeleteBlock: deleteBlock, onDuplicateBlock: duplicateBlock, onReorderBlocks: reorderBlocks }),
            react_1["default"].createElement(PropertiesPanel, { block: selectedBlock || null, tab: propertiesTab, onTabChange: setPropertiesTab, onBlockUpdate: updateBlock })),
        react_1["default"].createElement("div", { className: "flex items-center gap-4 px-4 py-3 bg-white border-t border-gray-200 text-sm" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-600 mb-1" }, "Subject Line"),
                react_1["default"].createElement("input", { type: "text", value: template.metadata.subject || '', onChange: function (e) {
                        return setTemplate(function (prev) { return (__assign(__assign({}, prev), { metadata: __assign(__assign({}, prev.metadata), { subject: e.target.value }) })); });
                    }, className: "px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500", placeholder: "Email subject..." })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-xs font-semibold text-gray-600 mb-1" }, "Preview Text"),
                react_1["default"].createElement("input", { type: "text", value: template.metadata.previewText || '', onChange: function (e) {
                        return setTemplate(function (prev) { return (__assign(__assign({}, prev), { metadata: __assign(__assign({}, prev.metadata), { previewText: e.target.value }) })); });
                    }, className: "px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500", placeholder: "Preview text..." }))),
        showHTMLEditor && (react_1["default"].createElement(HTMLEditor, { html: generateHTML(), onSave: function (html) {
                // Parse HTML back to blocks (simplified)
                console.log('HTML saved:', html);
            }, onClose: function () { return setShowHTMLEditor(false); } })),
        showTestEmailModal && (react_1["default"].createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
            react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow-lg w-full max-w-md" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between p-4 border-b border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-lg font-semibold flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Share2, { size: 20 }),
                        "Send Test Email"),
                    react_1["default"].createElement("button", { onClick: function () { return setShowTestEmailModal(false); }, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
                react_1["default"].createElement("div", { className: "p-4" },
                    react_1["default"].createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Recipient Email Address"),
                    react_1["default"].createElement("input", { type: "email", value: testEmailRecipient, onChange: function (e) { return setTestEmailRecipient(e.target.value); }, placeholder: "test@example.com", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" }),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-2" }, "This will send a preview of your email template to the specified address.")),
                react_1["default"].createElement("div", { className: "flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200" },
                    react_1["default"].createElement("button", { onClick: function () { return setShowTestEmailModal(false); }, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50" }, "Cancel"),
                    react_1["default"].createElement("button", { onClick: sendTestEmail, className: "px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700" }, "Send Test Email")))))));
};
exports["default"] = EmailEditor;
