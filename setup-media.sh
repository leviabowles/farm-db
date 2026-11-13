#!/bin/bash
# Setup script for creating media directory on Ubuntu production server
# Run this script on your Ubuntu server before starting the farm-db containers

set -e

echo "=== Farm DB Media Directory Setup ==="
echo ""
echo "INFO: You can use any path for the media directory."
echo "      The volume mount in docker-compose.prod.yml maps:"
echo "      [HOST_PATH]:/app/media"
echo ""

# Define the media directory path (standard web server location)
MEDIA_DIR="/var/www/farm-db/media"

echo "Creating media directory at: $MEDIA_DIR"

# Create the directory (requires sudo for /var/www)
sudo mkdir -p "$MEDIA_DIR"

# Set proper permissions (Docker runs as root, but let's be safe)
sudo chmod -R 755 "$MEDIA_DIR"

echo ""
echo "Directory created successfully!"
echo ""
echo "Next steps:"
echo "1. Verify the directory exists: ls -la $MEDIA_DIR"
echo "2. If using a different path, update docker-compose.prod.yml"
echo "3. Update Media_URL in docker-compose.prod.yml if needed"
echo "4. Start farm-db containers: docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "=== Setup Complete ==="
