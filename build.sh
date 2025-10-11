#!/bin/bash
# Build script for alunjam.es MkDocs blog

set -e

# Activate virtual environment
source venv/bin/activate

# Build the site
echo "Building MkDocs site..."
mkdocs build

echo "Build complete!"
