#!/bin/bash
set -e

echo "🚀 OpenSpace Container Starting..."

# Start SSH
echo "Starting SSH..."
service ssh start

# Start PHP-FPM
echo "Starting PHP-FPM..."
service php8.2-fpm start

# Start Nginx
echo "Starting Nginx..."
service nginx start

# Keep container running
echo "✅ Container ready"
tail -f /dev/null
