import { getBinRecordsFromStartTime } from "../get-data.js";

const ret = await getBinRecordsFromStartTime('1d', '2023-04-17 00:00:00');

console.log(ret);