import { constants } from "./aws-module/constants.js";
import { kinesisClient } from "./aws-module/client.js";
import { PutRecordCommand } from "@aws-sdk/client-kinesis";

const data = { ticker: "btcusd-perp", price: 1239 };

const command = new PutRecordCommand({
  Data: new TextEncoder().encode(JSON.stringify(data)),
  PartitionKey: "btcusd-perp",
  StreamName: constants.KINESIS_STREAM_NAME,
  StreamARN: constants.KINESIS_STREAM_ARN,
});

try {
  const result = await kinesisClient.send(command);
  console.log(`Record put on Kinesis stream: ${data}`);
  console.log(`Shard ID: ${result.ShardId}`);
  console.log(`Sequence number: ${result.SequenceNumber}`);
} catch (error) {
  console.error(error);
}
