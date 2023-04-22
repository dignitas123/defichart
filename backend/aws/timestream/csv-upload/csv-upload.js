import { candleSticksStreamWrite } from "../write-data.js";
import csv from "csvtojson";

const csvFilePath = "XBTUSD_60.csv"; // make sure files are formatted like the toy dataset

async function readCSVFileFrom(csvFilePath) {
  return await csv().fromFile(csvFilePath);
}

const hlcvtRecords = await readCSVFileFrom(csvFilePath);

// Define the size of each chunk
// AWS chunks for timestream should be 20 when putting 4 records into the database (100 is maximum record insert)
const chunkSize = 20;

const chunks = [];
for (let i = 0; i < hlcvtRecords.length; i += chunkSize) {
  chunks.push(hlcvtRecords.slice(i, i + chunkSize));
}

console.log("Process each chunk one by one");
for (let i = 0; i < chunks.length; i++) {
  setTimeout(async () => {
    console.log(`Processing chunk ${i + 1} chunk length ${chunks[i].length}`);
    await candleSticksStreamWrite(chunks[i], "btcusd-perp_h1");
  }, i * 500);
}
