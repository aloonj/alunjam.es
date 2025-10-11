#!/bin/bash
# Build script for alunjam.es MkDocs blog

set -e

# Activate virtual environment
source venv/bin/activate

# Build the site
echo "Building MkDocs site..."
mkdocs build

echo "Build complete! Purging cache..."

# Get cloudflare creds
source /home/alun/.cloudflare_creds

# Purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
