<?php
header('Content-Type: text/plain');
$allowed = [
  'do_restart.sh',
  'restart_app.sh',
  'deploy-extract.sh',
  'start.sh',
  'do_deploy.php',
  'do_deploy_with_migrate.php',
  'prod_diag.php',
  'read_log.php',
  'server-wrapper.js',
  'app.log',
  'app_restart.log',
];
$file = $_GET['file'] ?? '';
if (!in_array($file, $allowed, true)) {
  echo "Invalid file. Allowed: " . implode(', ', $allowed);
  exit(1);
}
$paths = [
  "/home/melitec1/Kiini/$file",
  "/home3/kiiniafr/public_html/Kiini/$file",
];
$found = null;
foreach ($paths as $path) {
  if (file_exists($path)) {
    $found = $path;
    break;
  }
}
if (!$found) {
  echo "File not found: $file\n";
  exit(1);
}
echo "--- PATH: $found ---\n";
$contents = file_get_contents($found);
echo $contents !== false ? $contents : "Unable to read file";
