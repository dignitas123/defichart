import { credentials } from "./credentials.js";
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new JsonRpcProvider(
  `https://opt-mainnet.g.alchemy.com/v2/${credentials.API_KEY}`
);

/**
 * @typedef {Log} = blockNumber: number;
    blockHash: string;
    transactionIndex: number;

    removed: boolean;

    address: string;
    data: string;

    topics: Array<string>;

    transactionHash: string;
    logIndex: number;
 */

/**
 *
 * @param { string } contract standard contract is optimism vBTC https://optimistic.etherscan.io/token/0x86f1e0420c26a858fc203A3645dD1A36868F18e5
 * @param { number | 'latest' } fromBlock choose one of the earliest blocks fort test
 * @param { number | 'latest' } toBlock
 *
 * @return { NewType[] }
 */
export async function getLogs(
  contract = "0x86f1e0420c26a858fc203A3645dD1A36868F18e5",
  fromBlock = 85636117,
  toBlock = "latest"
) {
  const filter = {
    address: contract,
    fromBlock: fromBlock,
    toBlock: toBlock,
  };

  let logs = undefined;

  provider
    .getLogs(filter)
    .then((contractLogs) => {
      contractLogs.forEach((log) => {
        logs.pushg(log);
      });
    })
    .catch(console.error);

  return logs;
}
