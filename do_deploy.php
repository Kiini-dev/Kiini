<?php
header('Content-Type: text/plain; charset=utf-8');

function deployFailure($message, $status = 500)
{
    http_response_code($status);
    echo "ERROR: {$message}\n";
    exit(1);
}

$deployDir = '/home3/kiiniafr/Kiini';
$upload = $_FILES['file'] ?? null;
if (!is_array($upload) || ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    deployFailure('A valid uploaded deployment ZIP is required.', 400);
}
if (!is_uploaded_file($upload['tmp_name'])) {
    deployFailure('The deployment archive was not received as an HTTP upload.', 400);
}
if (!class_exists(ZipArchive::class)) {
    deployFailure('The PHP ZIP extension is not enabled.');
}
if (!is_dir($deployDir) || !is_writable($deployDir)) {
    deployFailure('The configured application directory is missing or not writable.');
}

$archive = new ZipArchive();
if ($archive->open($upload['tmp_name']) !== true) {
    deployFailure('The uploaded deployment archive is invalid.', 400);
}

$requiredFiles = ['dist/index.js', 'dist/public/index.html', 'scripts/migrate.mjs', 'do_restart.sh'];
$archiveFiles = [];
for ($index = 0; $index < $archive->numFiles; $index++) {
    $name = $archive->getNameIndex($index);
    $normalizedName = str_replace('\\', '/', (string)$name);
    if ($normalizedName === '' || $normalizedName[0] === '/' || preg_match('/^[A-Za-z]:/', $normalizedName) || preg_match('~(^|/)\.\.(?:/|$)~', $normalizedName)) {
        $archive->close();
        deployFailure('The deployment archive contains an unsafe path.', 400);
    }
    $archiveFiles[$normalizedName] = true;
}

foreach ($requiredFiles as $requiredFile) {
    if (!isset($archiveFiles[$requiredFile])) {
        $archive->close();
        deployFailure("The deployment archive is missing {$requiredFile}.", 400);
    }
}

if (!$archive->extractTo($deployDir)) {
    $archive->close();
    deployFailure('Could not extract the deployment archive.');
}
$archive->close();

$restartScript = $deployDir . '/do_restart.sh';
$output = [];
$exitCode = 0;
exec('bash ' . escapeshellarg($restartScript) . ' 2>&1', $output, $exitCode);
echo implode("\n", $output) . "\n";
if ($exitCode !== 0) {
    deployFailure('Application restart or local health check failed.');
}

echo "Deployment completed and local health check passed.\n";
?>