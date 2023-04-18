import { candleSticksStreamWrite } from "../write-data.js";
import csv from "csvtojson";

const csvFilePath = "BTCUSD_d1_toy.csv"; // make sure files are formatted like the toy dataset

async function readCSVFileFrom(csvFilePath) {
  return await csv().fromFile(csvFilePath);
}

const hlcvtRecords = await readCSVFileFrom(csvFilePath);

// Define the size of each chunk
const chunkSize = 2;

const chunks = [];
for (let i = 0; i < hlcvtRecords.length; i += chunkSize) {
  chunks.push(hlcvtRecords.slice(i, i + chunkSize));
}

console.log("Process each chunk one by one");
chunks.forEach((chunks, index) => {
  setTimeout(async () => {
    console.log(`Processing chunk ${index + 1} chunk length ${chunks.length}`);
    await candleSticksStreamWrite(chunks, "testTable");
  }, 3000);
});
