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
exports.DocumentManagementUI = void 0;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var lucide_react_1 = require("lucide-react");
/**
 * Document Management System UI
 * Handles file uploads, organization, sharing, and version control
 */
function DocumentManagementUI() {
    var _a = react_1.useState([
        {
            id: '1',
            name: 'Invoices',
            description: 'All invoice documents',
            createdAt: new Date(),
            documentCount: 45
        },
        {
            id: '2',
            name: 'Policies',
            description: 'Company policies and compliance docs',
            createdAt: new Date(),
            documentCount: 12
        },
        {
            id: '3',
            name: 'Contracts',
            description: 'Client and vendor contracts',
            createdAt: new Date(),
            documentCount: 23
        },
    ]), folders = _a[0], setFolders = _a[1];
    var _b = react_1.useState([
        {
            id: 'doc1',
            name: 'Invoice_Q1_2026.pdf',
            type: 'application/pdf',
            size: 2.4,
            uploadedBy: 'John Doe',
            uploadedAt: new Date('2026-03-20'),
            folderId: '1',
            isShared: false,
            permissions: 'admin'
        },
        {
            id: 'doc2',
            name: 'Data_Retention_Policy.docx',
            type: 'application/msword',
            size: 0.8,
            uploadedBy: 'Jane Smith',
            uploadedAt: new Date('2026-03-15'),
            folderId: '2',
            isShared: true,
            permissions: 'view'
        },
    ]), documents = _b[0], setDocuments = _b[1];
    var _c = react_1.useState(null), selectedFolder = _c[0], setSelectedFolder = _c[1];
    var _d = react_1.useState(new Set()), selectedDocuments = _d[0], setSelectedDocuments = _d[1];
    var _e = react_1.useState(false), showNewFolderDialog = _e[0], setShowNewFolderDialog = _e[1];
    var _f = react_1.useState(''), newFolderName = _f[0], setNewFolderName = _f[1];
    var _g = react_1.useState(''), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = react_dropzone_1.useDropzone({
        onDrop: handleFileDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls', '.xlsx']
        }
    }), getRootProps = _h.getRootProps, getInputProps = _h.getInputProps, isDragActive = _h.isDragActive;
    function handleFileDrop(acceptedFiles) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, acceptedFiles_1, file, newDoc;
            return __generator(this, function (_a) {
                for (_i = 0, acceptedFiles_1 = acceptedFiles; _i < acceptedFiles_1.length; _i++) {
                    file = acceptedFiles_1[_i];
                    newDoc = {
                        id: "doc-" + Date.now(),
                        name: file.name,
                        type: file.type,
                        size: file.size / (1024 * 1024),
                        uploadedBy: 'Current User',
                        uploadedAt: new Date(),
                        folderId: selectedFolder || '1',
                        isShared: false,
                        permissions: 'admin'
                    };
                    setDocuments(__spreadArrays(documents, [newDoc]));
                }
                return [2 /*return*/];
            });
        });
    }
    function handleCreateFolder() {
        if (!newFolderName.trim())
            return;
        var newFolder = {
            id: "folder-" + Date.now(),
            name: newFolderName,
            createdAt: new Date(),
            documentCount: 0
        };
        setFolders(__spreadArrays(folders, [newFolder]));
        setNewFolderName('');
        setShowNewFolderDialog(false);
    }
    var filteredDocuments = documents.filter(function (doc) {
        return (!selectedFolder || doc.folderId === selectedFolder) &&
            doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return (react_1["default"].createElement("div", { className: "h-full flex flex-col bg-white" },
        react_1["default"].createElement("div", { className: "border-b p-6" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Document Management"),
            react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, "Organize, share, and manage your organization's documents")),
        react_1["default"].createElement("div", { className: "flex flex-1" },
            react_1["default"].createElement("div", { className: "w-64 border-r bg-gray-50 p-4 overflow-y-auto" },
                react_1["default"].createElement("button", { onClick: function () { return setShowNewFolderDialog(true); }, className: "w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" },
                    react_1["default"].createElement(lucide_react_1.FolderPlus, { size: 18 }),
                    "New Folder"),
                react_1["default"].createElement("div", { className: "mt-6 space-y-2" },
                    react_1["default"].createElement("button", { onClick: function () { return setSelectedFolder(null); }, className: "w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition " + (selectedFolder === null ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200') },
                        react_1["default"].createElement(lucide_react_1.Folder, { size: 18 }),
                        "All Documents"),
                    folders.map(function (folder) { return (react_1["default"].createElement("button", { key: folder.id, onClick: function () { return setSelectedFolder(folder.id); }, className: "w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition " + (selectedFolder === folder.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200') },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Folder, { size: 18 }),
                            react_1["default"].createElement("span", { className: "truncate" }, folder.name)),
                        react_1["default"].createElement("span", { className: "text-xs bg-gray-200 px-2 py-1 rounded" }, folder.documentCount))); }))),
            react_1["default"].createElement("div", { className: "flex-1 flex flex-col" },
                react_1["default"].createElement("div", { className: "border-b p-6 bg-gray-50" },
                    react_1["default"].createElement("div", { className: "flex gap-4" },
                        react_1["default"].createElement("input", { type: "text", placeholder: "Search documents...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }),
                        selectedDocuments.size > 0 && (react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" },
                                react_1["default"].createElement(lucide_react_1.Share2, { size: 18, className: "inline mr-2" }),
                                "Share (",
                                selectedDocuments.size,
                                ")"),
                            react_1["default"].createElement("button", { className: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" },
                                react_1["default"].createElement(lucide_react_1.Trash2, { size: 18, className: "inline mr-2" }),
                                "Delete"))))),
                filteredDocuments.length === 0 && selectedDocuments.size === 0 ? (react_1["default"].createElement("div", __assign({}, getRootProps(), { className: "flex-1 flex items-center justify-center border-2 border-dashed m-6 rounded-lg cursor-pointer transition " + (isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400') }),
                    react_1["default"].createElement("input", __assign({}, getInputProps())),
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement(lucide_react_1.Upload, { size: 48, className: "mx-auto text-gray-400 mb-4" }),
                        react_1["default"].createElement("p", { className: "text-xl font-semibold text-gray-700" }, isDragActive ? 'Drop files here' : 'Drag documents here to upload'),
                        react_1["default"].createElement("p", { className: "text-gray-500" }, "or click to select files")))) : (react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-6" },
                    react_1["default"].createElement("div", { className: "space-y-2" }, filteredDocuments.map(function (doc) { return (react_1["default"].createElement("div", { key: doc.id, className: "flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition" },
                        react_1["default"].createElement("input", { type: "checkbox", checked: selectedDocuments.has(doc.id), onChange: function (e) {
                                var newSelected = new Set(selectedDocuments);
                                if (e.target.checked) {
                                    newSelected.add(doc.id);
                                }
                                else {
                                    newSelected["delete"](doc.id);
                                }
                                setSelectedDocuments(newSelected);
                            }, className: "w-5 h-5" }),
                        react_1["default"].createElement(lucide_react_1.FileText, { size: 24, className: "text-gray-400" }),
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("p", { className: "font-semibold text-gray-900" }, doc.name),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" },
                                doc.size.toFixed(1),
                                " MB \u2022 ",
                                doc.uploadedBy,
                                " \u2022 ",
                                doc.uploadedAt.toLocaleDateString())),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            doc.isShared && react_1["default"].createElement(lucide_react_1.Check, { size: 18, className: "text-green-500" }),
                            react_1["default"].createElement("button", { className: "p-2 hover:bg-gray-200 rounded transition" },
                                react_1["default"].createElement(lucide_react_1.Eye, { size: 18, className: "text-gray-400" })),
                            react_1["default"].createElement("button", { className: "p-2 hover:bg-gray-200 rounded transition" },
                                react_1["default"].createElement(lucide_react_1.Download, { size: 18, className: "text-gray-400" })),
                            react_1["default"].createElement("button", { className: "p-2 hover:bg-gray-200 rounded transition" },
                                react_1["default"].createElement(lucide_react_1.MoreVertical, { size: 18, className: "text-gray-400" }))))); })))))),
        showNewFolderDialog && (react_1["default"].createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50" },
            react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 w-96" },
                react_1["default"].createElement("h2", { className: "text-xl font-bold mb-4" }, "Create New Folder"),
                react_1["default"].createElement("input", { type: "text", placeholder: "Folder name", value: newFolderName, onChange: function (e) { return setNewFolderName(e.target.value); }, className: "w-full px-4 py-2 border rounded-lg mb-4" }),
                react_1["default"].createElement("div", { className: "flex gap-4" },
                    react_1["default"].createElement("button", { onClick: function () { return setShowNewFolderDialog(false); }, className: "flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50" }, "Cancel"),
                    react_1["default"].createElement("button", { onClick: handleCreateFolder, className: "flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" }, "Create")))))));
}
exports.DocumentManagementUI = DocumentManagementUI;
