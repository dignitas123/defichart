import { toUtf8Bytes } from "@ethersproject/strings";
import { keccak256 } from "@ethersproject/keccak256";
import { alchemy } from "./connect.js";
import { getPriceData } from "./get-price.js";
import { timestreamWrite } from "./aws-module/timestream-write.js";
import { putRecordOnKinesis } from "./aws-module/kinesis-put.js";

const contractAddress = "0x86f1e0420c26a858fc203A3645dD1A36868F18e5";

const wantedFunction = toUtf8Bytes("Transfer(address,address,uint256)");

const eventSignatureHash = keccak256(wantedFunction);
const filter = {
  address: contractAddress,
  topics: [eventSignatureHash],
};

setInterval(() => {
  const now = new Date();
  if (now.getSeconds() === 0) {
    console.log("Executing at the beginning of a new minute!");
    if (now.getMinutes() % 5 === 0) {
      console.log("new 5 minutes");
    }
    if (now.getMinutes() === 0) {
      console.log("new hour");
      if (now.getHours() === 0) {
        console.log("new day");
        if (now.getDay() === 1) {
          console.log("new week");
        }
      }
    }
  }
}, 1000); // Run every second

let previousTimeStamp = undefined;
let previousVolume = 0;

alchemy.ws.on(filter, async (log) => {
  const priceData = await getPriceData(log.transactionHash);
  if (priceData) {
    const currentTimeStamp = priceData.timestamp;
    if (previousTimeStamp && previousTimeStamp === currentTimeStamp) {
      priceData.volume += previousVolume;
      previousVolume = priceData.volume;
    } else {
      previousVolume = priceData.volume;
    }
    previousTimeStamp = priceData.timestamp;
    await putRecordOnKinesis(
      priceData.volume,
      priceData.direction,
      priceData.price,
      priceData.timestamp
    );
    await timestreamWrite(
      priceData.volume,
      priceData.direction,
      priceData.price,
      priceData.timestamp
    );
  }
});
