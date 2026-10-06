"use strict";
/**
 * Department-Role Head Mapping
 * Maps departments to their default role-based heads
 */
exports.__esModule = true;
exports.getDepartmentsWithRoleDefaults = exports.hasDefaultHeadRole = exports.getSuggestedHeadRoles = exports.getDefaultHeadRole = exports.departmentHeadRoleMap = void 0;
/**
 * Map department names to default head roles
 */
exports.departmentHeadRoleMap = {
    'HR': 'hr',
    'Human Resources': 'hr',
    'HR Management': 'hr',
    'People & Culture': 'hr',
    'Finance': 'accountant',
    'Accounting': 'accountant',
    'Accounts': 'accountant',
    'Financial Services': 'accountant',
    'CFO Office': 'accountant',
    'ICT': 'ict_manager',
    'IT': 'ict_manager',
    'Information Technology': 'ict_manager',
    'Technology': 'ict_manager',
    'Systems': 'ict_manager',
    'Sales': 'sales_manager',
    'Sales & Marketing': 'sales_manager',
    'Revenue': 'sales_manager',
    'Procurement': 'procurement_manager',
    'Procurement & Supply': 'procurement_manager',
    'Supply Chain': 'procurement_manager',
    'Operations': 'admin',
    'Administration': 'admin',
    'Admin Services': 'admin',
    'Projects': 'project_manager',
    'Project Management': 'project_manager',
    'PMO': 'project_manager'
};
/**
 * Get the default head role for a department
 * @param departmentName - Name of the department
 * @returns Role string or undefined
 */
function getDefaultHeadRole(departmentName) {
    if (!departmentName)
        return undefined;
    var normalized = departmentName.trim();
    // Exact match
    if (exports.departmentHeadRoleMap[normalized]) {
        return exports.departmentHeadRoleMap[normalized];
    }
    // Case-insensitive match
    for (var _i = 0, _a = Object.entries(exports.departmentHeadRoleMap); _i < _a.length; _i++) {
        var _b = _a[_i], dept = _b[0], role = _b[1];
        if (dept.toLowerCase() === normalized.toLowerCase()) {
            return role;
        }
    }
    return undefined;
}
exports.getDefaultHeadRole = getDefaultHeadRole;
/**
 * Get list of suggested head roles for a department
 * @param departmentName - Name of the department
 * @returns Array of role strings
 */
function getSuggestedHeadRoles(departmentName) {
    var role = getDefaultHeadRole(departmentName);
    return role ? [role] : [];
}
exports.getSuggestedHeadRoles = getSuggestedHeadRoles;
/**
 * Check if a department should auto-assign a head based on role
 * @param departmentName - Name of the department
 * @returns true if the department has a role-based default head
 */
function hasDefaultHeadRole(departmentName) {
    return !!getDefaultHeadRole(departmentName);
}
exports.hasDefaultHeadRole = hasDefaultHeadRole;
/**
 * Get all departments that have role-based defaults
 */
function getDepartmentsWithRoleDefaults() {
    return Object.keys(exports.departmentHeadRoleMap);
}
exports.getDepartmentsWithRoleDefaults = getDepartmentsWithRoleDefaults;
