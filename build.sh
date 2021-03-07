#!/usr/bin/env bash

rm -rf ./dist
mkdir ./dist

(
    cd app
    npm ci
    npm run build
)

cp -R ./app/dist/. ./dist/app
cp -R ./landing/. ./dist/

