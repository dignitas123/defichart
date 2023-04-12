import { constants } from "./constants";
import { KinesisClient } from "@aws-sdk/client-kinesis";
import { credentials } from "./credentials";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

export const timeStreamQueryClient = new TimestreamQueryClient({
  region: "eu-central-1",
  credentials: credentials,
});

export const kinesisClient = new KinesisClient({
  region: constants.REGION,
  credentials: credentials,
});
