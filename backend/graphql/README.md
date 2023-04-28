## update the graph types

- start dev server with `yarn dev`
- comment out the Query part in src/index.ts
- run `yarn codegen`

## serve

yarn
yarn build
cd src/aws-module
touch credentials.js
nano credentials.js
/* fill in information */
cd build && pm2 start index.js

curl ifconfig.me
export ALLOWED_IP=yourip

## update
pm2 stop index // (or other name)
pm2 delete index // (or other name)
cd build && pm2 start index --name graphql // (or other name)