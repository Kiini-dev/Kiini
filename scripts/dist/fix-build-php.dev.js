#!/usr/bin/env node
"use strict";

var fs = require('fs');

var path = require('path');

var _require = require('child_process'),
    execSync = _require.execSync;

var colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};
console.log("\n".concat(colors.cyan, "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557").concat(colors.reset, "\n").concat(colors.cyan, "\u2551  BUILD.PHP UPLOAD & PRODUCTION BUILD HELPER              \u2551").concat(colors.reset, "\n").concat(colors.cyan, "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D").concat(colors.reset, "\n\n").concat(colors.yellow, "\u26A0\uFE0F  ACTION REQUIRED:").concat(colors.reset, "\nThe build.php file on production is empty and needs to be fixed.\n\n").concat(colors.cyan, "STEP 1: Manual File Manager Upload").concat(colors.reset, "\n1. Go to: https://kiini.africa:2083/cpsess4823000933/frontend/jupiter/filemanager/\n2. Navigate to: /home/melitec1/kiini.africa/\n3. Find the empty build.php file (0 bytes)\n4. Right-click on it \u2192 Edit (or double-click)\n5. Delete any existing content\n6. Paste this PHP code:\n\n```php\n<?php\n$cmd = $_GET['cmd'] ?? 'status';\n$app_dir = dirname(__FILE__);\nchdir($app_dir);\nheader('Content-Type: application/json');\n\nif ($cmd === 'install') {\n    $output = shell_exec('npm install --production 2>&1');\n    echo json_encode(['cmd' => 'install', 'output' => $output, 'cwd' => getcwd()]);\n} else if ($cmd === 'build') {\n    $output = shell_exec('npm run build 2>&1');\n    echo json_encode(['cmd' => 'build', 'output' => $output, 'cwd' => getcwd()]);\n} else if ($cmd === 'status') {\n    echo json_encode([\n        'node' => trim(shell_exec('node --version 2>&1')),\n        'npm' => trim(shell_exec('npm --version 2>&1')),\n        'cwd' => getcwd(),\n        'node_modules' => is_dir('node_modules'),\n        'dist' => is_dir('dist'),\n        'env' => file_exists('.env')\n    ]);\n}\n?>\n```\n\n7. Save the file (Ctrl+S)\n\n").concat(colors.cyan, "STEP 2: Test the Build Script").concat(colors.reset, "\nOnce saved, test it by visiting:\n").concat(colors.green, "\u2713 https://kiini.africa/build.php?cmd=status").concat(colors.reset, "\n\nThis should return JSON showing Node/npm versions and file status.\n\n").concat(colors.cyan, "STEP 3: Run Production Build").concat(colors.reset, "\nThen execute npm commands:\n").concat(colors.green, "\u2713 https://kiini.africa/build.php?cmd=install").concat(colors.reset, " (wait 2-3 min)\n").concat(colors.green, "\u2713 https://kiini.africa/build.php?cmd=build").concat(colors.reset, " (wait 30-60 sec)\n\n").concat(colors.cyan, "STEP 4: Restart Node.js").concat(colors.reset, "\nGo to: cPanel \u2192 Node.js Manager\nClick the ").concat(colors.yellow, "RESTART").concat(colors.reset, " button for kiini.africa\n\n").concat(colors.cyan, "STEP 5: Verify Application").concat(colors.reset, "\nVisit: ").concat(colors.green, "https://kiini.africa/").concat(colors.reset, "\nYou should see the login page (no more 404 or 503 error!)\n\n").concat(colors.cyan, "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550").concat(colors.reset, "\n").concat(colors.yellow, "OPTIONAL: Copy build.php to clipboard").concat(colors.reset, "\n")); // Display the PHP file content from the local workspace

var buildPhpPath = path.resolve(__dirname, '../build.php');

if (fs.existsSync(buildPhpPath)) {
  var content = fs.readFileSync(buildPhpPath, 'utf-8');
  console.log("\n".concat(colors.green, "\u2713 build.php found locally (").concat((fs.statSync(buildPhpPath).size / 1024).toFixed(2), "KB)").concat(colors.reset, "\n"));
  console.log('Copy this to your clipboard and paste into the File Manager editor:\n');
  console.log("".concat(colors.blue).concat(content).concat(colors.reset, "\n"));
} else {
  console.log("".concat(colors.red, "\u2717 build.php not found at ").concat(buildPhpPath).concat(colors.reset, "\n"));
}

console.log("".concat(colors.cyan, "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550").concat(colors.reset, "\n"));