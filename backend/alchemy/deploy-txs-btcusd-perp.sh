#!/bin/bash

pm2 stop txs-btcusd-perp
pm2 delete txs-btcusd-perp
pm2 start txs-btcusd-perp.js