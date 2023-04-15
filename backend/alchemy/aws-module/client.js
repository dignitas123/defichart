import { constants } from "./constants.js";
import { credentialsV2 } from "./credentials.js";
import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";
import { KinesisClient } from "@aws-sdk/client-kinesis";

export const timestreamWriteClient = new TimestreamWriteClient({
  region: constants.REGION,
  credentials: credentialsV2,
});

export const timeStreamQueryClient = new TimestreamQueryClient({
  region: constants.REGION,
  credentials: credentialsV2,
});

export const kinesisClient = new KinesisClient({
  region: constants.REGION,
  ConsumerARN: constants.KINESIS_STREAM_ARN,
  StreamName: constants.KINESIS_STREAM_NAME,
  credentials: credentialsV2,
});
