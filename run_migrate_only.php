<?php
$migOut = [];
exec("cd /home/melitec1/Kiini && bash run_migrate.sh 2>&1", $migOut, $migRet);
echo "Migration exit: $migRet\n";
echo implode("\n", $migOut);
?>