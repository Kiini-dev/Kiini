"use strict";
exports.__esModule = true;
var accordion_1 = require("@/components/ui/accordion");
var alert_1 = require("@/components/ui/alert");
var aspect_ratio_1 = require("@/components/ui/aspect-ratio");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var breadcrumb_1 = require("@/components/ui/breadcrumb");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var carousel_1 = require("@/components/ui/carousel");
var checkbox_1 = require("@/components/ui/checkbox");
var collapsible_1 = require("@/components/ui/collapsible");
var command_1 = require("@/components/ui/command");
var context_menu_1 = require("@/components/ui/context-menu");
var dialog_1 = require("@/components/ui/dialog");
var drawer_1 = require("@/components/ui/drawer");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var hover_card_1 = require("@/components/ui/hover-card");
var input_1 = require("@/components/ui/input");
var input_otp_1 = require("@/components/ui/input-otp");
var label_1 = require("@/components/ui/label");
var menubar_1 = require("@/components/ui/menubar");
var pagination_1 = require("@/components/ui/pagination");
var popover_1 = require("@/components/ui/popover");
var progress_1 = require("@/components/ui/progress");
var radio_group_1 = require("@/components/ui/radio-group");
var resizable_1 = require("@/components/ui/resizable");
var scroll_area_1 = require("@/components/ui/scroll-area");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var sheet_1 = require("@/components/ui/sheet");
var skeleton_1 = require("@/components/ui/skeleton");
var slider_1 = require("@/components/ui/slider");
var switch_1 = require("@/components/ui/switch");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var toggle_1 = require("@/components/ui/toggle");
var toggle_group_1 = require("@/components/ui/toggle-group");
var tooltip_1 = require("@/components/ui/tooltip");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function ComponentsShowcase() {
    var _a, _b;
    var _c = ThemeContext_1.useTheme(), theme = _c.theme, toggleTheme = _c.toggleTheme;
    var _d = react_1.useState(new Date()), date = _d[0], setDate = _d[1];
    var _e = react_1.useState(), datePickerDate = _e[0], setDatePickerDate = _e[1];
    var _f = react_1.useState([]), selectedFruits = _f[0], setSelectedFruits = _f[1];
    var _g = react_1.useState(33), progress = _g[0], setProgress = _g[1];
    var _h = react_1.useState(2), currentPage = _h[0], setCurrentPage = _h[1];
    var _j = react_1.useState(false), openCombobox = _j[0], setOpenCombobox = _j[1];
    var _k = react_1.useState(""), selectedFramework = _k[0], setSelectedFramework = _k[1];
    var _l = react_1.useState(""), selectedMonth = _l[0], setSelectedMonth = _l[1];
    var _m = react_1.useState(""), selectedYear = _m[0], setSelectedYear = _m[1];
    var _o = react_1.useState(""), dialogInput = _o[0], setDialogInput = _o[1];
    var _p = react_1.useState(false), dialogOpen = _p[0], setDialogOpen = _p[1];
    var handleDialogSubmit = function () {
        console.log("Dialog submitted with value:", dialogInput);
        sonner_1.toast.success("Submitted successfully", {
            description: "Input: " + dialogInput
        });
        setDialogInput("");
        setDialogOpen(false);
    };
    var handleDialogKeyDown = function (e) {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleDialogSubmit();
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Component Showcase", icon: React.createElement(LayoutGrid, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm/dashboard" }, { label: "Tools" }, { label: "Component Showcase" }] },
        React.createElement("main", { className: "container max-w-6xl mx-auto" },
            React.createElement("div", { className: "space-y-2 justify-between flex" },
                React.createElement("h2", { className: "text-3xl font-bold tracking-tight mb-6" }, "Shadcn/ui Component Library"),
                React.createElement(button_1.Button, { variant: "outline", size: "icon", onClick: toggleTheme }, theme === "light" ? (React.createElement(lucide_react_1.Moon, { className: "h-5 w-5" })) : (React.createElement(lucide_react_1.Sun, { className: "h-5 w-5" })))),
            React.createElement("div", { className: "space-y-12" },
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Text Colors"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                                React.createElement("div", { className: "space-y-3" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Foreground (Default)"),
                                        React.createElement("p", { className: "text-foreground text-lg" }, "Default text color for main content")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Muted Foreground"),
                                        React.createElement("p", { className: "text-muted-foreground text-lg" }, "Muted text for secondary information")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Primary"),
                                        React.createElement("p", { className: "text-primary text-lg font-medium" }, "Primary brand color text")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Secondary Foreground"),
                                        React.createElement("p", { className: "text-secondary-foreground text-lg" }, "Secondary action text color"))),
                                React.createElement("div", { className: "space-y-3" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Accent Foreground"),
                                        React.createElement("p", { className: "text-accent-foreground text-lg" }, "Accent text for emphasis")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Destructive"),
                                        React.createElement("p", { className: "text-destructive text-lg font-medium" }, "Error or destructive action text")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Card Foreground"),
                                        React.createElement("p", { className: "text-card-foreground text-lg" }, "Text color on card backgrounds")),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Popover Foreground"),
                                        React.createElement("p", { className: "text-popover-foreground text-lg" }, "Text color in popovers"))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Color Combinations"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
                                React.createElement("div", { className: "bg-primary text-primary-foreground rounded-lg p-4" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Primary"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Primary background with foreground text")),
                                React.createElement("div", { className: "bg-secondary text-secondary-foreground rounded-lg p-4" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Secondary"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Secondary background with foreground text")),
                                React.createElement("div", { className: "bg-muted text-muted-foreground rounded-lg p-4" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Muted"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Muted background with foreground text")),
                                React.createElement("div", { className: "bg-accent text-accent-foreground rounded-lg p-4" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Accent"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Accent background with foreground text")),
                                React.createElement("div", { className: "bg-destructive text-destructive-foreground rounded-lg p-4" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Destructive"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Destructive background with foreground text")),
                                React.createElement("div", { className: "bg-card text-card-foreground rounded-lg p-4 border" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Card"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Card background with foreground text")),
                                React.createElement("div", { className: "bg-popover text-popover-foreground rounded-lg p-4 border" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Popover"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Popover background with foreground text")),
                                React.createElement("div", { className: "bg-background text-foreground rounded-lg p-4 border" },
                                    React.createElement("p", { className: "font-medium mb-1" }, "Background"),
                                    React.createElement("p", { className: "text-sm opacity-90" }, "Default background with foreground text")))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Buttons"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex flex-wrap gap-4" },
                                React.createElement(button_1.Button, null, "Default"),
                                React.createElement(button_1.Button, { variant: "secondary" }, "Secondary"),
                                React.createElement(button_1.Button, { variant: "destructive" }, "Destructive"),
                                React.createElement(button_1.Button, { variant: "outline" }, "Outline"),
                                React.createElement(button_1.Button, { variant: "ghost" }, "Ghost"),
                                React.createElement(button_1.Button, { variant: "link" }, "Link"),
                                React.createElement(button_1.Button, { size: "sm" }, "Small"),
                                React.createElement(button_1.Button, { size: "lg" }, "Large"),
                                React.createElement(button_1.Button, { size: "icon" },
                                    React.createElement(lucide_react_1.Check, { className: "h-4 w-4" })))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Form Inputs"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                                React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "Email" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "message" }, "Message"),
                                React.createElement(textarea_1.Textarea, { id: "message", placeholder: "Type your message here." })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Select"),
                                React.createElement(select_1.Select, null,
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a fruit" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "apple" }, "Apple"),
                                        React.createElement(select_1.SelectItem, { value: "banana" }, "Banana"),
                                        React.createElement(select_1.SelectItem, { value: "orange" }, "Orange")))),
                            React.createElement("div", { className: "flex items-center space-x-2" },
                                React.createElement(checkbox_1.Checkbox, { id: "terms" }),
                                React.createElement(label_1.Label, { htmlFor: "terms" }, "Accept terms and conditions")),
                            React.createElement("div", { className: "flex items-center space-x-2" },
                                React.createElement(switch_1.Switch, { id: "airplane-mode" }),
                                React.createElement(label_1.Label, { htmlFor: "airplane-mode" }, "Airplane Mode")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Radio Group"),
                                React.createElement(radio_group_1.RadioGroup, { defaultValue: "option-one" },
                                    React.createElement("div", { className: "flex items-center space-x-2" },
                                        React.createElement(radio_group_1.RadioGroupItem, { value: "option-one", id: "option-one" }),
                                        React.createElement(label_1.Label, { htmlFor: "option-one" }, "Option One")),
                                    React.createElement("div", { className: "flex items-center space-x-2" },
                                        React.createElement(radio_group_1.RadioGroupItem, { value: "option-two", id: "option-two" }),
                                        React.createElement(label_1.Label, { htmlFor: "option-two" }, "Option Two")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Slider"),
                                React.createElement(slider_1.Slider, { defaultValue: [50], max: 100, step: 1 })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Input OTP"),
                                React.createElement(input_otp_1.InputOTP, { maxLength: 6 },
                                    React.createElement(input_otp_1.InputOTPGroup, null,
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 0 }),
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 1 }),
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 2 }),
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 3 }),
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 4 }),
                                        React.createElement(input_otp_1.InputOTPSlot, { index: 5 })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Date Time Picker"),
                                React.createElement(popover_1.Popover, null,
                                    React.createElement(popover_1.PopoverTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start text-left font-normal " + (!datePickerDate && "text-muted-foreground") },
                                            React.createElement(lucide_react_1.CalendarIcon, { className: "mr-2 h-4 w-4" }),
                                            datePickerDate ? (date_fns_1.format(datePickerDate, "PPP HH:mm", { locale: locale_1.zhCN })) : (React.createElement("span", null, "Select date and time")))),
                                    React.createElement(popover_1.PopoverContent, { className: "w-auto p-0", align: "start" },
                                        React.createElement("div", { className: "p-3 space-y-3" },
                                            React.createElement(calendar_1.Calendar, { mode: "single", selected: datePickerDate, onSelect: setDatePickerDate }),
                                            React.createElement("div", { className: "border-t pt-3 space-y-2" },
                                                React.createElement(label_1.Label, { className: "flex items-center gap-2" },
                                                    React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" }),
                                                    "Time"),
                                                React.createElement("div", { className: "flex gap-2" },
                                                    React.createElement(input_1.Input, { type: "time", value: datePickerDate
                                                            ? date_fns_1.format(datePickerDate, "HH:mm")
                                                            : "00:00", onChange: function (e) {
                                                            var _a = e.target.value.split(":"), hours = _a[0], minutes = _a[1];
                                                            var newDate = datePickerDate
                                                                ? new Date(datePickerDate)
                                                                : new Date();
                                                            newDate.setHours(parseInt(hours));
                                                            newDate.setMinutes(parseInt(minutes));
                                                            setDatePickerDate(newDate);
                                                        } })))))),
                                datePickerDate && (React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "Selected:",
                                    " ",
                                    date_fns_1.format(datePickerDate, "yyyy/MM/dd  HH:mm", {
                                        locale: locale_1.zhCN
                                    })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Searchable Dropdown"),
                                React.createElement(popover_1.Popover, { open: openCombobox, onOpenChange: setOpenCombobox },
                                    React.createElement(popover_1.PopoverTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline", role: "combobox", "aria-expanded": openCombobox, className: "w-full justify-between" },
                                            selectedFramework
                                                ? (_a = [
                                                    { value: "react", label: "React" },
                                                    { value: "vue", label: "Vue" },
                                                    { value: "angular", label: "Angular" },
                                                    { value: "svelte", label: "Svelte" },
                                                    { value: "nextjs", label: "Next.js" },
                                                    { value: "nuxt", label: "Nuxt" },
                                                    { value: "remix", label: "Remix" },
                                                ].find(function (fw) { return fw.value === selectedFramework; })) === null || _a === void 0 ? void 0 : _a.label : "Select framework...",
                                            React.createElement(lucide_react_1.CalendarIcon, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                                    React.createElement(popover_1.PopoverContent, { className: "w-full p-0" },
                                        React.createElement(command_1.Command, null,
                                            React.createElement(command_1.CommandInput, { placeholder: "Search frameworks..." }),
                                            React.createElement(command_1.CommandList, null,
                                                React.createElement(command_1.CommandEmpty, null, "No framework found"),
                                                React.createElement(command_1.CommandGroup, null, [
                                                    { value: "react", label: "React" },
                                                    { value: "vue", label: "Vue" },
                                                    { value: "angular", label: "Angular" },
                                                    { value: "svelte", label: "Svelte" },
                                                    { value: "nextjs", label: "Next.js" },
                                                    { value: "nuxt", label: "Nuxt" },
                                                    { value: "remix", label: "Remix" },
                                                ].map(function (framework) { return (React.createElement(command_1.CommandItem, { key: framework.value, value: framework.value, onSelect: function (currentValue) {
                                                        setSelectedFramework(currentValue === selectedFramework
                                                            ? ""
                                                            : currentValue);
                                                        setOpenCombobox(false);
                                                    } },
                                                    React.createElement(lucide_react_1.Check, { className: "mr-2 h-4 w-4 " + (selectedFramework === framework.value
                                                            ? "opacity-100"
                                                            : "opacity-0") }),
                                                    framework.label)); })))))),
                                selectedFramework && (React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "Selected:",
                                    " ", (_b = [
                                    { value: "react", label: "React" },
                                    { value: "vue", label: "Vue" },
                                    { value: "angular", label: "Angular" },
                                    { value: "svelte", label: "Svelte" },
                                    { value: "nextjs", label: "Next.js" },
                                    { value: "nuxt", label: "Nuxt" },
                                    { value: "remix", label: "Remix" },
                                ].find(function (fw) { return fw.value === selectedFramework; })) === null || _b === void 0 ? void 0 :
                                    _b.label))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "month", className: "text-sm font-medium" }, "Month"),
                                        React.createElement(select_1.Select, { value: selectedMonth, onValueChange: setSelectedMonth },
                                            React.createElement(select_1.SelectTrigger, { id: "month" },
                                                React.createElement(select_1.SelectValue, { placeholder: "MM" })),
                                            React.createElement(select_1.SelectContent, null, Array.from({ length: 12 }, function (_, i) { return i + 1; }).map(function (month) { return (React.createElement(select_1.SelectItem, { key: month, value: month.toString().padStart(2, "0") }, month.toString().padStart(2, "0"))); })))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "year", className: "text-sm font-medium" }, "Year"),
                                        React.createElement(select_1.Select, { value: selectedYear, onValueChange: setSelectedYear },
                                            React.createElement(select_1.SelectTrigger, { id: "year" },
                                                React.createElement(select_1.SelectValue, { placeholder: "YYYY" })),
                                            React.createElement(select_1.SelectContent, null, Array.from({ length: 10 }, function (_, i) { return new Date().getFullYear() - 5 + i; }).map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year.toString() }, year)); }))))),
                                selectedMonth && selectedYear && (React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "Selected: ",
                                    selectedYear,
                                    "/",
                                    selectedMonth,
                                    "/")))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Data Display"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Badges"),
                                React.createElement("div", { className: "flex flex-wrap gap-2" },
                                    React.createElement(badge_1.Badge, null, "Default"),
                                    React.createElement(badge_1.Badge, { variant: "secondary" }, "Secondary"),
                                    React.createElement(badge_1.Badge, { variant: "destructive" }, "Destructive"),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, "Outline"))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Avatar"),
                                React.createElement("div", { className: "flex gap-4" },
                                    React.createElement(avatar_1.Avatar, null,
                                        React.createElement(avatar_1.AvatarImage, { src: "https://github.com/shadcn.png" }),
                                        React.createElement(avatar_1.AvatarFallback, null, "CN")),
                                    React.createElement(avatar_1.Avatar, null,
                                        React.createElement(avatar_1.AvatarFallback, null, "AB")))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Progress"),
                                React.createElement(progress_1.Progress, { value: progress }),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return setProgress(Math.max(0, progress - 10)); } }, "-10"),
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return setProgress(Math.min(100, progress + 10)); } }, "+10"))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Skeleton"),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                                    React.createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4" }),
                                    React.createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2" }))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Pagination"),
                                React.createElement(pagination_1.Pagination, null,
                                    React.createElement(pagination_1.PaginationContent, null,
                                        React.createElement(pagination_1.PaginationItem, null,
                                            React.createElement(pagination_1.PaginationPrevious, { href: "#", onClick: function (e) {
                                                    e.preventDefault();
                                                    setCurrentPage(Math.max(1, currentPage - 1));
                                                } })),
                                        [1, 2, 3, 4, 5].map(function (page) { return (React.createElement(pagination_1.PaginationItem, { key: page },
                                            React.createElement(pagination_1.PaginationLink, { href: "#", isActive: currentPage === page, onClick: function (e) {
                                                    e.preventDefault();
                                                    setCurrentPage(page);
                                                } }, page))); }),
                                        React.createElement(pagination_1.PaginationItem, null,
                                            React.createElement(pagination_1.PaginationNext, { href: "#", onClick: function (e) {
                                                    e.preventDefault();
                                                    setCurrentPage(Math.min(5, currentPage + 1));
                                                } })))),
                                React.createElement("p", { className: "text-sm text-muted-foreground text-center" },
                                    "Current page: ",
                                    currentPage)),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Table"),
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableCaption, null, "A list of your recent invoices."),
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, { className: "w-[100px]" }, "Invoice"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, null, "Method"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"))),
                                    React.createElement(table_1.TableBody, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableCell, { className: "font-medium" }, "INV001"),
                                            React.createElement(table_1.TableCell, null, "Paid"),
                                            React.createElement(table_1.TableCell, null, "Credit Card"),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, "$250.00")),
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableCell, { className: "font-medium" }, "INV002"),
                                            React.createElement(table_1.TableCell, null, "Pending"),
                                            React.createElement(table_1.TableCell, null, "PayPal"),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, "$150.00")),
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableCell, { className: "font-medium" }, "INV003"),
                                            React.createElement(table_1.TableCell, null, "Unpaid"),
                                            React.createElement(table_1.TableCell, null, "Bank Transfer"),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, "$350.00"))))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Menubar"),
                                React.createElement(menubar_1.Menubar, null,
                                    React.createElement(menubar_1.MenubarMenu, null,
                                        React.createElement(menubar_1.MenubarTrigger, null, "File"),
                                        React.createElement(menubar_1.MenubarContent, null,
                                            React.createElement(menubar_1.MenubarItem, null, "New Tab"),
                                            React.createElement(menubar_1.MenubarItem, null, "New Window"),
                                            React.createElement(menubar_1.MenubarSeparator, null),
                                            React.createElement(menubar_1.MenubarItem, null, "Share"),
                                            React.createElement(menubar_1.MenubarSeparator, null),
                                            React.createElement(menubar_1.MenubarItem, null, "Print"))),
                                    React.createElement(menubar_1.MenubarMenu, null,
                                        React.createElement(menubar_1.MenubarTrigger, null, "Edit"),
                                        React.createElement(menubar_1.MenubarContent, null,
                                            React.createElement(menubar_1.MenubarItem, null, "Undo"),
                                            React.createElement(menubar_1.MenubarItem, null, "Redo"))),
                                    React.createElement(menubar_1.MenubarMenu, null,
                                        React.createElement(menubar_1.MenubarTrigger, null, "View"),
                                        React.createElement(menubar_1.MenubarContent, null,
                                            React.createElement(menubar_1.MenubarItem, null, "Reload"),
                                            React.createElement(menubar_1.MenubarItem, null, "Force Reload"))))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Breadcrumb"),
                                React.createElement(breadcrumb_1.Breadcrumb, null,
                                    React.createElement(breadcrumb_1.BreadcrumbList, null,
                                        React.createElement(breadcrumb_1.BreadcrumbItem, null,
                                            React.createElement(breadcrumb_1.BreadcrumbLink, { href: "/" }, "Home")),
                                        React.createElement(breadcrumb_1.BreadcrumbSeparator, null),
                                        React.createElement(breadcrumb_1.BreadcrumbItem, null,
                                            React.createElement(breadcrumb_1.BreadcrumbLink, { href: "/components" }, "Components")),
                                        React.createElement(breadcrumb_1.BreadcrumbSeparator, null),
                                        React.createElement(breadcrumb_1.BreadcrumbItem, null,
                                            React.createElement(breadcrumb_1.BreadcrumbPage, null, "Breadcrumb")))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Alerts"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(alert_1.Alert, null,
                            React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                            React.createElement(alert_1.AlertTitle, null, "Heads up!"),
                            React.createElement(alert_1.AlertDescription, null, "You can add components to your app using the cli.")),
                        React.createElement(alert_1.Alert, { variant: "destructive" },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" }),
                            React.createElement(alert_1.AlertTitle, null, "Error"),
                            React.createElement(alert_1.AlertDescription, null, "Your session has expired. Please log in again.")))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Tabs"),
                    React.createElement(tabs_1.Tabs, { defaultValue: "account", className: "w-full" },
                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                            React.createElement(tabs_1.TabsTrigger, { value: "account" }, "Account"),
                            React.createElement(tabs_1.TabsTrigger, { value: "password" }, "Password"),
                            React.createElement(tabs_1.TabsTrigger, { value: "settings" }, "Settings")),
                        React.createElement(tabs_1.TabsContent, { value: "account" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Account"),
                                    React.createElement(card_1.CardDescription, null, "Make changes to your account here.")),
                                React.createElement(card_1.CardContent, { className: "space-y-2" },
                                    React.createElement("div", { className: "space-y-1" },
                                        React.createElement(label_1.Label, { htmlFor: "name" }, "Name"),
                                        React.createElement(input_1.Input, { id: "name", defaultValue: "Pedro Duarte" }))),
                                React.createElement(card_1.CardFooter, null,
                                    React.createElement(button_1.Button, null, "Save changes")))),
                        React.createElement(tabs_1.TabsContent, { value: "password" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Password"),
                                    React.createElement(card_1.CardDescription, null, "Change your password here.")),
                                React.createElement(card_1.CardContent, { className: "space-y-2" },
                                    React.createElement("div", { className: "space-y-1" },
                                        React.createElement(label_1.Label, { htmlFor: "current" }, "Current password"),
                                        React.createElement(input_1.Input, { id: "current", type: "password" })),
                                    React.createElement("div", { className: "space-y-1" },
                                        React.createElement(label_1.Label, { htmlFor: "new" }, "New password"),
                                        React.createElement(input_1.Input, { id: "new", type: "password" }))),
                                React.createElement(card_1.CardFooter, null,
                                    React.createElement(button_1.Button, null, "Save password")))),
                        React.createElement(tabs_1.TabsContent, { value: "settings" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Settings"),
                                    React.createElement(card_1.CardDescription, null, "Manage your settings here.")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Settings content goes here.")))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Accordion"),
                    React.createElement(accordion_1.Accordion, { type: "single", collapsible: true, className: "w-full" },
                        React.createElement(accordion_1.AccordionItem, { value: "item-1" },
                            React.createElement(accordion_1.AccordionTrigger, null, "Is it accessible?"),
                            React.createElement(accordion_1.AccordionContent, null, "Yes. It adheres to the WAI-ARIA design pattern.")),
                        React.createElement(accordion_1.AccordionItem, { value: "item-2" },
                            React.createElement(accordion_1.AccordionTrigger, null, "Is it styled?"),
                            React.createElement(accordion_1.AccordionContent, null, "Yes. It comes with default styles that matches the other components' aesthetic.")),
                        React.createElement(accordion_1.AccordionItem, { value: "item-3" },
                            React.createElement(accordion_1.AccordionTrigger, null, "Is it animated?"),
                            React.createElement(accordion_1.AccordionContent, null, "Yes. It's animated by default, but you can disable it if you prefer.")))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Collapsible"),
                    React.createElement(collapsible_1.Collapsible, null,
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "ghost", className: "w-full justify-between" },
                                        React.createElement(card_1.CardTitle, null, "@peduarte starred 3 repositories")))),
                            React.createElement(collapsible_1.CollapsibleContent, null,
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("div", { className: "rounded-md border px-4 py-3 font-mono text-sm" }, "@radix-ui/primitives"),
                                        React.createElement("div", { className: "rounded-md border px-4 py-3 font-mono text-sm" }, "@radix-ui/colors"),
                                        React.createElement("div", { className: "rounded-md border px-4 py-3 font-mono text-sm" }, "@stitches/react"))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Overlays"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex flex-wrap gap-4" },
                                React.createElement(dialog_1.Dialog, { open: dialogOpen, onOpenChange: setDialogOpen },
                                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Open Dialog")),
                                    React.createElement(dialog_1.DialogContent, null,
                                        React.createElement(dialog_1.DialogHeader, null,
                                            React.createElement(dialog_1.DialogTitle, null, "Test Input"),
                                            React.createElement(dialog_1.DialogDescription, null, "Enter some text below. Press Enter to submit (IME composition supported).")),
                                        React.createElement("div", { className: "space-y-4 py-4" },
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "dialog-input" }, "Input"),
                                                React.createElement(input_1.Input, { id: "dialog-input", placeholder: "Type something...", value: dialogInput, onChange: function (e) { return setDialogInput(e.target.value); }, onKeyDown: handleDialogKeyDown, autoFocus: true }))),
                                        React.createElement("div", { className: "flex justify-end gap-2" },
                                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setDialogOpen(false); } }, "Cancel"),
                                            React.createElement(button_1.Button, { onClick: handleDialogSubmit }, "Submit")))),
                                React.createElement(sheet_1.Sheet, null,
                                    React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Open Sheet")),
                                    React.createElement(sheet_1.SheetContent, null,
                                        React.createElement(sheet_1.SheetHeader, null,
                                            React.createElement(sheet_1.SheetTitle, null, "Edit profile"),
                                            React.createElement(sheet_1.SheetDescription, null, "Make changes to your profile here. Click save when you're done.")))),
                                React.createElement(drawer_1.Drawer, null,
                                    React.createElement(drawer_1.DrawerTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Open Drawer")),
                                    React.createElement(drawer_1.DrawerContent, null,
                                        React.createElement(drawer_1.DrawerHeader, null,
                                            React.createElement(drawer_1.DrawerTitle, null, "Are you absolutely sure?"),
                                            React.createElement(drawer_1.DrawerDescription, null, "This action cannot be undone.")),
                                        React.createElement(drawer_1.DrawerFooter, null,
                                            React.createElement(button_1.Button, null, "Submit"),
                                            React.createElement(drawer_1.DrawerClose, { asChild: true },
                                                React.createElement(button_1.Button, { variant: "outline" }, "Cancel"))))),
                                React.createElement(popover_1.Popover, null,
                                    React.createElement(popover_1.PopoverTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Open Popover")),
                                    React.createElement(popover_1.PopoverContent, null,
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("h4", { className: "font-medium leading-none" }, "Dimensions"),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Set the dimensions for the layer.")))),
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Hover me")),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Add to library"))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Menus"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex flex-wrap gap-4" },
                                React.createElement(dropdown_menu_1.DropdownMenu, null,
                                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Dropdown Menu")),
                                    React.createElement(dropdown_menu_1.DropdownMenuContent, null,
                                        React.createElement(dropdown_menu_1.DropdownMenuLabel, null, "My Account"),
                                        React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, null, "Profile"),
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, null, "Billing"),
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, null, "Team"),
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, null, "Subscription"))),
                                React.createElement(context_menu_1.ContextMenu, null,
                                    React.createElement(context_menu_1.ContextMenuTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Right Click Me")),
                                    React.createElement(context_menu_1.ContextMenuContent, null,
                                        React.createElement(context_menu_1.ContextMenuItem, null, "Profile"),
                                        React.createElement(context_menu_1.ContextMenuItem, null, "Billing"),
                                        React.createElement(context_menu_1.ContextMenuItem, null, "Team"),
                                        React.createElement(context_menu_1.ContextMenuItem, null, "Subscription"))),
                                React.createElement(hover_card_1.HoverCard, null,
                                    React.createElement(hover_card_1.HoverCardTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Hover Card")),
                                    React.createElement(hover_card_1.HoverCardContent, null,
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("h4", { className: "text-sm font-semibold" }, "@nextjs"),
                                            React.createElement("p", { className: "text-sm" }, "The React Framework \u2013 created and maintained by @vercel.")))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Calendar"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 flex justify-center" },
                            React.createElement(calendar_1.Calendar, { mode: "single", selected: date, onSelect: setDate, className: "rounded-md border" })))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Carousel"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement(carousel_1.Carousel, { className: "w-full max-w-xs mx-auto" },
                                React.createElement(carousel_1.CarouselContent, null, Array.from({ length: 5 }).map(function (_, index) { return (React.createElement(carousel_1.CarouselItem, { key: "carousel-" + index },
                                    React.createElement("div", { className: "p-1" },
                                        React.createElement(card_1.Card, null,
                                            React.createElement(card_1.CardContent, { className: "flex aspect-square items-center justify-center p-6" },
                                                React.createElement("span", { className: "text-4xl font-semibold" }, index + 1)))))); })),
                                React.createElement(carousel_1.CarouselPrevious, null),
                                React.createElement(carousel_1.CarouselNext, null))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Toggle"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Toggle"),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(toggle_1.Toggle, { "aria-label": "Toggle italic" },
                                        React.createElement("span", { className: "font-bold" }, "B")),
                                    React.createElement(toggle_1.Toggle, { "aria-label": "Toggle italic" },
                                        React.createElement("span", { className: "italic" }, "I")),
                                    React.createElement(toggle_1.Toggle, { "aria-label": "Toggle underline" },
                                        React.createElement("span", { className: "underline" }, "U")))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Toggle Group"),
                                React.createElement(toggle_group_1.ToggleGroup, { type: "multiple" },
                                    React.createElement(toggle_group_1.ToggleGroupItem, { value: "bold", "aria-label": "Toggle bold" },
                                        React.createElement("span", { className: "font-bold" }, "B")),
                                    React.createElement(toggle_group_1.ToggleGroupItem, { value: "italic", "aria-label": "Toggle italic" },
                                        React.createElement("span", { className: "italic" }, "I")),
                                    React.createElement(toggle_group_1.ToggleGroupItem, { value: "underline", "aria-label": "Toggle underline" },
                                        React.createElement("span", { className: "underline" }, "U"))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Layout Components"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Aspect Ratio (16/9)"),
                                React.createElement(aspect_ratio_1.AspectRatio, { ratio: 16 / 9, className: "bg-muted" },
                                    React.createElement("div", { className: "flex h-full items-center justify-center" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "16:9 Aspect Ratio")))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Scroll Area"),
                                React.createElement(scroll_area_1.ScrollArea, { className: "h-[200px] w-full rounded-md border overflow-hidden" },
                                    React.createElement("div", { className: "p-4" },
                                        React.createElement("div", { className: "space-y-4" }, Array.from({ length: 20 }).map(function (_, i) { return (React.createElement("div", { key: "item-" + i, className: "text-sm" },
                                            "Item ",
                                            i + 1,
                                            ": This is a scrollable content area")); })))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Resizable Panels"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement(resizable_1.ResizablePanelGroup, { direction: "horizontal", className: "min-h-[200px] rounded-lg border" },
                                React.createElement(resizable_1.ResizablePanel, { defaultSize: 50 },
                                    React.createElement("div", { className: "flex h-full items-center justify-center p-6" },
                                        React.createElement("span", { className: "font-semibold" }, "Panel One"))),
                                React.createElement(resizable_1.ResizableHandle, null),
                                React.createElement(resizable_1.ResizablePanel, { defaultSize: 50 },
                                    React.createElement("div", { className: "flex h-full items-center justify-center p-6" },
                                        React.createElement("span", { className: "font-semibold" }, "Panel Two"))))))),
                React.createElement("section", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-semibold" }, "Toast"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Sonner Toast"),
                                React.createElement("div", { className: "flex flex-wrap gap-2" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            sonner_1.toast.success("Operation successful", {
                                                description: "Your changes have been saved"
                                            });
                                        } }, "Success"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            sonner_1.toast.error("Operation failed", {
                                                description: "Cannot complete operation, please try again"
                                            });
                                        } }, "Error"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            sonner_1.toast.info("Information", {
                                                description: "This is an information message"
                                            });
                                        } }, "Info"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            sonner_1.toast.warning("Warning", {
                                                description: "Please note the impact of this operation"
                                            });
                                        } }, "Warning"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            sonner_1.toast.loading("Loading", {
                                                description: "Please wait"
                                            });
                                        } }, "Loading"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            var promise = new Promise(function (resolve) {
                                                return setTimeout(resolve, 2000);
                                            });
                                            sonner_1.toast.promise(promise, {
                                                loading: "Processing...",
                                                success: "Processing complete!",
                                                error: "Processing failed"
                                            });
                                        } }, "Promise")))))))),
        React.createElement("footer", { className: "border-t py-6 mt-12" },
            React.createElement("div", { className: "container text-center text-sm text-muted-foreground" },
                React.createElement("p", null, "Shadcn/ui Component Showcase")))));
}
exports["default"] = ComponentsShowcase;
