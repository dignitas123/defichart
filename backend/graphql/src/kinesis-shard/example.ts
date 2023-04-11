import { constants } from "../aws-module/constants";
import {
  KinesisClient,
  SubscribeToShardCommand,
} from "@aws-sdk/client-kinesis";
import { withFilter } from "graphql-subscriptions";

// Set up the Kinesis client
const kinesisClient = new KinesisClient({ region: constants.REGION });
const params = {
  ConsumerARN: constants.KINESIS_CONSUMER_ARN,
  ShardId: "shardId-000000000000",
  StartingPosition: { Type: "LATEST" },
  StreamName: constants.KINESIS_STREAM_NAME,
};

// Create a message consumer that listens for incoming messages from the Kinesis stream
async function* messageConsumer() {
  const command = new SubscribeToShardCommand(params);

  // Convert the Kinesis payload into a readable stream
  const { EventStream } = await kinesisClient.send(command);

  if (!EventStream) {
    return;
  }

  for await (const chunk of EventStream) {
    // Parse the incoming message
    const message = JSON.parse(chunk.toString());

    // Yield the message to the subscription resolver
    yield message;
  }
}

interface SubscriptionPayload {
  data: {
    symbol: string;
    // Add other properties here
  };
}

interface SubscriptionVariables {
  symbol: string;
  // Add other properties here
}

// Define the subscription resolver for real-time updates
const subscriptionResolver = {
  mySubscription: {
    subscribe: withFilter(
      () => messageConsumer(), // Use the message consumer to listen for updates
      (payload, variables) => {
        // Check if the payload matches the subscription filter
        return payload.data.symbol === variables.symbol;
      }
    ),
    resolve: (payload: SubscriptionPayload) => {
      // Map the incoming payload to the subscription payload
      return payload.data;
    },
  },
};
