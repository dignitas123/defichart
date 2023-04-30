import { candleStickStreamWrite } from "./aws-module/timestream-write-fns.js";
import { convertDatetimeStrToUTCTimestampInMS } from "./fix-tick-entry.js";

const VOLUME = 206.0580653500003;
const OPEN = 29561.210272671087;
const HIGH = 29665.95476058981;
const LOW = 28982.9;
const CLOSE = 29250.283381065976;
const TABLE = "btcusd-perp_d1";
const VERSION = 2; // usually have to write 2 here, because default is verison 1
const TIMESTAMP = "2023-04-28 00:00:00.000000000"; // you have to know the exact timestamp in utc

const res = await candleStickStreamWrite(
  VOLUME,
  OPEN,
  HIGH,
  LOW,
  CLOSE,
  convertDatetimeStrToUTCTimestampInMS(TIMESTAMP),
  TABLE,
  VERSION
);

console.log("res", res);
