## aws credentials for timestream and s3

you have to set this in src/aws-module/credentials.ts

export const credentials = {
accessKeyId: '',
secretAccessKey: ''
}

## update the graph types

- start dev server with `yarn dev`
- comment out the Query part in src/index.ts
- make sure you set export ALLOWED_IP=127.0.0.1 (like shown in #debugging on local machine below)
- run `yarn codegen`

## serve

yarn
yarn build
cd src/aws-module
touch credentials.js
nano credentials.js
/_ fill in information _/
cd build && pm2 start index.js

// for developing on local machine
curl ifconfig.me
export ALLOWED_IP=yourip

## update

cd build && pm2 start index --name graphql // (or other name)
pm2 stop graphql // (or other name)
pm2 delete graphql // (or other name)
cd defichart/backend/graphql && yarn build
cd build && pm2 start index.js --name graphql // (or other name)

## debugging on local machine

export ALLOWED_IP=127.0.0.1
yarn dev
