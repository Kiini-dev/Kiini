"use strict";
/**
 * In-memory metrics collector for system health monitoring.
 * Tracks request counts, response times, errors, and DB queries.
 */
exports.__esModule = true;
exports.metricsCollector = void 0;
var BUCKET_DURATION_MS = 60000; // 1 minute per bucket
var MAX_BUCKETS = 60 * 24; // Keep 24 hours of data
var buckets = [];
var activeConnections = 0;
var cacheHits = 0;
var cacheMisses = 0;
function getCurrentBucket() {
    var now = Date.now();
    var bucketTs = now - (now % BUCKET_DURATION_MS);
    if (buckets.length === 0 || buckets[buckets.length - 1].timestamp !== bucketTs) {
        var bucket = {
            timestamp: bucketTs,
            requests: 0,
            errors: 0,
            totalResponseTime: 0,
            dbQueries: 0
        };
        buckets.push(bucket);
        // Prune old buckets
        if (buckets.length > MAX_BUCKETS) {
            buckets = buckets.slice(-MAX_BUCKETS);
        }
        return bucket;
    }
    return buckets[buckets.length - 1];
}
function getBucketsForPeriod(period) {
    var now = Date.now();
    var durations = {
        "1h": 60 * 60000,
        "24h": 24 * 60 * 60000,
        "7d": 7 * 24 * 60 * 60000,
        "30d": 30 * 24 * 60 * 60000
    };
    var cutoff = now - (durations[period] || durations["24h"]);
    return buckets.filter(function (b) { return b.timestamp >= cutoff; });
}
exports.metricsCollector = {
    recordRequest: function (responseTimeMs, isError) {
        var bucket = getCurrentBucket();
        bucket.requests++;
        bucket.totalResponseTime += responseTimeMs;
        if (isError)
            bucket.errors++;
    },
    recordDbQuery: function () {
        getCurrentBucket().dbQueries++;
    },
    recordCacheHit: function () {
        cacheHits++;
    },
    recordCacheMiss: function () {
        cacheMisses++;
    },
    incrementConnections: function () {
        activeConnections++;
    },
    decrementConnections: function () {
        activeConnections = Math.max(0, activeConnections - 1);
    },
    getMetrics: function (period) {
        if (period === void 0) { period = "24h"; }
        var relevantBuckets = getBucketsForPeriod(period);
        if (relevantBuckets.length === 0) {
            return {
                requestsPerMinute: 0,
                averageResponseTime: 0,
                errorRate: 0,
                activeConnections: activeConnections,
                databaseQueries: 0,
                cacheHitRate: 0
            };
        }
        var totalRequests = relevantBuckets.reduce(function (s, b) { return s + b.requests; }, 0);
        var totalErrors = relevantBuckets.reduce(function (s, b) { return s + b.errors; }, 0);
        var totalResponseTime = relevantBuckets.reduce(function (s, b) { return s + b.totalResponseTime; }, 0);
        var totalDbQueries = relevantBuckets.reduce(function (s, b) { return s + b.dbQueries; }, 0);
        var minutesElapsed = Math.max(1, relevantBuckets.length);
        var totalCacheOps = cacheHits + cacheMisses;
        return {
            requestsPerMinute: Math.round(totalRequests / minutesElapsed),
            averageResponseTime: totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0,
            errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100 * 100) / 100 : 0,
            activeConnections: activeConnections,
            databaseQueries: totalDbQueries,
            cacheHitRate: totalCacheOps > 0 ? Math.round((cacheHits / totalCacheOps) * 100 * 100) / 100 : 100
        };
    }
};
