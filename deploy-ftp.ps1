$ftpServer = $env:DEPLOY_DOMAIN ?? "kiini.africa"
$ftpUser = $env:DEPLOY_USER
$ftpPass = $env:DEPLOY_PASS
$remotePath = "/home3/kiiniafr/Kiini/dist/"
$localPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "dist\public"

if (-not $ftpUser -or -not $ftpPass) {
    throw "Set DEPLOY_USER and DEPLOY_PASS in the environment before uploading."
}

# Create FTP credentials
$ftpUri = "ftp://${ftpServer}${remotePath}"
$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

# Upload index.html
Write-Host "Uploading index.html..."
$webclient.UploadFile("$ftpUri/index.html", (Join-Path $localPath "index.html"))
Write-Host "✓ index.html uploaded"

# Get all asset files
$assetFiles = Get-ChildItem "$localPath\assets" -File
$total = $assetFiles.Count
$count = 0

Write-Host "Uploading $total asset files..."

foreach ($file in $assetFiles) {
    $count++
    $percent = [math]::Round(($count / $total) * 100, 1)
    Write-Host -NoNewline "`r[$count/$total] $percent% - $($file.Name)..."
    
    try {
        $webclient.UploadFile("$ftpUri/assets/$($file.Name)", $file.FullName)
    } catch {
        Write-Host "`nError uploading $($file.Name): $_"
    }
}

Write-Host "`n✓ All assets uploaded successfully!"
