#!/bin/bash
cd /home/alun/www/alunjam.es

before=$(git rev-parse HEAD)
git pull
after=$(git rev-parse HEAD)

if [ "$before" != "$after" ]; then
    ./build.sh
fi
