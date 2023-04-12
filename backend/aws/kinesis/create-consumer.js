import { constants } from "../constants.js";
import { kinesisClient } from "../client.js";
import { RegisterStreamConsumerCommand } from "@aws-sdk/client-kinesis";

const consumerName = "frontendDefiCharts";

// Register the consumer
const registerConsumerParams = {
  ConsumerName: consumerName,
  StreamARN: constants.KINESIS_STREAM_ARN,
};

const registerConsumerCommand = new RegisterStreamConsumerCommand(
  registerConsumerParams
);
const registerConsumerResult = await kinesisClient.send(
  registerConsumerCommand
);

console.log(`Consumer ARN: ${registerConsumerResult.ConsumerARN}`);
