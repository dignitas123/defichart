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
  getLastAggregateRecordsFromStartTime,
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
  getPreviousWeekBeginning,
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
  "getting current minute, 5 min, hour etc. high, low and volume aggregates for initial memory values..",
  new Date().toISOString()
);
const currentMinuteData = await getLastBinRecords("1m", "minute");
if (!currentMinuteData) {
  console.error(
    "Can't get current minute data, shutting down",
    new Date().toISOString()
  );
  process.exit();
}
await sleep(300);
const current5MinuteData = await getLastAggregateRecordsFromStartTime(
  getLastRoundedFiveMinuteInterval()
);
if (!current5MinuteData) {
  console.error(
    "Can't get current 5minute data, shutting down",
    new Date().toISOString()
  );
  process.exit();
}
await sleep(300);
const currentHourData = await getLastBinRecords("1h", "hour");
if (!currentHourData) {
  console.error(
    "Can't get current hour data, shutting down",
    new Date().toISOString()
  );
  process.exit();
}
await sleep(300);
const currentDayData = await getLastBinRecords("1d", "day");
if (!currentDayData) {
  console.error(
    "Can't get current day data, shutting down",
    new Date().toISOString()
  );
  process.exit();
}
await sleep(300);
const currentWeekData = await getLastAggregateRecordsFromStartTime(
  getUTCWeekbegin()
);
if (!currentWeekData) {
  console.error(
    "Can't get current week data, shutting down",
    new Date().toISOString()
  );
  process.exit();
}

// memory save variables
let lastTick = 0;
let currentMinuteOpen = 0;
let currentMinuteHigh = 0;
let currentMinuteLow = Infinity;
let currentMinuteVolume = 0;
let current5MinuteOpen = 0;
let current5MinuteHigh = 0;
let current5MinuteLow = Infinity;
let current5MinuteVolume = 0;
let currentHourOpen = 0;
let currentHourHigh = 0;
let currentHourLow = Infinity;
let currentHourVolume = 0;
let currentDayOpen = 0;
let currentDayHigh = 0;
let currentDayLow = Infinity;
let currentDayVolume = 0;
let currentWeekOpen = 0;
let currentWeekHigh = 0;
let currentWeekLow = Infinity;
let currentWeekVolume = 0;

console.log("set last tick..");
const tick = await getLastTick();
lastTick = Number(tick.Rows[0].Data[0].ScalarValue);
if (!lastTick) {
  console.error("Can't get last tick, shutting down", new Date().toISOString());
  process.exit();
}

console.log("fill currentMinute data..");
const currentMinuteRows = currentMinuteData.Rows;
if (currentMinuteRows && currentMinuteRows[0] && currentMinuteRows[0].Data) {
  const currentMinuteRowsData = currentMinuteRows[0].Data;
  currentMinuteOpen = currentMinuteRowsData[0].ScalarValue ?? 0;
  currentMinuteHigh = currentMinuteRowsData[1].ScalarValue ?? 0;
  currentMinuteLow = currentMinuteRowsData[2].ScalarValue ?? 0;
  currentMinuteVolume = currentMinuteRowsData[3].ScalarValue ?? 0;
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
  current5MinuteOpen = current5MinuteRowsData[0].ScalarValue ?? 0;
  current5MinuteHigh = current5MinuteRowsData[1].ScalarValue ?? 0;
  current5MinuteLow = current5MinuteRowsData[2].ScalarValue ?? 0;
  current5MinuteVolume = current5MinuteRowsData[3].ScalarValue ?? 0;
}

console.log("fill currentHour data..");
const currentHourRows = currentHourData.Rows;
if (currentHourRows && currentHourRows[0] && currentHourRows[0].Data) {
  const currentHourRowsData = currentHourRows[0].Data;
  currentHourOpen = currentHourRowsData[0].ScalarValue ?? 0;
  currentHourHigh = currentHourRowsData[1].ScalarValue ?? 0;
  currentHourLow = currentHourRowsData[2].ScalarValue ?? 0;
  currentHourVolume = currentHourRowsData[3].ScalarValue ?? 0;
}

console.log("fill currentDay data..");
const currentDayRows = currentDayData.Rows;
if (currentDayRows && currentDayRows[0] && currentDayRows[0].Data) {
  const currentDayRowsData = currentDayRows[0].Data;
  currentDayOpen = currentDayRowsData[0].ScalarValue ?? 0;
  currentDayHigh = currentDayRowsData[1].ScalarValue ?? 0;
  currentDayLow = currentDayRowsData[2].ScalarValue ?? 0;
  currentDayVolume = currentDayRowsData[3].ScalarValue ?? 0;
}

console.log("fill currentWeek data..");
const currentWeekRows = currentWeekData.Rows;
if (currentWeekRows && currentWeekRows[0] && currentWeekRows[0].Data) {
  const currentWeekRowsData = currentWeekRows[0].Data;
  currentWeekOpen = currentWeekRowsData[0].ScalarValue ?? 0;
  currentWeekHigh = currentWeekRowsData[1].ScalarValue ?? 0;
  currentWeekLow = currentWeekRowsData[2].ScalarValue ?? 0;
  currentWeekVolume = currentWeekRowsData[3].ScalarValue ?? 0;
}

setInterval(() => {
  const now = new Date();
  if (now.getSeconds() === 0) {
    // beginning of new minute
    if (currentMinuteHigh !== 0 && currentMinuteLow !== Infinity) {
      candleStickStreamWrite(
        currentMinuteVolume,
        currentMinuteOpen,
        currentMinuteHigh,
        currentMinuteLow,
        lastTick,
        getPreviousRoundedMinuteInterval(),
        "btcusd-perp_m1"
      );
    }
    currentMinuteOpen = 0;
    currentMinuteVolume = 0;
    currentMinuteHigh = 0;
    currentMinuteLow = Infinity;
    if (now.getMinutes() % 5 === 0) {
      // beginning of new 5minute
      if (current5MinuteHigh !== 0 && current5MinuteLow !== Infinity) {
        candleStickStreamWrite(
          current5MinuteVolume,
          current5MinuteOpen,
          current5MinuteHigh,
          current5MinuteLow,
          lastTick,
          getPreviousRoundedMinuteInterval(5),
          "btcusd-perp_m5"
        );
      }
      current5MinuteOpen = 0;
      current5MinuteVolume = 0;
      current5MinuteHigh = 0;
      current5MinuteLow = Infinity;
    }
    if (now.getMinutes() === 0) {
      // beginning of new hour
      console.log("writing new hour", new Date().toISOString());
      if (currentHourHigh !== 0 && currentHourLow !== Infinity) {
        console.log(
          "writing",
          currentHourVolume,
          currentHourOpen,
          currentHourHigh,
          currentHourLow,
          lastTick,
          getPreviousRoundedHourInterval()
        );
        candleStickStreamWrite(
          currentHourVolume,
          currentHourOpen,
          currentHourHigh,
          currentHourLow,
          lastTick,
          getPreviousRoundedHourInterval(),
          "btcusd-perp_h1"
        );
      }
      currentHourOpen = 0;
      currentHourVolume = 0;
      currentHourHigh = 0;
      currentHourLow = Infinity;
      if (now.getHours() === 0) {
        // beginning of new day
        console.log("writing new day", new Date().toISOString());
        if (currentDayHigh !== 0 && currentDayLow !== Infinity) {
          candleStickStreamWrite(
            currentDayVolume,
            currentDayOpen,
            currentDayHigh,
            currentDayLow,
            lastTick,
            getPreviousDayBeginning(),
            "btcusd-perp_d1"
          );
        }
        currentDayOpen = 0;
        currentDayVolume = 0;
        currentDayHigh = 0;
        currentDayLow = Infinity;
        if (now.getDay() === 1) {
          // beginning of new week
          console.log("writing new week", new Date().toISOString());
          if (currentWeekHigh !== 0 && currentWeekLow !== Infinity) {
            candleStickStreamWrite(
              currentWeekVolume,
              currentWeekOpen,
              currentWeekHigh,
              currentWeekLow,
              lastTick,
              getPreviousWeekBeginning(),
              "btcusd-perp_w1"
            );
          }
          currentWeekOpen = 0;
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
    let version = 1;
    // in case there have been two trades on the same timestamp, account for the added volume
    if (previousTimeStamp && previousTimeStamp === currentTimeStamp) {
      priceData.volume += previousVolume;
      version++; // increase version to overwrite the current timestamp
      previousVolume = priceData.volume;
    } else {
      version = 1;
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

    // set open
    if (!currentMinuteOpen) {
      currentMinuteOpen = lastTick;
    }
    if (!current5MinuteOpen) {
      current5MinuteOpen = lastTick;
    }
    if (!currentHourOpen) {
      currentHourOpen = lastTick;
    }
    if (!currentDayOpen) {
      currentDayOpen = lastTick;
    }
    if (!currentWeekOpen) {
      currentWeekOpen = lastTick;
    }

    // check new highs, lows for each database
    if (lastTick > currentMinuteHigh) {
      currentMinuteHigh = lastTick;
    }
    if (lastTick < currentMinuteLow) {
      currentMinuteLow = lastTick;
    }
    if (lastTick > current5MinuteHigh) {
      current5MinuteHigh = lastTick;
    }
    if (lastTick < current5MinuteLow) {
      current5MinuteLow = lastTick;
    }
    if (lastTick > currentHourHigh) {
      currentHourHigh = lastTick;
    }
    if (lastTick < currentHourLow) {
      currentHourLow = lastTick;
    }
    if (lastTick > currentDayHigh) {
      currentDayHigh = lastTick;
    }
    if (lastTick < currentDayLow) {
      currentDayLow = lastTick;
    }
    if (lastTick > currentWeekHigh) {
      currentWeekHigh = lastTick;
    }
    if (lastTick < currentWeekLow) {
      currentWeekLow = lastTick;
    }

    if (version > 1) {
      console.log(`Use Version ${version}`);
    }
    await tickDataStreamWrite(
      priceData.volume,
      priceData.direction,
      priceData.price,
      priceData.timestamp,
      version
    );
  }
});
