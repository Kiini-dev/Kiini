"use strict";
exports.__esModule = true;
exports.useDebounce = void 0;
var react_1 = require("react");
function useDebounce(value, delay) {
    var _a = react_1.useState(value), debounced = _a[0], setDebounced = _a[1];
    react_1.useEffect(function () {
        var timer = setTimeout(function () { return setDebounced(value); }, delay);
        return function () { return clearTimeout(timer); };
    }, [value, delay]);
    return debounced;
}
exports.useDebounce = useDebounce;
