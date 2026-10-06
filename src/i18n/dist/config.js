"use strict";
exports.__esModule = true;
var i18next_1 = require("i18next");
var react_i18next_1 = require("react-i18next");
var i18next_browser_languagedetector_1 = require("i18next-browser-languagedetector");
// Translation resources
var resources = {
    en: {
        translation: {
            // Common UI elements
            common: {
                save: 'Save',
                cancel: 'Cancel',
                "delete": 'Delete',
                edit: 'Edit',
                create: 'Create',
                search: 'Search',
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                confirm: 'Confirm',
                back: 'Back',
                next: 'Next',
                previous: 'Previous',
                close: 'Close'
            },
            // Navigation
            nav: {
                dashboard: 'Dashboard',
                crm: 'CRM',
                hr: 'HR',
                procurement: 'Procurement',
                analytics: 'Analytics',
                settings: 'Settings'
            },
            // CRM Module
            crm: {
                contacts: 'Contacts',
                deals: 'Deals',
                leads: 'Leads',
                opportunities: 'Opportunities',
                customers: 'Customers'
            },
            // Currency formatting
            currency: {
                symbol: '$',
                code: 'USD',
                format: '{{amount}} {{symbol}}'
            },
            // Date/Time
            date: {
                short: 'MM/DD/YYYY',
                long: 'MMMM DD, YYYY',
                time: 'HH:mm'
            }
        }
    },
    sw: {
        translation: {
            // Common UI elements
            common: {
                save: 'Hifadhi',
                cancel: 'Ghairi',
                "delete": 'Futa',
                edit: 'Hariri',
                create: 'Unda',
                search: 'Tafuta',
                loading: 'Inapakia...',
                error: 'Kosa',
                success: 'Mafanikio',
                confirm: 'Thibitisha',
                back: 'Nyuma',
                next: 'Ijayo',
                previous: 'Iliyopita',
                close: 'Funga'
            },
            // Navigation
            nav: {
                dashboard: 'Dashibodi',
                crm: 'CRM',
                hr: 'HR',
                procurement: 'Ununuzi',
                analytics: 'Takwimu',
                settings: 'Mipangilio'
            },
            // CRM Module
            crm: {
                contacts: 'Mawasiliano',
                deals: 'Mikataba',
                leads: 'Wateja Wapya',
                opportunities: 'Fursa',
                customers: 'Wateja'
            },
            // Currency formatting (Kenyan Shilling)
            currency: {
                symbol: 'KSh',
                code: 'KES',
                format: '{{symbol}} {{amount}}'
            },
            // Date/Time
            date: {
                short: 'DD/MM/YYYY',
                long: 'DD MMMM, YYYY',
                time: 'HH:mm'
            }
        }
    }
};
i18next_1["default"]
    .use(i18next_browser_languagedetector_1["default"])
    .use(react_i18next_1.initReactI18next)
    .init({
    resources: resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
        escapeValue: false
    },
    detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
    },
    react: {
        useSuspense: false
    }
});
exports["default"] = i18next_1["default"];
