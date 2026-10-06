"use strict";
exports.__esModule = true;
exports.useUser = void 0;
var react_1 = require("react");
var AuthProvider_1 = require("@/components/AuthProvider");
function useUser() {
    var context = react_1.useContext(AuthProvider_1.AuthContext);
    if (!context) {
        throw new Error("useUser must be used within an AuthProvider");
    }
    return context;
}
exports.useUser = useUser;
