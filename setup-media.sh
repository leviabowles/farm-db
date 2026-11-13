#!/bin/bash
# Setup script for creating media directory on Ubuntu production server
# Run this script on your Ubuntu server before starting the farm-db containers

set -e

echo "=== Farm DB Media Directory Setup ==="
echo ""

# Define the media directory path
MEDIA_DIR="/farm-db-data/media"

echo "Creating media directory at: $MEDIA_DIR"

# Create the directory
sudo mkdir -p "$MEDIA_DIR"

# Set proper permissions
sudo chmod -R 755 "$MEDIA_DIR"

echo "Directory created successfully!"
echo ""
echo "Next steps:"
echo "1. Verify the directory exists: ls -la $MEDIA_DIR"
echo "2. Ensure Docker has write access: sudo chown -R 1000:1000 $MEDIA_DIR (if needed)"
echo "3. Restart farm-db containers: cd /path/to/farm-db && docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "=== Setup Complete ==="
