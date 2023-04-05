import { getReceipt } from "./get-receipt.js";
import { decodeReceiptSignature, getSwapResultData } from "./log-data-fns.js";

const receiptResult = await getReceipt(
  "0x9af99567ba7690e4680067d3c635fa7c68998b73b9a95630d04c9357757dbf79"
);

console.log("receiptResult", receiptResult);

const decodedLogResult = decodeReceiptSignature(receiptResult);

console.log("decodedLogResult", decodedLogResult);

const swapResultData = getSwapResultData(decodedLogResult);

console.log("swapResultData", swapResultData);
