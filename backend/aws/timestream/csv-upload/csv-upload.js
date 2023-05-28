import {
  candleSticksStreamWrite,
  candleSticksStreamWriteOnlyOpen,
} from "../write-data.js";
import csv from "csvtojson";

const CSV_FILE_PATH = "BTCUSD_m1.csv"; // make sure files are formatted like the toy dataset
const TABLE_NAME = "btcusd-perp_m1";

async function readCSVFileFrom(CSV_FILE_PATH) {
  return await csv().fromFile(CSV_FILE_PATH);
}

const ohlcvtRecords = await readCSVFileFrom(CSV_FILE_PATH);

// Define the size of each chunk
// AWS chunks for timestream should be 20 when putting 4 records into the database (100 is maximum record insert)
const chunkSize = 20;

const chunks = [];
for (let i = 0; i < ohlcvtRecords.length; i += chunkSize) {
  chunks.push(ohlcvtRecords.slice(i, i + chunkSize));
}

console.log("Process each chunk one by one");
for (let i = 0; i < chunks.length; i++) {
  setTimeout(async () => {
    console.log(
      `Processing chunk ${i + 1} chunk length ${chunks[i].length} Progress: ${(
        (i / chunks.length) *
        100
      ).toFixed(2)}%`
    );
    await candleSticksStreamWrite(chunks[i], TABLE_NAME, 2);
    // await candleSticksStreamWriteOnlyOpen(chunks[i], "btcusd-perp_d1");
  }, i * 500);
}
