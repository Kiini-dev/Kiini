<?php
header('Content-Type: text/plain');
$envPath = getenv('PATH');
if ($envPath === false) { $envPath = '<PATH unavailable>'; }
echo "PATH={$envPath}\n";
$whichNode = trim(shell_exec('which node 2>&1'));
$commandNode = trim(shell_exec('command -v node 2>&1'));
echo "which node={$whichNode}\n";
echo "command -v node={$commandNode}\n";
$paths = ['/usr/local/bin', '/usr/bin', '/bin', '/home/melitec1/.nvm/versions/node', '/opt/node'];
foreach ($paths as $path) {
    echo "LIST $path:\n";
    $ls = trim(shell_exec('ls -la ' . escapeshellarg($path) . ' 2>&1'));
    echo $ls . "\n";
}
?>