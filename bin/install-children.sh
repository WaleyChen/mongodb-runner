#!/usr/bin/env bash
cd rest && npm install && cd ../;
cd scope && npm install && npm run-script build && cd ../;
