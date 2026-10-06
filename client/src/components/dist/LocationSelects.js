"use strict";
/**
 * Location Select Components
 * Provides scrollable dropdown selects for Country, County, and City/Town
 */
exports.__esModule = true;
exports.IndustrySelect = exports.CitySelect = exports.CountySelect = exports.CountrySelect = void 0;
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var locations_1 = require("@/data/locations");
var react_1 = require("react");
function CountrySelect(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Select a country" : _b, label = _a.label, required = _a.required;
    return (React.createElement("div", { className: "space-y-2" },
        label && (React.createElement(label_1.Label, null,
            label,
            required && React.createElement("span", { className: "text-red-500" }, "*"))),
        React.createElement(select_1.Select, { value: value, onValueChange: onChange },
            React.createElement(select_1.SelectTrigger, { className: "w-full" },
                React.createElement(select_1.SelectValue, { placeholder: placeholder })),
            React.createElement(select_1.SelectContent, null, locations_1.COUNTRIES.map(function (country) { return (React.createElement(select_1.SelectItem, { key: country, value: country, className: "cursor-pointer" }, country)); })))));
}
exports.CountrySelect = CountrySelect;
function CountySelect(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Select a county" : _b, label = _a.label, required = _a.required;
    return (React.createElement("div", { className: "space-y-2" },
        label && (React.createElement(label_1.Label, null,
            label,
            required && React.createElement("span", { className: "text-red-500" }, "*"))),
        React.createElement(select_1.Select, { value: value, onValueChange: onChange },
            React.createElement(select_1.SelectTrigger, { className: "w-full" },
                React.createElement(select_1.SelectValue, { placeholder: placeholder })),
            React.createElement(select_1.SelectContent, null, locations_1.KENYAN_COUNTIES_NAMES.map(function (county) { return (React.createElement(select_1.SelectItem, { key: county, value: county, className: "cursor-pointer" }, county)); })))));
}
exports.CountySelect = CountySelect;
function CitySelect(_a) {
    var value = _a.value, onChange = _a.onChange, county = _a.county, country = _a.country, _b = _a.placeholder, placeholder = _b === void 0 ? "Select a city/town" : _b, label = _a.label, required = _a.required;
    var _c = react_1.useState(locations_1.KENYAN_CITIES), cities = _c[0], setCities = _c[1];
    react_1.useEffect(function () {
        if (county) {
            var countyCities = locations_1.getCitiesByCounty(county);
            setCities(countyCities.length > 0 ? countyCities : locations_1.KENYAN_CITIES);
        }
        else if (country) {
            var countryCities = locations_1.getCitiesByCountry(country);
            setCities(countryCities.length > 0 ? countryCities : []);
        }
        else {
            setCities(locations_1.KENYAN_CITIES);
        }
    }, [county, country]);
    return (React.createElement("div", { className: "space-y-2" },
        label && (React.createElement(label_1.Label, null,
            label,
            required && React.createElement("span", { className: "text-red-500" }, "*"))),
        React.createElement(select_1.Select, { value: value, onValueChange: onChange },
            React.createElement(select_1.SelectTrigger, { className: "w-full" },
                React.createElement(select_1.SelectValue, { placeholder: placeholder })),
            React.createElement(select_1.SelectContent, null, cities.map(function (city) { return (React.createElement(select_1.SelectItem, { key: city, value: city, className: "cursor-pointer" }, city)); })))));
}
exports.CitySelect = CitySelect;
function IndustrySelect(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Select industry" : _b, label = _a.label, required = _a.required;
    return (React.createElement("div", { className: "space-y-2" },
        label && (React.createElement(label_1.Label, null,
            label,
            required && React.createElement("span", { className: "text-red-500" }, "*"))),
        React.createElement(select_1.Select, { value: value || "", onValueChange: onChange },
            React.createElement(select_1.SelectTrigger, null,
                React.createElement(select_1.SelectValue, { placeholder: placeholder })),
            React.createElement(select_1.SelectContent, null, locations_1.INDUSTRIES.map(function (industry) { return (React.createElement(select_1.SelectItem, { key: industry, value: industry, className: "cursor-pointer" }, industry)); })))));
}
exports.IndustrySelect = IndustrySelect;
