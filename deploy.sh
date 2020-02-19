#!/bin/bash
cd "$(dirname "$0")"
rm -rf dist 2>/dev/null
mkdir dist
cp -R ./packages/vue/dist dist/static
cp -R ./packages/nest/dist dist/nest
cp ./packages/nest/package.json dist
cp ./packages/nest/yarn.lock dist
cp ./packages/nest/ecosystem.config.js dist
rsync -r ./dist/* root@128.199.216.159:/root/minichat