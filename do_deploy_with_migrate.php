<?php
$zipCandidates = [
    "/home/melitec1/Kiini/deploy.zip",
    "/home3/kiiniafr/public_html/Kiini/deploy.zip",
];
$zipFile = null;
foreach ($zipCandidates as $candidate) {
    if (file_exists($candidate)) {
        $zipFile = $candidate;
        break;
    }
}
if ($zipFile === null) {
    echo "ERROR: deploy.zip not found in any expected location:\n";
    echo implode("\n", $zipCandidates);
    exit(1);
}
$destDir = "/home/melitec1/Kiini";
$output = [];
exec("unzip -o $zipFile -d $destDir 2>&1", $output, $ret);
echo "Unzip exit: $ret\n";
echo implode("\n", array_slice($output, -5));
echo "\n---\n";
$migOut = [];
exec("cd /home/melitec1/Kiini && chmod +x run_migrate.sh && bash run_migrate.sh 2>&1", $migOut, $migRet);
echo "Migration exit: $migRet\n";
echo implode("\n", $migOut);
echo "\n---\n";
$restartScript = "/home/melitec1/Kiini/do_restart.sh";
if (!file_exists($restartScript)) {
    echo "ERROR: Restart helper not found: $restartScript\n";
    exit(1);
}
exec("bash $restartScript 2>&1", $out2, $ret2);
echo "Restart exit: $ret2\n";
echo implode("\n", $out2);
?>