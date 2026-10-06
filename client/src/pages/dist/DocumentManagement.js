"use strict";
exports.__esModule = true;
exports.DocumentManagement = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var tabs_1 = require("@/components/ui/tabs");
var sonner_1 = require("sonner");
var DOC_TYPES = ['all', 'contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other'];
var STATUS_OPTIONS = ['active', 'archived', 'deleted'];
var typeColors = {
    contract: "bg-blue-100 text-blue-700",
    agreement: "bg-green-100 text-green-700",
    proposal: "bg-purple-100 text-purple-700",
    template: "bg-amber-100 text-amber-700",
    invoice: "bg-orange-100 text-orange-700",
    receipt: "bg-emerald-100 text-emerald-700",
    other: "bg-slate-100 text-slate-700"
};
function formatBytes(bytes) {
    if (!bytes || bytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}
function timeAgo(dateStr) {
    if (!dateStr)
        return '—';
    var d = new Date(dateStr);
    var diff = Date.now() - d.getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1)
        return 'Just now';
    if (mins < 60)
        return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    if (days < 30)
        return days + "d ago";
    return d.toLocaleDateString();
}
function DocumentManagement() {
    var _a, _b;
    var _c = react_1.useState(''), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState('all'), activeType = _d[0], setActiveType = _d[1];
    var _e = react_1.useState(false), showUpload = _e[0], setShowUpload = _e[1];
    var _f = react_1.useState(false), showOCR = _f[0], setShowOCR = _f[1];
    var _g = react_1.useState(null), ocrDocId = _g[0], setOcrDocId = _g[1];
    var _h = react_1.useState(null), ocrResult = _h[0], setOcrResult = _h[1];
    var _j = react_1.useState(false), showEdit = _j[0], setShowEdit = _j[1];
    var _k = react_1.useState(null), editDoc = _k[0], setEditDoc = _k[1];
    var _l = react_1.useState(''), editName = _l[0], setEditName = _l[1];
    var _m = react_1.useState('other'), editType = _m[0], setEditType = _m[1];
    var _o = react_1.useState('active'), editStatus = _o[0], setEditStatus = _o[1];
    var _p = react_1.useState(false), showDeleteConfirm = _p[0], setShowDeleteConfirm = _p[1];
    var _q = react_1.useState(null), deleteDocId = _q[0], setDeleteDocId = _q[1];
    var _r = react_1.useState(false), showVersions = _r[0], setShowVersions = _r[1];
    var _s = react_1.useState(null), versionDocId = _s[0], setVersionDocId = _s[1];
    // Upload form
    var _t = react_1.useState(''), uploadName = _t[0], setUploadName = _t[1];
    var _u = react_1.useState('other'), uploadType = _u[0], setUploadType = _u[1];
    var _v = react_1.useState(''), uploadTags = _v[0], setUploadTags = _v[1];
    var _w = react_1.useState(null), uploadFile = _w[0], setUploadFile = _w[1];
    var _x = react_1.useState(''), uploadProgress = _x[0], setUploadProgress = _x[1];
    var queryInput = react_1.useMemo(function () { return ({
        documentType: activeType === 'all' ? undefined : activeType,
        limit: 100,
        search: searchQuery || undefined
    }); }, [activeType, searchQuery]);
    var _y = trpc_1.trpc.fileStorage.listDocuments.useQuery(queryInput), data = _y.data, isLoading = _y.isLoading, refetch = _y.refetch;
    var uploadMut = trpc_1.trpc.fileStorage.uploadDocument.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Document uploaded successfully");
            setShowUpload(false);
            setUploadName('');
            setUploadType('other');
            setUploadTags('');
            setUploadFile(null);
            setUploadProgress('');
            refetch();
        },
        onError: function (err) {
            sonner_1.toast.error("Upload failed: " + err.message);
            setUploadProgress('');
        }
    });
    var updateMut = trpc_1.trpc.fileStorage.updateDocument.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Document updated");
            setShowEdit(false);
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error("Update failed: " + err.message); }
    });
    var deleteMut = trpc_1.trpc.fileStorage.deleteDocument.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Document deleted");
            setShowDeleteConfirm(false);
            setDeleteDocId(null);
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error("Delete failed: " + err.message); }
    });
    var ocrMut = trpc_1.trpc.fileStorage.performOCR.useMutation({
        onSuccess: function (result) {
            setOcrResult(result.extractedText || 'No text extracted. OCR processing completed with ' + (result.confidence * 100).toFixed(0) + '% confidence.');
            sonner_1.toast.success("OCR Complete - " + (result.confidence * 100).toFixed(0) + "% confidence");
        },
        onError: function (err) { return sonner_1.toast.error("OCR failed: " + err.message); }
    });
    var versionsData = trpc_1.trpc.fileStorage.getDocumentVersions.useQuery({ documentId: versionDocId || '' }, { enabled: !!versionDocId }).data;
    var docs = (data === null || data === void 0 ? void 0 : data.documents) || [];
    var totalDocs = (_a = data === null || data === void 0 ? void 0 : data.total) !== null && _a !== void 0 ? _a : 0;
    var totalSize = (_b = data === null || data === void 0 ? void 0 : data.totalSize) !== null && _b !== void 0 ? _b : 0;
    var activeDocs = docs.filter(function (d) { return d.status === 'active'; }).length;
    var archivedDocs = docs.filter(function (d) { return d.status === 'archived'; }).length;
    var handleUpload = function () {
        if (!uploadFile) {
            sonner_1.toast.error("Please select a file to upload");
            return;
        }
        if (!uploadName.trim()) {
            sonner_1.toast.error("Document name is required");
            return;
        }
        if (uploadFile.size > 25 * 1024 * 1024) {
            sonner_1.toast.error("File size exceeds 25MB limit");
            return;
        }
        setUploadProgress('Reading file...');
        var reader = new FileReader();
        reader.onload = function () {
            setUploadProgress('Uploading...');
            var base64Data = reader.result;
            uploadMut.mutate({
                name: uploadName,
                mimeType: uploadFile.type || 'application/octet-stream',
                size: uploadFile.size,
                fileData: base64Data,
                documentType: uploadType,
                tags: uploadTags ? uploadTags.split(',').map(function (t) { return t.trim(); }) : []
            });
        };
        reader.onerror = function () {
            sonner_1.toast.error("Failed to read file");
            setUploadProgress('');
        };
        reader.readAsDataURL(uploadFile);
    };
    var handleFileSelect = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            setUploadFile(file);
            if (!uploadName.trim()) {
                setUploadName(file.name);
            }
        }
    };
    var handleEdit = function (doc) {
        setEditDoc(doc);
        setEditName(doc.documentName);
        setEditType(doc.documentType || 'other');
        setEditStatus(doc.status || 'active');
        setShowEdit(true);
    };
    var submitEdit = function () {
        if (!editDoc)
            return;
        updateMut.mutate({
            documentId: editDoc.id,
            name: editName,
            documentType: editType,
            status: editStatus
        });
    };
    var handleDelete = function (id) {
        setDeleteDocId(id);
        setShowDeleteConfirm(true);
    };
    var confirmDelete = function () {
        if (deleteDocId)
            deleteMut.mutate({ documentId: deleteDocId });
    };
    var handleOCR = function (docId) {
        setOcrDocId(docId);
        setOcrResult(null);
        setShowOCR(true);
        ocrMut.mutate({ documentId: docId });
    };
    var handleViewVersions = function (docId) {
        setVersionDocId(docId);
        setShowVersions(true);
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Document Management", description: "Upload, organize, search and manage all your documents", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Documents" },
        ], actions: react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white hover:bg-white/10 hover:text-white", onClick: function () { return refetch(); } },
                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 mr-1" }),
                " Refresh"),
            react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-white text-orange-600 hover:bg-white/90", onClick: function () { return setShowUpload(true); } },
                react_1["default"].createElement(lucide_react_1.FilePlus, { className: "w-4 h-4 mr-1" }),
                " Upload Document")) },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-blue-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Total Documents"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold" }, totalDocs)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Active"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold" }, activeDocs)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.Archive, { className: "w-5 h-5 text-amber-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Archived"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold" }, archivedDocs)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "w-5 h-5 text-purple-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Total Size"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold" }, formatBytes(totalSize)))))),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-3" },
                    react_1["default"].createElement("div", { className: "flex-1 relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                        react_1["default"].createElement(input_1.Input, { placeholder: "Search by document name...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10" })),
                    react_1["default"].createElement(tabs_1.Tabs, { value: activeType, onValueChange: setActiveType, className: "w-auto" },
                        react_1["default"].createElement(tabs_1.TabsList, { className: "h-9" }, DOC_TYPES.map(function (t) { return (react_1["default"].createElement(tabs_1.TabsTrigger, { key: t, value: t, className: "text-xs capitalize px-3" }, t === 'all' ? 'All' : t)); })))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
                    " Documents",
                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "ml-2" }, totalDocs))),
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-12 text-center text-muted-foreground" }, "Loading documents...")) : docs.length === 0 ? (react_1["default"].createElement("div", { className: "p-12 text-center" },
                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-12 h-12 mx-auto text-muted-foreground/40 mb-3" }),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "No documents found"),
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "mt-3", onClick: function () { return setShowUpload(true); } },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-1" }),
                    " Upload your first document"))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/50" },
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Name"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Type"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Size"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Version"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Status"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Modified"),
                            react_1["default"].createElement(table_1.TableHead, { className: "font-semibold text-right" }, "Actions"))),
                    react_1["default"].createElement(table_1.TableBody, null, docs.map(function (doc) { return (react_1["default"].createElement(table_1.TableRow, { key: doc.id, className: "hover:bg-muted/30 transition-colors" },
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement("div", { className: "flex items-center gap-2 min-w-[200px]" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-orange-500 flex-shrink-0" }),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-medium text-sm" }, doc.documentName),
                                    doc.tags && doc.tags.length > 0 && (react_1["default"].createElement("div", { className: "flex gap-1 mt-0.5" }, doc.tags.slice(0, 3).map(function (tag, i) { return (react_1["default"].createElement("span", { key: i, className: "text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground" }, tag)); })))))),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: typeColors[doc.documentType || 'other'] }, doc.documentType || 'other')),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, formatBytes(doc.fileSize || 0)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" },
                            "v",
                            doc.currentVersion || 1),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { variant: doc.status === 'active' ? 'default' : 'secondary', className: "text-[10px]" }, doc.status || 'active')),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "w-3 h-3" }),
                                timeAgo(doc.updatedAt))),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0" },
                                        react_1["default"].createElement(lucide_react_1.MoreHorizontal, { className: "w-4 h-4" }))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleViewVersions(doc.id); } },
                                        react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                                        " View Versions"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleEdit(doc); } },
                                        react_1["default"].createElement(lucide_react_1.Edit, { className: "w-4 h-4 mr-2" }),
                                        " Edit"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOCR(doc.id); } },
                                        react_1["default"].createElement(lucide_react_1.ScanLine, { className: "w-4 h-4 mr-2" }),
                                        " Run OCR"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () {
                                            if (doc.fileUrl && doc.fileUrl !== '/uploads/') {
                                                var a = document.createElement('a');
                                                a.href = doc.fileUrl;
                                                a.download = doc.documentName || 'download';
                                                a.target = '_blank';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }
                                            else {
                                                sonner_1.toast.error("No file available for download");
                                            }
                                        } },
                                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                                        " Download"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { className: "text-destructive", onClick: function () { return handleDelete(doc.id); } },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4 mr-2" }),
                                        " Delete")))))); }))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showUpload, onOpenChange: function (open) { setShowUpload(open); if (!open) {
                setUploadFile(null);
                setUploadProgress('');
            } } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Upload, { className: "w-5 h-5" }),
                        " Upload Document"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Select a file and add metadata to upload")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "File *"),
                        react_1["default"].createElement("div", { className: "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors", onClick: function () { var _a; return (_a = document.getElementById('file-upload-input')) === null || _a === void 0 ? void 0 : _a.click(); }, onDragOver: function (e) { e.preventDefault(); e.stopPropagation(); }, onDrop: function (e) {
                                var _a;
                                e.preventDefault();
                                e.stopPropagation();
                                var file = (_a = e.dataTransfer.files) === null || _a === void 0 ? void 0 : _a[0];
                                if (file) {
                                    setUploadFile(file);
                                    if (!uploadName.trim())
                                        setUploadName(file.name);
                                }
                            } },
                            react_1["default"].createElement("input", { id: "file-upload-input", type: "file", className: "hidden", onChange: handleFileSelect, accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp,.zip,.json,.xml" }),
                            uploadFile ? (react_1["default"].createElement("div", { className: "flex items-center justify-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8 text-orange-500" }),
                                react_1["default"].createElement("div", { className: "text-left" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium" }, uploadFile.name),
                                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, formatBytes(uploadFile.size))),
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "ml-2", onClick: function (e) { e.stopPropagation(); setUploadFile(null); } },
                                    react_1["default"].createElement(lucide_react_1.X, { className: "w-4 h-4" })))) : (react_1["default"].createElement("div", null,
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "w-8 h-8 mx-auto text-muted-foreground mb-2" }),
                                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Click to select or drag and drop"),
                                react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "PDF, Word, Excel, Images up to 25MB"))))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Document Name *"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g. Invoice_2025_Q1.pdf", value: uploadName, onChange: function (e) { return setUploadName(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Document Type"),
                        react_1["default"].createElement(select_1.Select, { value: uploadType, onValueChange: setUploadType },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null, DOC_TYPES.filter(function (t) { return t !== 'all'; }).map(function (t) { return (react_1["default"].createElement(select_1.SelectItem, { key: t, value: t, className: "capitalize" }, t)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Tags (comma-separated)"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g. finance, 2025, quarterly", value: uploadTags, onChange: function (e) { return setUploadTags(e.target.value); } }))),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowUpload(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleUpload, disabled: uploadMut.isPending || !uploadFile }, uploadMut.isPending ? (uploadProgress || 'Uploading...') : 'Upload')))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showEdit, onOpenChange: setShowEdit },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Edit, { className: "w-5 h-5" }),
                        " Edit Document"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Update document information")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Document Name"),
                        react_1["default"].createElement(input_1.Input, { value: editName, onChange: function (e) { return setEditName(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Document Type"),
                        react_1["default"].createElement(select_1.Select, { value: editType, onValueChange: setEditType },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null, DOC_TYPES.filter(function (t) { return t !== 'all'; }).map(function (t) { return (react_1["default"].createElement(select_1.SelectItem, { key: t, value: t, className: "capitalize" }, t)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "text-sm font-medium mb-1 block" }, "Status"),
                        react_1["default"].createElement(select_1.Select, { value: editStatus, onValueChange: setEditStatus },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null, STATUS_OPTIONS.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s, value: s, className: "capitalize" }, s)); }))))),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowEdit(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: submitEdit, disabled: updateMut.isPending }, updateMut.isPending ? 'Saving...' : 'Save Changes')))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showDeleteConfirm, onOpenChange: setShowDeleteConfirm },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-sm" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2 text-destructive" },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-5 h-5" }),
                        " Delete Document"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Are you sure you want to permanently delete this document? This action cannot be undone.")),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowDeleteConfirm(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { variant: "destructive", onClick: confirmDelete, disabled: deleteMut.isPending }, deleteMut.isPending ? 'Deleting...' : 'Delete')))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showOCR, onOpenChange: function (open) { setShowOCR(open); if (!open)
                setOcrResult(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.ScanLine, { className: "w-5 h-5" }),
                        " OCR Processing"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Extract text from this document using optical character recognition")),
                react_1["default"].createElement("div", { className: "space-y-3" }, ocrMut.isPending ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8 gap-3 text-muted-foreground" },
                    react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-5 h-5 animate-spin" }),
                    " Processing document...")) : ocrResult ? (react_1["default"].createElement("div", { className: "bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto" },
                    react_1["default"].createElement("p", { className: "text-sm font-medium mb-2 flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4 text-green-500" }),
                        " Extracted Text"),
                    react_1["default"].createElement("p", { className: "text-sm whitespace-pre-wrap" }, ocrResult))) : null),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { setShowOCR(false); setOcrResult(null); } }, "Close")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showVersions, onOpenChange: function (open) { setShowVersions(open); if (!open)
                setVersionDocId(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Clock, { className: "w-5 h-5" }),
                        " Version History"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "View all versions of this document")),
                react_1["default"].createElement("div", { className: "space-y-2" }, (versionsData === null || versionsData === void 0 ? void 0 : versionsData.versions) && versionsData.versions.length > 0 ? (versionsData.versions.map(function (v, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm font-medium" },
                            "Version ",
                            v.version),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                            "By ",
                            v.uploadedBy,
                            " \u00B7 ",
                            v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—')),
                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary" }, formatBytes(v.size || 0)))); })) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No version history available"))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { setShowVersions(false); setVersionDocId(null); } }, "Close"))))));
}
exports.DocumentManagement = DocumentManagement;
exports["default"] = DocumentManagement;
