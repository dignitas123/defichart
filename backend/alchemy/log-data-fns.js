import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { defaultAbiCoder } from "@ethersproject/abi";

export function decodeReceiptSignature(receipt) {
  if (!receipt || receipt.status === "0x0") {
    console.error("Transaction failed");
    return undefined;
  }
  const wantedFunction = toUtf8Bytes(
    "Swap(address,address,int256,int256,uint160,uint128,int24)"
  );
  const eventSignatureHash = keccak256(wantedFunction);
  const signatureLog = receipt.logs.find(
    (log) => log.topics[0] === eventSignatureHash
  );
  if (!signatureLog) {
    console.error("Eventsignature not found");
    return undefined;
  }
  const decodedLog = defaultAbiCoder.decode(
    ["int256", "int256", "uint160", "uint128", "int24"],
    signatureLog.data
  );
  return decodedLog;
}

export function getSwapResultData(decodedLogResult) {
  const swapResultData = [];
  for (const result of decodedLogResult) {
    if (result._hex) {
      swapResultData.push(parseInt(result._hex));
    }
  }
  return swapResultData;
}

// Example:
// const data = '0xffffffffffffffffffffffffffffffffffffffffffffffffff673bba52a87ffd000000000000000000000000000000000000000000000041f8122f856ccbd1d600000000000000000000000000000000000000a7fab519eab59b68fbaf68e539000000000000000000000000000000000000000000001a6670943ba4374151f40000000000000000000000000000000000000000000000000000000000019051'

// amount0 :
// -43000000000000003
// amount1 :
// 1216913766912210227670
// sqrtPriceX96 :
// 13308693330299617246745266283833
// liquidity :
// 124671208624534438629876
// tick :
// 102481
