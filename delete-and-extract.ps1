# FTP script to delete old dist folder and extract clean copy
# This uses WinSCP .NET assembly for reliable FTP operations

# Note: This is a reference approach. For actual execution via FTP, 
# you'll need to manually:
# 1. Delete /public_html/Kiini/dist/ folder via cPanel File Manager
# 2. Extract deploy.zip via cPanel Extract functionality

# Alternative: SSH commands to execute on the server:
# ssh user@server "cd /public_html/Kiini && rm -rf dist && unzip deploy.zip"

# If using terminal in cPanel, run:
# cd /home/username/public_html/Kiini
# rm -rf dist
# unzip deploy.zip

Write-Host "Manual steps required in cPanel:"
Write-Host "1. Open File Manager"
Write-Host "2. Navigate to Kiini directory"
Write-Host "3. Select 'dist' folder and click Delete"
Write-Host "4. Select 'deploy.zip' and click Extract"
Write-Host "5. Complete the extraction"
