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
<<<<<<< HEAD
pm2 stop index // (or other name)
pm2 delete index // (or other name)
cd build && pm2 start index --name graphql // (or other name)
=======

pm2 stop graphql // (or other name)
pm2 delete graphql // (or other name)
cd defichart/backend/graphql && yarn build
cd build && pm2 start index.js --name graphql // (or other name)
>>>>>>> f36a77b (fix(graphql): fixed readme instructions)
