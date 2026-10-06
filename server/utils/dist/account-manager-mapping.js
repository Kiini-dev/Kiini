"use strict";
/**
 * Client Account Manager Role Mapping
 * Maps common roles to account manager responsibilities
 */
exports.__esModule = true;
exports.hasDefaultAccountManagerRole = exports.getSuggestedAccountManagerRoles = exports.getDefaultAccountManagerRole = exports.accountManagerRoleMap = void 0;
exports.accountManagerRoleMap = {
    'sales_manager': 'sales_manager',
    'account_executive': 'sales_manager',
    'business_development_manager': 'sales_manager',
    'sales': 'sales_manager',
    'customer_success_manager': 'customer_success_manager',
    'account_manager': 'sales_manager',
    'relationship_manager': 'sales_manager'
};
/**
 * Get the default role for an account manager based on role name
 */
function getDefaultAccountManagerRole(roleName) {
    if (!roleName)
        return null;
    var normalizedRole = roleName.toLowerCase().trim();
    // Direct match
    if (exports.accountManagerRoleMap[normalizedRole]) {
        return exports.accountManagerRoleMap[normalizedRole];
    }
    // Check for contains patterns
    if (normalizedRole.includes('sales') || normalizedRole.includes('manager')) {
        return 'sales_manager';
    }
    if (normalizedRole.includes('customer') || normalizedRole.includes('success')) {
        return 'customer_success_manager';
    }
    return null;
}
exports.getDefaultAccountManagerRole = getDefaultAccountManagerRole;
/**
 * Get suggested account manager roles (in priority order)
 */
function getSuggestedAccountManagerRoles() {
    return ['sales_manager', 'customer_success_manager'];
}
exports.getSuggestedAccountManagerRoles = getSuggestedAccountManagerRoles;
/**
 * Check if a role has a suggested account manager role
 */
function hasDefaultAccountManagerRole(roleName) {
    return getDefaultAccountManagerRole(roleName) !== null;
}
exports.hasDefaultAccountManagerRole = hasDefaultAccountManagerRole;
