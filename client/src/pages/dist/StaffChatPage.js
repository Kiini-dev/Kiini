"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var StaffChat_1 = require("@/components/StaffChat");
var lucide_react_1 = require("lucide-react");
function StaffChatPage() {
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Staff Chat", description: "Team messaging, channels, and direct messages", icon: React.createElement(lucide_react_1.MessageCircle, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Communications", href: "/communications" },
            { label: "Staff Chat" },
        ] },
        React.createElement(StaffChat_1.StaffChat, null)));
}
exports["default"] = StaffChatPage;
