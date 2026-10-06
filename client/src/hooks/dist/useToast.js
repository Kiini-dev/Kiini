"use strict";
exports.__esModule = true;
exports.useToast = void 0;
var react_1 = require("react");
/**
 * Simple toast/notification hook
 * Provides a lightweight way to display toast notifications
 */
function useToast() {
    var toast = react_1.useCallback(function (options) {
        // Log to console for now (can be extended with a notification system)
        var prefix = "[" + options.type.toUpperCase() + "]";
        var message = prefix + " " + options.title + (options.description ? ': ' + options.description : '');
        switch (options.type) {
            case 'success':
                console.log('✓', message);
                break;
            case 'error':
                console.error('✗', message);
                break;
            case 'warning':
                console.warn('⚠', message);
                break;
            case 'info':
            default:
                console.info('ℹ', message);
        }
        // TODO: Integrate with actual toast/notification UI library (e.g., react-toastify, sonner)
        // This is a minimal implementation to avoid breaking the build
    }, []);
    return { toast: toast };
}
exports.useToast = useToast;
