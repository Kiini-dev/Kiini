<?php
header('Content-Type: text/plain');

echo "=== ENV ===\n";
echo "USER: " . get_current_user() . "\n";
echo "PWD: " . getcwd() . "\n";

def exec_out($cmd) {
    echo "CMD: $cmd\n";
    $out = [];
    $ret = 0;
    exec($cmd . ' 2>&1', $out, $ret);
    echo "RET: $ret\n";
    echo implode("\n", $out);
    echo "\n\n";
}

exec_out('whoami');
exec_out('pwd');
exec_out('command -v node || true');
exec_out('node --version || true');
exec_out('ps aux | grep "[n]ode" | head -20');
exec_out('ps aux | grep "dist/index.js" | head -20');
exec_out('echo "--- /home/melitec1/Kiini ---"');
exec_out('ls -l /home/melitec1/Kiini/dist/index.js /home/melitec1/Kiini/app_restart.log /home/melitec1/Kiini/app.log /home/melitec1/Kiini/server-wrapper.js 2>&1');
exec_out('test -f /home/melitec1/Kiini/app_restart.log && tail -40 /home/melitec1/Kiini/app_restart.log || echo "No app_restart.log"');
exec_out('test -f /home/melitec1/Kiini/app.log && tail -40 /home/melitec1/Kiini/app.log || echo "No app.log"');
exec_out('echo "--- /home3/kiiniafr/public_html/Kiini ---"');
exec_out('ls -l /home3/kiiniafr/public_html/Kiini/dist/index.js /home3/kiiniafr/public_html/Kiini/app_restart.log /home3/kiiniafr/public_html/Kiini/app.log /home3/kiiniafr/public_html/Kiini/server-wrapper.js 2>&1');
exec_out('test -f /home3/kiiniafr/public_html/Kiini/app_restart.log && tail -40 /home3/kiiniafr/public_html/Kiini/app_restart.log || echo "No public_html app_restart.log"');
exec_out('test -f /home3/kiiniafr/public_html/Kiini/app.log && tail -40 /home3/kiiniafr/public_html/Kiini/app.log || echo "No public_html app.log"');
exec_out('test -f /home3/kiiniafr/public_html/Kiini/server-wrapper.js && echo "--- server-wrapper.js contents ---" && sed -n "1,80p" /home3/kiiniafr/public_html/Kiini/server-wrapper.js || echo "No public_html server-wrapper.js"');
exec_out('curl -I -s -S http://127.0.0.1:3000/api/trpc | head -20');
exec_out('curl -I -s -S http://127.0.0.1:3000/api/health | head -20');
exec_out('curl -I -s -S http://127.0.0.1:3000/ | head -20');
