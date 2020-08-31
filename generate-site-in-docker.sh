#!/bin/sh
set -e
echo 'Generating site...'
cd /app
npm run build
cp -r /app/dest/* /usr/share/nginx/html
