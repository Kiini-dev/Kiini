"use strict";
/**
 * Document Template Preview Component
 * Renders HTML templates with data binding
 * Supports print, download, and preview modes
 */
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
exports.__esModule = true;
exports.TemplatePreview = void 0;
var react_1 = require("react");
var templateRenderer_1 = require("@/lib/templateRenderer");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
/**
 * Renders a template with data binding and provides print/download functionality
 * Features:
 * - Real-time preview with data binding
 * - Print-optimized rendering
 * - PDF download support
 * - Error handling and validation
 * - Section extraction and debugging
 */
function TemplatePreview(_a) {
    var _this = this;
    var templateType = _a.templateType, data = _a.data, onPrint = _a.onPrint, onDownload = _a.onDownload, _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.title, title = _c === void 0 ? "Document Preview" : _c;
    var containerRef = react_1.useRef(null);
    var iframeRef = react_1.useRef(null);
    var _d = react_1.useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _f = react_1.useState(null), error = _f[0], setError = _f[1];
    var _g = react_1.useState(true), showPreview = _g[0], setShowPreview = _g[1];
    var _h = react_1.useState([]), templateVars = _h[0], setTemplateVars = _h[1];
    react_1.useEffect(function () {
        var renderTemplate = function () { return __awaiter(_this, void 0, void 0, function () {
            var template, vars, _e_1, err_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, 7, 8]);
                        setIsLoading(true);
                        setError(null);
                        if (!containerRef.current) return [3 /*break*/, 5];
                        return [4 /*yield*/, templateRenderer_1.templateRenderer.renderToElement(templateType, data, containerRef.current)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, templateRenderer_1.templateRenderer.loadTemplate(templateType)];
                    case 3:
                        template = _a.sent();
                        vars = templateRenderer_1.templateRenderer.extractTemplateVariables(template);
                        setTemplateVars(vars);
                        return [3 /*break*/, 5];
                    case 4:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : "Failed to render template";
                        setError(errorMessage);
                        sonner_1.toast.error(errorMessage);
                        console.error("Template rendering error:", err_1);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        renderTemplate();
    }, [templateType, data]);
    /**
     * Print document in optimized print mode
     * Uses iframe for better print preview rendering
     */
    var handlePrint = function () {
        var _a;
        try {
            if (!containerRef.current) {
                sonner_1.toast.error("Template not rendered");
                return;
            }
            // Create iframe for printing to preserve styles
            var iframe_1 = document.createElement("iframe");
            iframe_1.style.display = "none";
            document.body.appendChild(iframe_1);
            var iframeDoc = iframe_1.contentDocument || ((_a = iframe_1.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
            if (!iframeDoc) {
                sonner_1.toast.error("Could not access print window");
                return;
            }
            // Write full HTML with styles preserved
            var htmlContent = containerRef.current.innerHTML;
            iframeDoc.write("\n        <!DOCTYPE html>\n        <html>\n          <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <style>\n              @page {\n                margin: 40px;\n                size: A4;\n              }\n              @media print {\n                * { \n                  -webkit-print-color-adjust: exact !important;\n                  print-color-adjust: exact !important;\n                  color-adjust: exact !important;\n                }\n                body {\n                  margin: 0;\n                  padding: 0;\n                  background: #fff;\n                }\n                .no-print {\n                  display: none !important;\n                }\n              }\n              body {\n                margin: 0;\n                padding: 0;\n                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n                background: #fff;\n              }\n            </style>\n          </head>\n          <body>\n            " + htmlContent + "\n          </body>\n        </html>\n      ");
            iframeDoc.close();
            // Trigger print after content loads
            iframe_1.onload = function () {
                var _a;
                iframe_1.focus();
                (_a = iframe_1.contentWindow) === null || _a === void 0 ? void 0 : _a.print();
                // Remove iframe after print
                setTimeout(function () {
                    document.body.removeChild(iframe_1);
                }, 1000);
            };
            onPrint === null || onPrint === void 0 ? void 0 : onPrint();
        }
        catch (err) {
            sonner_1.toast.error("Failed to print document");
            console.error("Print error:", err);
        }
    };
    /**
     * Download document as PDF
     * Uses browser print-to-PDF functionality
     */
    var handleDownloadPDF = function () { return __awaiter(_this, void 0, void 0, function () {
        var iframe_2, iframeDoc, htmlContent;
        var _a;
        return __generator(this, function (_b) {
            try {
                if (!containerRef.current) {
                    sonner_1.toast.error("Template not rendered");
                    return [2 /*return*/];
                }
                iframe_2 = document.createElement("iframe");
                iframe_2.style.display = "none";
                document.body.appendChild(iframe_2);
                iframeDoc = iframe_2.contentDocument || ((_a = iframe_2.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (!iframeDoc) {
                    sonner_1.toast.error("Could not access download window");
                    return [2 /*return*/];
                }
                htmlContent = containerRef.current.innerHTML;
                iframeDoc.write("\n        <!DOCTYPE html>\n        <html>\n          <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>" + title + "</title>\n            <style>\n              @page {\n                margin: 40px;\n                size: A4;\n              }\n              @media print {\n                * { \n                  -webkit-print-color-adjust: exact !important;\n                  print-color-adjust: exact !important;\n                  color-adjust: exact !important;\n                }\n                body {\n                  margin: 0;\n                  padding: 0;\n                  background: #fff;\n                }\n              }\n              body {\n                margin: 0;\n                padding: 0;\n                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n                background: #fff;\n              }\n            </style>\n          </head>\n          <body>\n            " + htmlContent + "\n          </body>\n        </html>\n      ");
                iframeDoc.close();
                iframe_2.onload = function () {
                    var _a;
                    iframe_2.focus();
                    (_a = iframe_2.contentWindow) === null || _a === void 0 ? void 0 : _a.print();
                    setTimeout(function () {
                        document.body.removeChild(iframe_2);
                    }, 1000);
                };
                onDownload === null || onDownload === void 0 ? void 0 : onDownload();
                sonner_1.toast.success("PDF downloaded. Save as PDF in the print dialog.");
            }
            catch (err) {
                sonner_1.toast.error("Failed to download PDF");
                console.error("Download error:", err);
            }
            return [2 /*return*/];
        });
    }); };
    /**
     * Reload template
     */
    var handleReload = function () {
        templateRenderer_1.templateRenderer.clearCacheEntry(templateType);
        setIsLoading(true);
    };
    return (React.createElement("div", { className: "space-y-4 " + className },
        React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded border" },
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("span", { className: "text-sm font-medium text-gray-700" }, title),
                templateVars.length > 0 && (React.createElement("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" },
                    templateVars.length,
                    " variables"))),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setShowPreview(!showPreview); }, title: showPreview ? "Hide preview" : "Show preview" }, showPreview ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4 mr-2" }),
                    "Hide")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                    "Show"))),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: handleReload, disabled: isLoading, title: "Reload template" },
                    React.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4" })),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, disabled: isLoading || !!error },
                    React.createElement(lucide_react_1.Printer, { className: "w-4 h-4 mr-2" }),
                    "Print"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleDownloadPDF, disabled: isLoading || !!error },
                    React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                    "PDF"))),
        isLoading && (React.createElement("div", { className: "flex items-center justify-center p-12 bg-gray-50 rounded border" },
            React.createElement("div", { className: "flex flex-col items-center gap-2" },
                React.createElement("div", { className: "h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" }),
                React.createElement("span", { className: "text-gray-500 text-sm" }, "Rendering template...")))),
        error && (React.createElement("div", { className: "p-4 bg-red-50 border border-red-200 rounded" },
            React.createElement("p", { className: "font-semibold text-red-800" }, "Error rendering template"),
            React.createElement("p", { className: "text-sm text-red-700 mt-1" }, error),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleReload, className: "mt-3" }, "Retry"))),
        showPreview && !isLoading && !error && (React.createElement("div", { className: "border rounded overflow-hidden bg-white" },
            React.createElement("div", { ref: containerRef, className: "bg-white print:bg-white print:p-0 print:m-0", style: {
                    minHeight: "600px",
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact"
                } }))),
        !showPreview && !isLoading && !error && (React.createElement("div", { className: "p-8 bg-gray-50 rounded border text-center text-gray-500" },
            React.createElement(lucide_react_1.Eye, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }),
            React.createElement("p", { className: "text-sm" }, "Preview hidden. Use \"Show\" button to display.")))));
}
exports.TemplatePreview = TemplatePreview;
exports["default"] = TemplatePreview;
