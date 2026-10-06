"use strict";
exports.__esModule = true;
exports.useToast = void 0;
var sonner_1 = require("sonner");
function useToast() {
    return {
        toast: function (message, options) {
            return sonner_1.toast(message, options);
        }
    };
}
exports.useToast = useToast;
