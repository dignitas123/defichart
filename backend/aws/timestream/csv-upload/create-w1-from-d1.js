import csv from "csvtojson";
import fs from "fs";

const csvFilePath = "BTCUSD_d1.csv"; // make sure file has open, high, low, close, volume, timestamp columns

async function readCSVFileFrom(csvFilePath) {
  return await csv().fromFile(csvFilePath);
}

function getPreviousWeekBeginning(startDateInMs) {
  const today = new Date(startDateInMs);
  const dayOfWeek = today.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const startOfLastWeek = new Date(today.getTime());
  startOfLastWeek.setUTCDate(today.getUTCDate() - daysSinceMonday - 7);
  startOfLastWeek.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
  return startOfLastWeek.getTime();
}

const hlcvtRecords = await readCSVFileFrom(csvFilePath);

const res = [];
let aggregateVolume = 0;
let aggregateHigh = 0;
let aggregateLow = Infinity;
let firstWeek = false;
let weekOpen = 0;

function aggregateCandlestickHighLowVolume(candlestick) {
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

let previousClose = undefined;
hlcvtRecords.forEach((candlestick) => {
  if (!firstWeek) {
    if (new Date(Number(candlestick.timestamp)).getDay() === 1) {
      firstWeek = true;
      weekOpen = candlestick.open;
      aggregateCandlestickHighLowVolume(candlestick);
    }
    return;
  }
  if (new Date(Number(candlestick.timestamp)).getDay() === 1) {
    if (previousClose) {
      res.push({
        open: weekOpen,
        high: aggregateHigh,
        low: aggregateLow,
        close: previousClose,
        volume: aggregateVolume,
        timestamp: getPreviousWeekBeginning(Number(candlestick.timestamp)),
      });
    }
    weekOpen = candlestick.open;
    resetAggregateCandlestick();
  }
  aggregateCandlestickHighLowVolume(candlestick);
  previousClose = candlestick.close;
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
