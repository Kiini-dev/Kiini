<?php
header('Content-Type: text/plain');
$paths = ['/usr', '/opt', '/home'];
foreach ($paths as $path) {
    echo "SEARCH $path:\n";
    $cmd = "find " . escapeshellarg($path) . " -maxdepth 5 -type f \( -name 'node' -o -name 'nodejs' -o -name 'node*' \) 2>/dev/null | grep -E 'node$|nodejs$' | sort | head -50";
    $out = shell_exec($cmd);
    echo $out ?: "<none>\n";
    echo "---\n";
}
?>