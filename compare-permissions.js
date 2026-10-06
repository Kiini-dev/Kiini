#!/usr/bin/env node

/**
 * Permission Synchronization Checker
 * Compares client and server FEATURE_ACCESS definitions
 * 
 * Usage: node compare-permissions.js
 */

import fs from 'fs';
import path from 'path';

// Extract FEATURE_ACCESS from a file
function extractFeatureAccess(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the FEATURE_ACCESS object
  const match = content.match(/export const FEATURE_ACCESS[:\s]*Record[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!match) {
    console.error(`Could not extract FEATURE_ACCESS from ${filePath}`);
    return {};
  }

  const objectStr = '{' + match[1] + '}';
  
  // Simple parser to extract features and their role arrays
  const features = {};
  const lines = match[1].split('\n');
  
  let currentFeature = null;
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//')) continue;
    
    // Match feature definition
    const featureMatch = trimmed.match(/^"([^"]+)":\s*\[(.*?)\]/);
    if (featureMatch) {
      const featureName = featureMatch[1];
      const rolesStr = featureMatch[2];
      
      // Parse roles
      const roles = rolesStr
        .split(',')
        .map(r => r.trim().replace(/["']/g, ''))
        .filter(r => r);
      
      features[featureName] = roles;
    }
  }
  
  return features;
}

// Main comparison
function comparePermissions() {
  const clientPath = 'client/src/lib/permissions.ts';
  const serverPath = 'server/middleware/enhancedRbac.ts';
  
  console.log('📊 Permission Synchronization Report\n');
  console.log('=' .repeat(80));
  
  let clientFeatures, serverFeatures;
  
  try {
    clientFeatures = extractFeatureAccess(clientPath);
    serverFeatures = extractFeatureAccess(serverPath);
  } catch (error) {
    console.error('Error reading files:', error.message);
    process.exit(1);
  }
  
  const allFeatures = new Set([...Object.keys(clientFeatures), ...Object.keys(serverFeatures)]);
  const mismatches = [];
  const missing = { client: [], server: [] };
  
  for (const feature of allFeatures) {
    const clientRoles = clientFeatures[feature];
    const serverRoles = serverFeatures[feature];
    
    if (!clientRoles) {
      missing.client.push(feature);
    } else if (!serverRoles) {
      missing.server.push(feature);
    } else {
      // Compare roles
      const clientSet = new Set(clientRoles);
      const serverSet = new Set(serverRoles);
      
      const only_client = [...clientSet].filter(r => !serverSet.has(r));
      const only_server = [...serverSet].filter(r => !clientSet.has(r));
      
      if (only_client.length > 0 || only_server.length > 0) {
        mismatches.push({
          feature,
          clientRoles,
          serverRoles,
          only_client,
          only_server
        });
      }
    }
  }
  
  // Report missing features
  if (missing.client.length > 0) {
    console.log(`\n❌ Missing in CLIENT (${missing.client.length} features):\n`);
    missing.client.sort().forEach(f => {
      console.log(`   ${f}`);
      console.log(`   Server: ${serverFeatures[f].join(', ')}\n`);
    });
  }
  
  if (missing.server.length > 0) {
    console.log(`\n❌ Missing in SERVER (${missing.server.length} features):\n`);
    missing.server.sort().forEach(f => {
      console.log(`   ${f}`);
      console.log(`   Client: ${clientFeatures[f].join(', ')}\n`);
    });
  }
  
  // Report role mismatches
  if (mismatches.length > 0) {
    console.log(`\n⚠️  Role Mismatches (${mismatches.length} features):\n`);
    mismatches.sort((a, b) => a.feature.localeCompare(b.feature)).forEach(m => {
      console.log(`   Feature: ${m.feature}`);
      if (m.only_client.length > 0) {
        console.log(`   ⬅️  Only in CLIENT: ${m.only_client.join(', ')}`);
      }
      if (m.only_server.length > 0) {
        console.log(`   ➡️  Only in SERVER: ${m.only_server.join(', ')}`);
      }
      console.log(`   Client: [${m.clientRoles.join(', ')}]`);
      console.log(`   Server: [${m.serverRoles.join(', ')}]\n`);
    });
  }
  
  // Summary
  console.log('=' .repeat(80));
  console.log(`\n📈 Summary:`);
  console.log(`   Total Features: ${allFeatures.size}`);
  console.log(`   Missing in Client: ${missing.client.length}`);
  console.log(`   Missing in Server: ${missing.server.length}`);
  console.log(`   Role Mismatches: ${mismatches.length}`);
  
  if (mismatches.length === 0 && missing.client.length === 0 && missing.server.length === 0) {
    console.log(`\n✅ All permissions are synchronized!\n`);
  } else {
    console.log(`\n❌ Found ${missing.client.length + missing.server.length + mismatches.length} issues to fix\n`);
  }
}

comparePermissions();
