"use strict";
/**
 * Shared client health score computation.
 * Used across both global CRM (Clients.tsx, ClientDetails.tsx)
 * and org-tenant CRM (OrgCRM.tsx, OrgClientDetail.tsx).
 *
 * Algorithm mirrors server-side multiTenancy.getClientsHealthScores so that
 * client-list scores (server-computed) and detail-page scores (client-computed)
 * remain identical.
 */
exports.__esModule = true;
exports.computeHealthScoreForClient = exports.computeHealthScore = void 0;
function computeHealthScore(invoices, projects) {
    var totalInv = invoices.length;
    var paidInv = invoices.filter(function (i) { return i.status === "paid"; }).length;
    var overdueInv = invoices.filter(function (i) { return i.status === "overdue"; }).length;
    // Payment score (max 50 pts)
    var paymentScore = totalInv > 0 ? Math.round((paidInv / totalInv) * 50) : 25;
    // Overdue penalty (max 20 pts)
    var overduePenalty = totalInv > 0 ? Math.round((overdueInv / totalInv) * 20) : 0;
    // Engagement score (max 30 pts) — active or planning projects
    var activeProjects = projects.filter(function (p) { return p.status === "active" || p.status === "planning"; }).length;
    var engagementScore = activeProjects > 0 ? Math.min(30, activeProjects * 15) : 10;
    // Recency score (max 20 pts) — had an invoice in last 90 days
    var ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    var now = Date.now();
    var hasRecent = invoices.some(function (i) {
        var d = i.issueDate || i.createdAt;
        return d && now - new Date(String(d)).getTime() < ninetyDaysMs;
    });
    var recencyScore = hasRecent ? 20 : 5;
    var raw = paymentScore - overduePenalty + engagementScore + recencyScore;
    var score = Math.max(0, Math.min(100, raw));
    var label = "Critical";
    var color = "#ef4444";
    if (score >= 80) {
        label = "Excellent";
        color = "#22c55e";
    }
    else if (score >= 60) {
        label = "Good";
        color = "#3b82f6";
    }
    else if (score >= 40) {
        label = "At Risk";
        color = "#f59e0b";
    }
    return {
        score: score,
        label: label,
        color: color,
        breakdown: [
            { label: "Payments", value: Math.round((paymentScore / 50) * 100), color: "#22c55e" },
            { label: "Engagement", value: Math.round((engagementScore / 30) * 100), color: "#3b82f6" },
            { label: "Recency", value: Math.round((recencyScore / 20) * 100), color: "#a855f7" },
        ]
    };
}
exports.computeHealthScore = computeHealthScore;
/** Convenience wrapper for client-list pages that batch-filter per clientId. */
function computeHealthScoreForClient(clientId, allInvoices, allProjects) {
    return computeHealthScore(allInvoices.filter(function (i) { return i.clientId === clientId; }), allProjects.filter(function (p) { return p.clientId === clientId; }));
}
exports.computeHealthScoreForClient = computeHealthScoreForClient;
