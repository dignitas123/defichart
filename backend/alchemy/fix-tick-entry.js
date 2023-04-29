import { tickDataStreamWrite } from "./aws-module/timestream-write-fns.js";

/**
 * Converts Datetimestring to UTC Timestamp in Miliseconds since 1970
 * @param { string } datetimeStr example '2023-04-28 02:46:06.694000000'
 */
function convertDatetimeStrToUTCTimestampInMS(datetimeStr) {
  const dateObj = new Date(
    Date.UTC(
      datetimeStr.slice(0, 4), // year
      datetimeStr.slice(5, 7) - 1, // month (0-based)
      datetimeStr.slice(8, 10), // day
      datetimeStr.slice(11, 13), // hour
      datetimeStr.slice(14, 16), // minute
      datetimeStr.slice(17, 19), // second
      datetimeStr.slice(20, 23) // millisecond
    )
  );
  return dateObj.getTime();
}

const VOLUME = 0.14108774;
const DIRECTION = true;
const PRICE = 29392.742084940008;
const VERSION = 2; // usually have to write 2 here, because default is verison 1
const TIMESTAMP = "2023-04-28 02:46:06.694000000"; // you have to know the exact timestamp in utc

const res = await tickDataStreamWrite(
  VOLUME,
  DIRECTION,
  PRICE,
  convertDatetimeStrToUTCTimestampInMS(TIMESTAMP),
  VERSION
);

console.log("res", res);

/**
 * What helps is to check the entry and the values around it with a query like this
 * SELECT time, measure_value::boolean AS direction, measure_value::double AS price
    FROM "defichartTickDatabase"."btcusd-perp"
    WHERE (measure_name = 'price' or measure_name = 'direction' or measure_name = 'volume') AND time between '2023-04-28 02:41:00.000000000' and '2023-04-28 02:46:06.694000000'
 */
