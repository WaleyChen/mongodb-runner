#!/usr/bin/env bash
cd scope && npm install && npm run-script build && cd ../;
cd rest && npm link && cd ../ && npm link mongorest;
