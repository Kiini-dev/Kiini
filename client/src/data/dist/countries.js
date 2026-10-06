"use strict";
exports.__esModule = true;
exports.getTownsByCounty = exports.getCountiesByCountry = exports.getCountriesByPhoneCode = exports.getCountriesByCode = exports.COUNTRY_PHONE_CODES = exports.COUNTRY_NAMES = exports.COUNTRIES = void 0;
exports.COUNTRIES = [
    {
        name: "Kenya",
        code: "KE",
        phoneCode: "+254",
        counties: [
            { name: "Nairobi", towns: ["CBD", "Westlands", "Karen", "Kilimani", "Upper Hill", "Parklands", "Thika Road", "Gateway"] },
            { name: "Mombasa", towns: ["City Centre", "Likoni", "Changamwe", "Kisauni", "Tudor", "Serani"] },
            { name: "Kisumu", towns: ["CBD", "Nyamaranda", "Ondiek", "Muhoma", "Nyalenda"] },
            { name: "Nakuru", towns: ["CBD", "Kapseret", "Lanet", "Flamingo", "Nairobi Road"] },
            { name: "Eldoret", towns: ["CBD", "Kapsoit", "Langas", "Munyaka", "Mapesi"] },
            { name: "Kiambu", towns: ["Kiambu Town", "Limuru", "Thika", "Banana Hill", "Tigoni"] },
            { name: "Machakos", towns: ["Machakos Town", "Kangundo", "Athi River", "Matungulu", "Mbiuni"] },
            { name: "Naivasha", towns: ["Naivasha Town", "Olkaria", "Mai Mahiu", "Kongoni", "Biashara"] },
            { name: "Nyeri", towns: ["Nyeri Town", "Othaya", "Mukurweini", "Karatina", "Tetu"] },
            { name: "Kericho", towns: ["Kericho Town", "Belgaum", "Chepseon", "Kipchoge", "Silibwet"] },
        ]
    },
    {
        name: "Uganda",
        code: "UG",
        phoneCode: "+256",
        counties: [
            { name: "Kampala", towns: ["CBD", "Kololo", "Mulago", "Kasubi", "Makindye", "Kawempe"] },
            { name: "Wakiso", towns: ["Wakiso", "Namisindwa", "Mukono", "Mpigi"] },
            { name: "Jinja", towns: ["Jinja City", "Dohos", "Bugembe", "Njeru"] },
            { name: "Mbarara", towns: ["Mbarara City", "Kabale", "Kamwenge", "Kyotera"] },
        ]
    },
    {
        name: "Tanzania",
        code: "TZ",
        phoneCode: "+255",
        counties: [
            { name: "Dar es Salaam", towns: ["Dar City", "Kinondoni", "Temeke", "Ilala"] },
            { name: "Dodoma", towns: ["Dodoma City", "Chamwino", "Iringa", "Morogoro"] },
            { name: "Arusha", towns: ["Arusha City", "Moshi", "Kilimanjaro", "Tanga"] },
        ]
    },
    {
        name: "Rwanda",
        code: "RW",
        phoneCode: "+250",
        counties: [
            { name: "Kigali", towns: ["Kigali City", "Kicukiro", "Gasabo", "Nyarugenge"] },
            { name: "Huye", towns: ["Huye Town", "Nyamagabe", "Nyanza"] },
            { name: "Gitarama", towns: ["Gitarama Town", "Rwamagana", "Muhanga"] },
        ]
    },
    {
        name: "South Africa",
        code: "ZA",
        phoneCode: "+27",
        counties: [
            { name: "Gauteng", towns: ["Johannesburg", "Pretoria", "Sandton", "Midrand", "Centurion"] },
            { name: "Western Cape", towns: ["Cape Town", "Stellenbosch", "Bellville", "Observatory"] },
            { name: "KwaZulu-Natal", towns: ["Durban", "Pietermaritzburg", "Pinetown", "Umhlanga"] },
        ]
    },
];
exports.COUNTRY_NAMES = exports.COUNTRIES.map(function (c) { return c.name; });
exports.COUNTRY_PHONE_CODES = exports.COUNTRIES.map(function (c) { return c.phoneCode; });
function getCountriesByCode(code) {
    return exports.COUNTRIES.find(function (c) { return c.code === code; });
}
exports.getCountriesByCode = getCountriesByCode;
function getCountriesByPhoneCode(phoneCode) {
    return exports.COUNTRIES.find(function (c) { return c.phoneCode === phoneCode; });
}
exports.getCountriesByPhoneCode = getCountriesByPhoneCode;
function getCountiesByCountry(countryName) {
    var country = exports.COUNTRIES.find(function (c) { return c.name === countryName; });
    return (country === null || country === void 0 ? void 0 : country.counties) || [];
}
exports.getCountiesByCountry = getCountiesByCountry;
function getTownsByCounty(countryName, countyName) {
    var country = exports.COUNTRIES.find(function (c) { return c.name === countryName; });
    var county = country === null || country === void 0 ? void 0 : country.counties.find(function (co) { return co.name === countyName; });
    return (county === null || county === void 0 ? void 0 : county.towns) || [];
}
exports.getTownsByCounty = getTownsByCounty;
