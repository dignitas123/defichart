# Running as always-on-task on aws (or locallly)

You have to start the process in the background, so that the 'tansaction-stream.js' doesn't terminate when the terminal is closed.

## install pm2 globally

`npm install pm2 -g`

## go to backend/alchemy and f.e. start

`pm2 start transaction-stream.js`

## list all the processes

`pm2 list`

## stop a process

`pm2 stop transaction-stream`
and delete after stopped
`pm2 delete transaction-stream`

## read the logs of a process

`pm2 logs transaction-stream --lines 100`
