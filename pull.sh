#!/bin/bash
cd /home/alun/www/alunjam.es

before=$(git rev-parse HEAD)
git pull
after=$(git rev-parse HEAD)

if [ "$before" != "$after" ]; then
    echo "$(date): Changes detected, building..." >> /home/alun/www/alunjam.es/build.log
    ./build.sh
else
    echo "$(date): No changes" >> /home/alun/www/alunjam.es/build.log
fi
