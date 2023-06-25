#!/bin/bash

# Check if an argument is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <argument>"
  exit 1
fi

# Access the first argument
argument=$1

# Perform some operations with the argument
echo "The provided argument is: $argument"
# Add more code here to process the argument as needed

# End of the script
pm2 stop graphql
pm2 delete graphql
yarn build
export ALLOWED_IP=$argument
cd build
pm2 start index.js --name graphql