import { getReceipt } from "./get-receipt.js";
import { decodeReceiptSignature, getSwapResultData } from "./log-data-fns.js";

/**
 * Default values are for BTC.
 * The function can return the same timestamp multile times. It should be checked if it's the same as
 * before, because volume should be added in this case
 *
 * @param { string } txHash transaction hash
 * @param { BigInt } divider divider to get the right conversion from resultdata to f.e. btc value,
 * @param { BigInt } decimals 100000n f.e. is 8 digits
 * @returns
 */
export async function getPriceData(
  txHash,
  divider = 1000000000000000000n,
  decimals = 8,
  maxPricePrecision = 15
) {
  if (!txHash) {
    console.log("noTxHash");
    return undefined;
  }

  const receiptResult = await getReceipt(txHash);

  if (!receiptResult) {
    console.error("noReceiptResult");
    return undefined;
  }

  const decodedLogResult = decodeReceiptSignature(receiptResult);

  if (!decodedLogResult) {
    console.error("noDecodedLogResult");
    return undefined;
  }

  const swapResultData = getSwapResultData(decodedLogResult);

  if (swapResultData.length < 2) {
    console.error("swapResultData.length < 2");
    return undefined;
  }

  // to replace Math.abs() which doesn't work for BigInt
  const abs = (n) => (n === -0 || n < 0n ? -n : n);

  const divideBigInts = (a, b, decimals) => {
    const result = (a * BigInt(10 ** decimals)) / b;
    return Number(result) / 10 ** decimals;
  };

  let swapPrice = abs(swapResultData[1]) / abs(swapResultData[0])
  
  const countDecimals = (number) => {
    const decimalString = number.toString().split('.')[1];
    return decimalString ? decimalString.length : 0;
  }

  if(countDecimals(swapPrice) > maxPricePrecision) {
    swapPrice = Math.round(swapPrice * 10**maxPricePrecision) / 10**maxPricePrecision;
  }

  return {
    volume: divideBigInts(BigInt(abs(swapResultData[0])), divider, decimals),
    direction: swapResultData[0] > 0,
    price: swapPrice, 
    timestamp: Date.now(),
  };
}
