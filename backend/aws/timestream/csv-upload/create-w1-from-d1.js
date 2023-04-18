import csv from "csvtojson";
import fs from "fs";

// const csvFilePath = "BTCUSD_d1_toy.csv"; // make sure files are formatted like the toy dataset
const csvFilePath = "BTCUSD_d1.csv"; // make sure files are formatted like the toy dataset

async function readCSVFileFrom(csvFilePath) {
  return await csv().fromFile(csvFilePath);
}

function getPreviousWeekBeginning(startDateInMs) {
  const today = new Date(startDateInMs);
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const startOfLastWeek = new Date(today);
  startOfLastWeek.setDate(today.getDate() - daysSinceMonday - 7);
  startOfLastWeek.setHours(0, 0, 0, 0); // Set time to midnight
  return startOfLastWeek.getTime();
}

const hlcvtRecords = await readCSVFileFrom(csvFilePath);

const res = [];
let aggregateVolume = 0;
let aggregateHigh = 0;
let aggregateLow = Infinity;
let firstWeek = false;

function aggregateCandlestick(candlestick) {
  aggregateVolume += Number(candlestick.volume);
  if (candlestick.high > aggregateHigh) {
    aggregateHigh = candlestick.high;
  }
  if (candlestick.low < aggregateLow) {
    aggregateLow = candlestick.low;
  }
}

function resetAggregateCandlestick() {
  aggregateVolume = 0;
  aggregateHigh = 0;
  aggregateLow = Infinity;
}

hlcvtRecords.forEach((candlestick) => {
  if (!firstWeek) {
    if (new Date(Number(candlestick.timestamp)).getDay() === 1) {
      firstWeek = true;
      aggregateCandlestick(candlestick);
    }
    return;
  }
  if (new Date(Number(candlestick.timestamp)).getDay() === 1) {
    res.push({
      high: aggregateHigh,
      low: aggregateLow,
      close: candlestick.close,
      volume: aggregateVolume,
      timestamp: getPreviousWeekBeginning(Number(candlestick.timestamp)),
    });
    resetAggregateCandlestick();
  }
  aggregateCandlestick(candlestick);
});

const headers = Object.keys(res[0]).join(",");
const rows = res
  .filter((obj) => obj.volume > 0)
  .map((obj) => Object.values(obj).join(","));

const csvRows = `${headers}\n${rows.join("\n")}`;

fs.writeFile("BTCUSD_w1.csv", csvRows, (err) => {
  if (err) throw err;
  console.log("CSV file has been created successfully.");
});
