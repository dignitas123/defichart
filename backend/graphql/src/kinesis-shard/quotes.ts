import { constants } from "../aws-module/constants";
import { kinesisClient } from "../aws-module/client";
import { SubscribeToShardCommand } from "@aws-sdk/client-kinesis";

// Set up the Kinesis client
const params = {
  ConsumerARN: constants.KINESIS_CONSUMER_ARN,
  ShardId: "shardId-000000000000",
  StartingPosition: { Type: "LATEST" },
  StreamName: constants.KINESIS_STREAM_NAME,
};

// Create a message consumer that listens for incoming messages from the Kinesis stream
export async function* messageConsumer() {
  const command = new SubscribeToShardCommand(params);

  // Convert the Kinesis payload into a readable stream
  const { EventStream } = await kinesisClient.send(command);

  if (!EventStream) {
    return;
  }

  for await (const chunk of EventStream) {
    // Parse the incoming message
    const message = JSON.parse(JSON.stringify(chunk));
    const recordsData = message.SubscribeToShardEvent.Records[0];

    // Yield the message to the subscription resolver
    if (recordsData) {
      const partitionKey =
        message.SubscribeToShardEvent.Records[0].PartitionKey;
      const uintArray = new Uint8Array(Object.values(recordsData.Data));
      const payload = JSON.parse(new TextDecoder().decode(uintArray));
      yield {
        ticker: partitionKey,
        volume: payload.volume,
        direction: payload.direction,
        price: payload.price,
        timestamp: payload.timestamp,
      };
    } else {
      yield "";
    }
  }
}
