<?php
header('Content-Type: text/plain');
$allowed = ['app.log', 'app_restart.log', 'monitor.log'];
$file = $_GET['file'] ?? 'app.log';
if (!in_array($file, $allowed, true)) {
    echo "Invalid file specified. Allowed: " . implode(', ', $allowed);
    exit(1);
}
$path = __DIR__ . DIRECTORY_SEPARATOR . $file;
if (!file_exists($path)) {
    echo "File not found: $path";
    exit(1);
}
$contents = file_get_contents($path);
echo $contents !== false ? $contents : "Unable to read file";
