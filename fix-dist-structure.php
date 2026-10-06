<?php
// This script repairs the directory structure after zip extraction
// Files were extracted to root instead of dist/public/

$base = dirname(__FILE__);
$results = [];

try {
    // 1. Create dist/public/assets directory
    @mkdir("$base/dist", 0755, true);
    @mkdir("$base/dist/public", 0755, true);
    @mkdir("$base/dist/public/assets", 0755, true);
    $results[] = "✓ Created dist/public/assets directory";
    
    // 2. Copy index.html from root to dist/public/
    if (file_exists("$base/index.html")) {
        copy("$base/index.html", "$base/dist/public/index.html");
        $results[] = "✓ Copied index.html to dist/public/";
        
        // Verify vendor-react-ui in file
        $content = file_get_contents("$base/dist/public/index.html");
        if (strpos($content, 'vendor-react-ui') !== false) {
            $results[] = "✓ index.html contains vendor-react-ui reference";
            preg_match('/vendor-react-ui-[a-zA-Z0-9]+/', $content, $matches);
            if (!empty($matches)) {
                $results[] = "✓ Found chunk hash: " . $matches[0];
            }
        } else {
            $results[] = "✗ WARNING: index.html does NOT contain vendor-react-ui";
        }
    } else {
        $results[] = "✗ ERROR: index.html not found at root";
    }
    
    // 3. Copy assets directory
    if (is_dir("$base/assets")) {
        $src_files = scandir("$base/assets");
        $count = 0;
        foreach ($src_files as $file) {
            if ($file !== '.' && $file !== '..') {
                $src = "$base/assets/$file";
                $dst = "$base/dist/public/assets/$file";
                if (is_file($src)) {
                    copy($src, $dst);
                    $count++;
                }
            }
        }
        $results[] = "✓ Copied $count files to dist/public/assets/";
    } else {
        $results[] = "✗ ERROR: assets directory not found";
    }
    
    // 4. Verify structure
    if (file_exists("$base/dist/public/index.html")) {
        $size = filesize("$base/dist/public/index.html");
        $results[] = "✓ FINAL: dist/public/index.html exists ($size bytes)";
    } else {
        $results[] = "✗ FINAL: dist/public/index.html NOT CREATED";
    }
    
} catch (Exception $e) {
    $results[] = "✗ ERROR: " . $e->getMessage();
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Kiini - Directory Structure Repair</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        h1 { color: #333; }
        .result { margin: 10px 0; font-family: monospace; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        .container { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Kiini Directory Structure Repair</h1>
    <div class="container">
        <?php foreach ($results as $result): ?>
            <div class="result <?php echo (strpos($result, '✓') === 0) ? 'success' : 'error'; ?>">
                <?php echo htmlspecialchars($result); ?>
            </div>
        <?php endforeach; ?>
    </div>
    <hr>
    <p><small>This file can be deleted after verification.</small></p>
</body>
</html>
