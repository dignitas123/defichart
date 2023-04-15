import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { alchemy } from "./connect.js";
import { getPriceData } from "./get-price.js";
import {
  tickDataStreamWrite,
  candleStickStreamWrite,
} from "./aws-module/write-fns.js";
import { putRecordOnKinesis } from "./aws-module/kinesis-put.js";
import {
  getLastBinRecords,
  getLastBinRecordsFromStartTime,
  getLastTick,
} from "./aws-module/get-fns.js";
import {
  sleep,
  getLastRoundedFiveMinuteInterval,
  isM5ScalarValuesUndefined,
  getUTCWeekbegin,
  getPreviousRoundedMinuteInterval,
  getPreviousRoundedHourInterval,
  getPreviousDayBeginning,
} from "./aws-module/utility.js";

const contractAddress = "0x86f1e0420c26a858fc203A3645dD1A36868F18e5";

const wantedFunction = toUtf8Bytes("Transfer(address,address,uint256)");

const eventSignatureHash = keccak256(wantedFunction);
const filter = {
  address: contractAddress,
  topics: [eventSignatureHash],
};

// get current Tick High, Low, Volume aggregates
console.log(
  "getting current minute, 5 min, hour etc. high, low and volume aggregates for initial memory values.."
);
const currentMinuteData = await getLastBinRecords("1m", "minute");
if (!currentMinuteData) {
  console.error("Can\t get current minute data, shutting down");
  process.exit();
}
await sleep(300);
const current5MinuteData = await getLastBinRecordsFromStartTime(
  getLastRoundedFiveMinuteInterval()
);
if (!current5MinuteData) {
  console.error("Can\t get current 5minute data, shutting down");
  process.exit();
}
await sleep(300);
const currentHourData = await getLastBinRecords("1h", "hour");
if (!currentHourData) {
  console.error("Can\t get current hour data, shutting down");
  process.exit();
}
await sleep(300);
const currentDayData = await getLastBinRecords("1d", "day");
if (!currentDayData) {
  console.error("Can\t get current day data, shutting down");
  process.exit();
}
await sleep(300);
const currentWeekData = await getLastBinRecordsFromStartTime(getUTCWeekbegin());
if (!currentWeekData) {
  console.error("Can\t get current week data, shutting down");
  process.exit();
}

// memory save variables
let lastTick = 0;
let currentMinuteHigh = 0;
let currentMinuteLow = Infinity;
let currentMinuteVolume = 0;
let current5MinuteHigh = 0;
let current5MinuteLow = Infinity;
let current5MinuteVolume = 0;
let currentHourHigh = 0;
let currentHourLow = Infinity;
let currentHourVolume = 0;
let currentDayHigh = 0;
let currentDayLow = Infinity;
let currentDayVolume = 0;
let currentWeekHigh = 0;
let currentWeekLow = Infinity;
let currentWeekVolume = 0;

console.log("set last tick..");
const tick = await getLastTick();
lastTick = Number(tick.Rows[0].Data[0].ScalarValue);
if (!lastTick) {
  console.error("Can't get last tick, shutting down");
  process.exit();
}

console.log("fill currentMinute data..");
const currentMinuteRows = currentMinuteData.Rows;
if (currentMinuteRows && currentMinuteRows[0] && currentMinuteRows[0].Data) {
  const currentMinuteRowsData = currentMinuteRows[0].Data;
  currentMinuteHigh = currentMinuteRowsData[0].ScalarValue ?? 0;
  currentMinuteLow = currentMinuteRowsData[1].ScalarValue ?? 0;
  currentMinuteVolume = currentMinuteRowsData[2].ScalarValue ?? 0;
} else {
  currentMinuteHigh = lastTick;
  currentMinuteLow = lastTick;
  currentMinuteVolume = 0;
}

console.log("fill current5Minute data..");
const current5MinuteRows = current5MinuteData.Rows;
if (
  current5MinuteRows &&
  current5MinuteRows[0] &&
  current5MinuteRows[0].Data &&
  !isM5ScalarValuesUndefined(current5MinuteData)
) {
  const current5MinuteRowsData = current5MinuteRows[0].Data;
  current5MinuteHigh = current5MinuteRowsData[0].ScalarValue ?? 0;
  current5MinuteLow = current5MinuteRowsData[1].ScalarValue ?? 0;
  current5MinuteVolume = current5MinuteRowsData[2].ScalarValue ?? 0;
} else {
  current5MinuteHigh = lastTick;
  current5MinuteLow = lastTick;
  current5MinuteVolume = 0;
}

console.log("fill currentHour data..");
const currentHourRows = currentHourData.Rows;
if (currentHourRows && currentHourRows[0] && currentHourRows[0].Data) {
  const currentHourRowsData = currentHourRows[0].Data;
  currentHourHigh = currentHourRowsData[0].ScalarValue ?? 0;
  currentHourLow = currentHourRowsData[1].ScalarValue ?? 0;
  currentHourVolume = currentHourRowsData[2].ScalarValue ?? 0;
} else {
  currentHourHigh = lastTick;
  currentHourLow = lastTick;
  currentHourVolume = 0;
}

console.log("fill currentDay data..");
const currentDayRows = currentDayData.Rows;
if (currentDayRows && currentDayRows[0] && currentDayRows[0].Data) {
  const currentDayRowsData = currentDayRows[0].Data;
  currentDayHigh = currentDayRowsData[0].ScalarValue ?? 0;
  currentDayLow = currentDayRowsData[1].ScalarValue ?? 0;
  currentDayVolume = currentDayRowsData[2].ScalarValue ?? 0;
} else {
  currentDayHigh = lastTick;
  currentDayLow = lastTick;
  currentDayVolume = 0;
}

console.log("fill currentWeek data..");
const currentWeekRows = currentWeekData.Rows;
if (currentWeekRows && currentWeekRows[0] && currentWeekRows[0].Data) {
  const currentWeekRowsData = currentWeekRows[0].Data;
  currentWeekHigh = currentWeekRowsData[0].ScalarValue ?? 0;
  currentWeekLow = currentWeekRowsData[1].ScalarValue ?? 0;
  currentWeekVolume = currentWeekRowsData[2].ScalarValue ?? 0;
} else {
  currentWeekHigh = lastTick;
  currentWeekLow = lastTick;
  currentWeekVolume = 0;
}

setInterval(() => {
  const now = new Date();
  if (now.getSeconds() === 0) {
    // beginning of new minute
    if (currentMinuteHigh === 0) {
      currentMinuteHigh = lastTick;
    }
    if (currentMinuteLow === Infinity) {
      currentMinuteLow = lastTick;
    }
    candleStickStreamWrite(
      currentMinuteVolume,
      currentMinuteHigh,
      currentMinuteLow,
      lastTick,
      getPreviousRoundedMinuteInterval(),
      "btcusd-perp_m1"
    );
    currentMinuteVolume = 0;
    currentMinuteHigh = 0;
    currentMinuteLow = Infinity;
    if (now.getMinutes() % 5 === 0) {
      // beginning of new 5minute
      if (current5MinuteHigh === 0) {
        current5MinuteHigh = lastTick;
      }
      if (current5MinuteLow === Infinity) {
        current5MinuteLow = lastTick;
      }
      candleStickStreamWrite(
        current5MinuteVolume,
        current5MinuteHigh,
        current5MinuteLow,
        lastTick,
        getPreviousRoundedMinuteInterval(5),
        "btcusd-perp_m5"
      );
      current5MinuteVolume = 0;
      current5MinuteHigh = 0;
      current5MinuteLow = Infinity;
    }
    if (now.getMinutes() === 0) {
      // beginning of new hour
      if (currentHourHigh === 0) {
        currentHourHigh = lastTick;
      }
      if (currentHourLow === Infinity) {
        currentHourLow = lastTick;
      }
      candleStickStreamWrite(
        currentHourVolume,
        currentHourHigh,
        currentHourLow,
        lastTick,
        getPreviousRoundedHourInterval(),
        "btcusd-perp_h1"
      );
      currentHourVolume = 0;
      currentHourHigh = 0;
      currentHourLow = Infinity;
      if (now.getHours() === 0) {
        // beginning of new day
        if (currentDayHigh === 0) {
          currentDayHigh = lastTick;
        }
        if (currentDayLow === Infinity) {
          currentDayLow = lastTick;
        }
        candleStickStreamWrite(
          currentDayVolume,
          currentDayHigh,
          currentDayLow,
          lastTick,
          getPreviousDayBeginning(),
          "btcusd-perp_d1"
        );
        currentDayVolume = 0;
        currentDayHigh = 0;
        currentDayLow = Infinity;
        if (now.getDay() === 1) {
          // beginning of new week
          if (currentWeekHigh === 0) {
            currentWeekHigh = lastTick;
          }
          if (currentWeekLow === Infinity) {
            currentWeekLow = lastTick;
          }
          candleStickStreamWrite(
            currentWeekVolume,
            currentWeekHigh,
            currentWeekLow,
            lastTick,
            getPreviousWeekBeginning(),
            "btcusd-perp_w1"
          );
          currentWeekVolume = 0;
          currentWeekHigh = 0;
          currentWeekLow = Infinity;
        }
      }
    }
  }
}, 1000); // Run every second

let previousTimeStamp = undefined;
let previousVolume = 0;

alchemy.ws.on(filter, async (log) => {
  const priceData = await getPriceData(log.transactionHash);
  if (priceData) {
    // put the new price data into the kinesis stream so it updates to all clients with socket connection
    await putRecordOnKinesis(
      priceData.volume,
      priceData.direction,
      priceData.price,
      priceData.timestamp
    );
    const currentTimeStamp = priceData.timestamp;
    // in case there have been two trades on the same timestamp, account for the added volume
    if (previousTimeStamp && previousTimeStamp === currentTimeStamp) {
      priceData.volume += previousVolume;
      previousVolume = priceData.volume;
    } else {
      previousVolume = priceData.volume;
    }
    previousTimeStamp = priceData.timestamp;
    // current price is set
    lastTick = priceData.price;

    // fill current volumes
    currentMinuteVolume += priceData.volume;
    current5MinuteVolume += priceData.volume;
    currentHourVolume += priceData.volume;
    currentDayVolume += priceData.volume;
    currentWeekVolume += priceData.volume;

    // check new highs, lows for each database
    if (lastTick > currentMinuteHigh) {
      currentMinuteHigh = priceData.price;
    }
    if (lastTick < currentMinuteLow) {
      currentMinuteLow = priceData.price;
    }
    if (lastTick > current5MinuteHigh) {
      current5MinuteHigh = priceData.price;
    }
    if (lastTick < current5MinuteLow) {
      current5MinuteLow = priceData.price;
    }
    if (lastTick > currentHourHigh) {
      currentHourHigh = priceData.price;
    }
    if (lastTick < currentHourLow) {
      currentHourLow = priceData.price;
    }
    if (lastTick > currentDayHigh) {
      currentDayHigh = priceData.price;
    }
    if (lastTick < currentDayLow) {
      currentDayLow = priceData.price;
    }
    if (lastTick > currentWeekHigh) {
      currentWeekHigh = priceData.price;
    }
    if (lastTick < currentWeekLow) {
      currentWeekLow = priceData.price;
    }

    // write the new tick to the tickstream database
    await tickDataStreamWrite(
      priceData.volume,
      priceData.direction,
      priceData.price,
      priceData.timestamp
    );
  }
});
