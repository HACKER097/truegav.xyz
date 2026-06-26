#!/bin/bash
set -e
echo "Building Hugo site..."
hugo
echo "Pushing built site submodule..."
cd public
git add -A
git commit -m "build $(date '+%Y-%m-%d %H:%M')" || echo "(no changes to commit)"
git push origin main
cd ..
echo "Done. Submodule updated."
