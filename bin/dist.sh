#!/usr/bin/env bash

source ./.dist-vars.sh;

echo "--------------------------------"
echo "1. Build ui"
echo "--------------------------------"
npm install;
gulp ui;

echo "--------------------------------"
echo "2. Clean and install server deps"
echo "--------------------------------"
rm -rf node_modules/;
npm install --production;

echo "--------------------------------"
echo "3. Sprinkle lone liberally"
echo "--------------------------------"
NODE_ENV=production DEBUG=* lone;

echo "--------------------------------"
echo "4. Upload to le' GitHub"
echo "--------------------------------"
./bin/upload-release.js $RELEASE $RELEASE_FILENAME;
