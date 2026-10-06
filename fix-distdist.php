<?php
// Simple file system reorganization script
// Upload to /public_html/Kiini/ and access via browser

// Prevent direct output of errors
error_reporting(E_ALL);
ini_set('display_errors', 0);

$output = [];

try {
    $baseDir = '/home3/kiiniafr/public_html/Kiini';
    chdir($baseDir) or die('Failed to change directory');
    
    $output[] = "Current directory: " . getcwd();
    
    // Check if dist/dist/public exists
    if (is_dir('dist/dist/public')) {
        $output[] = "Found dist/dist/public - copying files...";
        
        // Copy public files
        $files = scandir('dist/dist/public');
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                if (is_dir("dist/dist/public/$file")) {
                    // Copy directory recursively
                    system("cp -r dist/dist/public/$file dist/public/$file");
                    $output[] = "Copied directory: $file";
                } else {
                    // Copy file
                    if (copy("dist/dist/public/$file", "dist/public/$file")) {
                        $output[] = "Copied file: $file";
                    }
                }
            }
        }
        
        // Copy server directory if it exists
        if (is_dir('dist/dist/server')) {
            system("cp -r dist/dist/server . 2>/dev/null");
            $output[] = "Copied server directory";
        }
        
        // Copy index.js if it exists
        if (file_exists('dist/dist/index.js')) {
            copy('dist/dist/index.js', 'dist/index.js');
            $output[] = "Copied index.js";
        }
        
        // Remove the nested directory
        system("rm -rf dist/dist");
        $output[] = "Removed nested dist/dist directory";
    }
    
    // Verify index.html exists and check its content
    $indexPath = 'dist/public/index.html';
    if (file_exists($indexPath)) {
        $content = file_get_contents($indexPath);
        if (strpos($content, 'vendor-react-ui-BO9tUDmC') !== false) {
            $output[] = "✓ SUCCESS: index.html has correct vendor-react-ui chunk!";
        } else if (strpos($content, 'data-client-vendor-CrddCH85') !== false) {
            $output[] = "✗ ERROR: index.html still has old chunks!";
        } else {
            $output[] = "? index.html exists but chunks unclear";
        }
    } else {
        $output[] = "✗ ERROR: dist/public/index.html does not exist!";
    }
    
    // List directory structure
    $output[] = "";
    $output[] = "=== Directory structure ===";
    system("ls -la dist/public/ | head -10", $returnVar);
    
} catch (Exception $e) {
    $output[] = "ERROR: " . $e->getMessage();
}

// Output results
header('Content-Type: text/plain; charset=utf-8');
echo implode("\n", $output);
echo "\n\n✓ Fix script completed. You can delete this file after confirming the fix.";
?>
