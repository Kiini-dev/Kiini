#!/usr/bin/env node

/**
 * Kiini Production Deployment Script
 * Usage: npm run deploy
 * 
 * This script:
 * 1. Builds the application locally (vite + esbuild)
 * 2. Runs database migrations on the production database
 * 3. Uploads files to the cPanel server via File Manager API
 * 4. Copies .env.production → .env on server
 * 5. Prints instructions for npm install + restart
 */
"use strict";

var _child_process = require("child_process");

var _fs = require("fs");

var _path = require("path");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ═══════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════
var CONFIG = {
  cpanelHost: 'kiini.africa',
  cpanelPort: 2083,
  cpanelUser: 'melitec1',
  cpanelApiToken: '7GQU253FC5G4GXSITMD1TE1NTSQ7T570',
  appRoot: 'Kiini',
  serverDir: '/home/melitec1/Kiini',
  domain: 'kiini.africa',
  nodeVersion: '22',
  startupFile: 'dist/index.js'
};
var C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(color) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  console.log("".concat(color).concat(args.join(' ')).concat(C.reset));
}

function header(title) {
  console.log("\n".concat(C.bold).concat(C.blue).concat('═'.repeat(60)).concat(C.reset));
  log(C.bold + C.blue, "  ".concat(title));
  console.log("".concat(C.bold).concat(C.blue).concat('═'.repeat(60)).concat(C.reset, "\n"));
}

function step(num, msg) {
  log(C.cyan, "[Step ".concat(num, "] ").concat(msg));
} // ═══════════════════════════════════════════════
// cPanel API helper
// ═══════════════════════════════════════════════


function cpanelApi(endpoint) {
  var url, resp;
  return regeneratorRuntime.async(function cpanelApi$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          url = "https://".concat(CONFIG.cpanelHost, ":").concat(CONFIG.cpanelPort, "/execute/").concat(endpoint);
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch(url, {
            headers: {
              'Authorization': "cpanel ".concat(CONFIG.cpanelUser, ":").concat(CONFIG.cpanelApiToken)
            }
          }));

        case 3:
          resp = _context.sent;
          return _context.abrupt("return", resp.json());

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
} // ═══════════════════════════════════════════════
// Step 1: Build
// ═══════════════════════════════════════════════


function buildApp() {
  step(1, 'Building application...');
  log(C.dim, '   Building frontend (Vite)...');
  (0, _child_process.execSync)('npx vite build', {
    stdio: 'inherit',
    env: _objectSpread({}, process.env, {
      NODE_ENV: 'production'
    })
  });
  log(C.dim, '   Building backend (esbuild)...');
  (0, _child_process.execSync)('npx esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit'
  });
  var distFile = (0, _path.resolve)('dist/index.js');
  var distPublic = (0, _path.resolve)('dist/public');
  if (!(0, _fs.existsSync)(distFile)) throw new Error('Build failed: dist/index.js not created');
  if (!(0, _fs.existsSync)(distPublic)) throw new Error('Build failed: dist/public/ not created');
  var serverSize = (0, _fs.statSync)(distFile).size;
  var publicFiles = (0, _fs.readdirSync)(distPublic, {
    recursive: true
  }).length;
  log(C.green, "   \u2705 Build complete");
  log(C.dim, "   Server bundle: ".concat((serverSize / 1024 / 1024).toFixed(2), "MB | Frontend files: ").concat(publicFiles));
} // ═══════════════════════════════════════════════
// Step 2: Migrations
// ═══════════════════════════════════════════════


function runMigrations() {
  step(2, 'Running database migrations...');

  try {
    (0, _child_process.execSync)('node scripts/migrate.mjs', {
      stdio: 'inherit',
      env: _objectSpread({}, process.env, {
        NODE_ENV: 'production'
      })
    });
    log(C.green, '   ✅ Migrations complete');
  } catch (_unused) {
    log(C.yellow, '   ⚠️  Some migrations had issues (check output above)');
    log(C.yellow, '   Continuing with deployment...');
  }
} // ═══════════════════════════════════════════════
// Step 3: Create & Upload archive
// ═══════════════════════════════════════════════


function uploadToServer() {
  var deployFiles, archiveSize, uploadResult, parsed, extractResult;
  return regeneratorRuntime.async(function uploadToServer$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          step(3, 'Creating deployment archive...');
          deployFiles = ['dist/', 'drizzle/', 'scripts/migrate.mjs', 'package.json', 'pnpm-lock.yaml', '.env.production'].filter(function (f) {
            return (0, _fs.existsSync)((0, _path.resolve)(f));
          });
          log(C.dim, "   Packaging: ".concat(deployFiles.join(', '))); // Create tar.gz

          try {
            (0, _child_process.execSync)("tar -czf deploy-package.tar.gz ".concat(deployFiles.join(' ')), {
              stdio: 'pipe'
            });
          } catch (_unused2) {
            (0, _child_process.execSync)("tar.exe -czf deploy-package.tar.gz ".concat(deployFiles.join(' ')), {
              stdio: 'pipe'
            });
          }

          archiveSize = (0, _fs.statSync)((0, _path.resolve)('deploy-package.tar.gz')).size;
          log(C.dim, "   Archive: ".concat((archiveSize / 1024 / 1024).toFixed(2), "MB")); // Upload via cPanel File Manager API

          step(4, 'Uploading to server...');
          _context2.prev = 7;
          uploadResult = (0, _child_process.execSync)("curl -s -k " + "-H \"Authorization: cpanel ".concat(CONFIG.cpanelUser, ":").concat(CONFIG.cpanelApiToken, "\" ") + "-F \"dir=".concat(CONFIG.serverDir, "\" ") + "-F \"file-1=@deploy-package.tar.gz\" " + "\"https://".concat(CONFIG.cpanelHost, ":").concat(CONFIG.cpanelPort, "/execute/Fileman/upload_files\""), {
            encoding: 'utf-8',
            timeout: 300000
          });
          parsed = JSON.parse(uploadResult);

          if (parsed.status === 1) {
            log(C.green, '   ✅ Archive uploaded');
          } else {
            log(C.yellow, "   \u26A0\uFE0F  Upload response: ".concat(JSON.stringify(parsed.errors || parsed.messages)));
          }

          _context2.next = 18;
          break;

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](7);
          log(C.red, "   \u274C Upload failed: ".concat(_context2.t0.message));
          log(C.yellow, '   Upload deploy-package.tar.gz manually via cPanel File Manager');
          return _context2.abrupt("return", false);

        case 18:
          // Extract on server
          step(5, 'Extracting archive on server...');
          _context2.prev = 19;
          _context2.next = 22;
          return regeneratorRuntime.awrap(cpanelApi("Fileman/extract?dir=".concat(encodeURIComponent(CONFIG.serverDir), "&file=deploy-package.tar.gz")));

        case 22:
          extractResult = _context2.sent;

          if (extractResult.status === 1) {
            log(C.green, '   ✅ Archive extracted');
          } else {
            log(C.yellow, "   \u26A0\uFE0F  Extract result: ".concat(JSON.stringify(extractResult.errors)));
          }

          _context2.next = 29;
          break;

        case 26:
          _context2.prev = 26;
          _context2.t1 = _context2["catch"](19);
          log(C.yellow, "   \u26A0\uFE0F  Extract may need manual action: ".concat(_context2.t1.message));

        case 29:
          _context2.prev = 29;
          _context2.next = 32;
          return regeneratorRuntime.awrap(cpanelApi("Fileman/copy?dir=".concat(encodeURIComponent(CONFIG.serverDir), "&from=.env.production&to=.env")));

        case 32:
          log(C.green, '   ✅ .env.production → .env');
          _context2.next = 38;
          break;

        case 35:
          _context2.prev = 35;
          _context2.t2 = _context2["catch"](29);
          log(C.yellow, '   ⚠️  Manually copy .env.production to .env on server');

        case 38:
          _context2.prev = 38;
          _context2.next = 41;
          return regeneratorRuntime.awrap(cpanelApi("Fileman/trash?dir=".concat(encodeURIComponent(CONFIG.serverDir), "&files=deploy-package.tar.gz")));

        case 41:
          _context2.next = 45;
          break;

        case 43:
          _context2.prev = 43;
          _context2.t3 = _context2["catch"](38);

        case 45:
          // Cleanup local archive
          try {
            (0, _child_process.execSync)('del deploy-package.tar.gz 2>nul || rm -f deploy-package.tar.gz', {
              stdio: 'pipe'
            });
          } catch (_unused5) {
            /* ignore */
          }

          return _context2.abrupt("return", true);

        case 47:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[7, 13], [19, 26], [29, 35], [38, 43]]);
} // ═══════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════


function deploy() {
  var uploaded;
  return regeneratorRuntime.async(function deploy$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          header('KIINI PRODUCTION DEPLOYMENT');
          log(C.dim, "Target: https://".concat(CONFIG.domain));
          log(C.dim, "Server: ".concat(CONFIG.serverDir, "\n")); // Build

          buildApp();
          console.log(''); // Migrations

          runMigrations();
          console.log(''); // Upload

          _context3.next = 10;
          return regeneratorRuntime.awrap(uploadToServer());

        case 10:
          uploaded = _context3.sent;
          console.log(''); // Final instructions

          header('FINAL STEPS');

          if (uploaded) {
            log(C.green, '  ✅ Files deployed to server!');
            log(C.yellow, '\n  Complete setup in cPanel Terminal:\n');
          } else {
            log(C.yellow, '  Upload manually, then run in cPanel Terminal:\n');
          }

          log(C.cyan, '  source /home/melitec1/nodevenv/Kiini/22/bin/activate');
          log(C.cyan, '  cd /home/melitec1/Kiini');
          log(C.cyan, '  npm install --production');
          log(C.cyan, '  node scripts/migrate.mjs');
          log(C.cyan, '  cloudlinux-selector restart --json --interpreter nodejs --app-root Kiini');
          console.log('');
          log(C.green, "  \uD83C\uDF10 Site: https://".concat(CONFIG.domain, "\n"));
          _context3.next = 28;
          break;

        case 23:
          _context3.prev = 23;
          _context3.t0 = _context3["catch"](0);
          log(C.red, "\n\u274C Deployment failed: ".concat(_context3.t0.message));
          if (_context3.t0.stack) log(C.dim, _context3.t0.stack);
          process.exit(1);

        case 28:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 23]]);
}

deploy();