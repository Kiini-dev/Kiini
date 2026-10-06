#!/usr/bin/env python3
"""
Create deploy.zip from dist/ directory
"""
import zipfile
import os
from pathlib import Path

def create_deploy_zip():
    zip_path = Path('deploy.zip')
    dist_path = Path('dist')

    if not dist_path.exists():
        print("ERROR: dist/ directory not found!")
        return False

    print("Creating deploy.zip from dist/ directory...")

    # Remove old zip if exists
    if zip_path.exists():
        zip_path.unlink()
        print("Removed old deploy.zip")

    # Create new zip
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_path):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(Path('.'))
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")

    zip_size = zip_path.stat().st_size
    print(f"\nDeploy zip created successfully: {zip_size:,} bytes ({zip_size/1024/1024:.2f} MB)")
    return True

if __name__ == "__main__":
    create_deploy_zip()