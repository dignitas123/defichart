import { getLogs } from "./get-log.js";
import { getReceipt } from "./get-receipt.js";
import { getFromToBalancesBTCvsUSD } from "./log-data-fns.js";

const receipt = await getReceipt();

console.log("receipt", receipt);

const { BTC, USD } = getFromToBalancesBTCvsUSD(
  receipt.logs[0].data,
  receipt.logs[2].data
);

console.log("BTC", BTC, "USD", USD, "price", USD / BTC);
