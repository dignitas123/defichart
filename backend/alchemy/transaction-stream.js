import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { alchemy } from "./connect.js";

const contractAddress = "0x86f1e0420c26a858fc203A3645dD1A36868F18e5";

const wantedFunction = toUtf8Bytes("Transfer(address,address,uint256)");

const eventSignatureHash = keccak256(wantedFunction);
const filter = {
  address: contractAddress,
  topics: [eventSignatureHash],
};

alchemy.ws.on(filter, (log) => {
  console.log(`Log ${JSON.stringify(log)}`);
});

// Example Output:
// {"blockNumber":87258911,"blockHash":"0xb309f4a16230f3792ae3b9329f63a85f430f66fc22fca0461ae597dff6c03f0e","transactionIndex":0,"removed":false,"address":"0x86f1e0420c26a858fc203A3645dD1A36868F18e5","data":"0x0000000000000000000000000000000000000000000000000098c445ad578003","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x000000000000000000000000c64f9436f8ca50cdcc096105c62dad52faeb1f2e","0x00000000000000000000000082ac2ce43e33683c58be4cdc40975e73aa50f459"],"transactionHash":"0x3320bb0e516797229339669986b973f923fad43d73cbb4c2ff1d271ae6e6ae4c","logIndex":0}
