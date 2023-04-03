import { alchemy } from "./connect.js";

// sample transaction on optimism vBTC contract 0x287d9ef9a7037b61177715a3af7279dc19e354daf4419059f2580c90d1bdeb2f
export async function getReceipt(
  txnHash = "0x287d9ef9a7037b61177715a3af7279dc19e354daf4419059f2580c90d1bdeb2f"
) {
  const data = await alchemy.core.getTransactionReceipt(txnHash);

  if (data) {
    return data.logs[0];
  }
  return undefined;
}
