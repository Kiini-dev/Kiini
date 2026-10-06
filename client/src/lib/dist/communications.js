"use strict";
exports.__esModule = true;
exports.buildCommunicationComposePath = void 0;
function buildCommunicationComposePath(currentPath, to, subject) {
    var orgMatch = currentPath.match(/^\/org\/([^/]+)/);
    var basePath = orgMatch
        ? "/org/" + orgMatch[1] + "/communications/new"
        : "/communications/new";
    var params = new URLSearchParams();
    if (to && to.trim())
        params.set("to", to.trim());
    if (subject && subject.trim())
        params.set("subject", subject.trim());
    var query = params.toString();
    return query ? basePath + "?" + query : basePath;
}
exports.buildCommunicationComposePath = buildCommunicationComposePath;
