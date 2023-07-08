#!/bin/bash

git pull
yarn
yarn build
sudo cp -r /home/ec2-user/defichart/frontend/dist/spa/. /usr/share/nginx/html
