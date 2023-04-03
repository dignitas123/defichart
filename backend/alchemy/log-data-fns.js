import { balanceOfAndTransferABI } from "./abi/balanceAndTransfer.js";
import { defaultAbiCoder } from "@ethersproject/abi";

// transaction log with from address
export const balanceOfLogDataExample =
  "0x0000000000000000000000000000000000000000000000000098c445ad578003";

// transaction log with to address
export const transferLogDataExample =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffff673bba52a87ffd000000000000000000000000000000000000000000000041f8122f856ccbd1d600000000000000000000000000000000000000a7fab519eab59b68fbaf68e539000000000000000000000000000000000000000000001a6670943ba4374151f40000000000000000000000000000000000000000000000000000000000019051";

/**
 * data has to be retrieved from get-receipt, see ./mocks/receipt-mock.ts for example mock
 *
 * @param { string } balanceOfLogData: log data from getLog.logs[0] (the from address in txn)
 * @param { string } transferLogData: log data from getLog.logs[2] (the to address in txn)
 * @returns
 */
export function getFromToBalancesBTCvsUSD(balanceOfLogData, transferLogData) {
  let decodedBalanceOfLogData = undefined;
  let decodedTransferLogData = undefined;
  try {
    const decodedLog = defaultAbiCoder.decode(
      balanceOfAndTransferABI[0].inputs,
      balanceOfLogData
    );
    decodedBalanceOfLogData = parseInt(decodedLog[0]);
  } catch (e) {
    console.error(e);
  }

  try {
    const decodedLog = defaultAbiCoder.decode(
      balanceOfAndTransferABI[1].inputs,
      transferLogData
    );
    decodedTransferLogData = parseInt(decodedLog[1]._hex);
  } catch (e) {
    console.error(e);
  }

  return { BTC: decodedBalanceOfLogData, USD: decodedTransferLogData };
}

export function extractAllHexStrings(inputString = "") {
  const pattern = /0x([a-fA-F\d]+)/g;
  const matches = inputString.matchAll(pattern);
  const hexStrings = Array.from(matches, (match) => parseInt("0x" + match[1]));
  return hexStrings;
}
