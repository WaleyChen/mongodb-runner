#!/usr/bin/env bash
REPO_URL=`git config remote.origin.url`
MSG=`git log --oneline HEAD | head -n 1`

gulp build

cd .build

git init
rm -rf .DS_Store **/.DS_Store
git add .
git commit -m "Deploy: $MSG"
git push --force $REPO_URL master:gh-pages

cd ../
