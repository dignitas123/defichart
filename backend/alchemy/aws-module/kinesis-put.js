import { constants } from "./constants.js";
import { kinesisClient } from "./client.js";
import { PutRecordCommand } from "@aws-sdk/client-kinesis";

export async function putRecordOnKinesis(volume, direction, price, timestamp, partitionKey="btcusd-perp") {
  const data = {
    volume: volume,
    direction: direction,
    price: price,
    timestamp: timestamp,
  };

  const command = new PutRecordCommand({
    Data: new TextEncoder().encode(JSON.stringify(data)),
    PartitionKey: partitionKey,
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
}
