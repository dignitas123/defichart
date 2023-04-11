import { credentialsV2 } from "../credentials.js";
import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

export const writeClient = new TimestreamWriteClient({
  region: "eu-central-1",
  credentials: credentialsV2,
});

export const timeStreamQueryClient = new TimestreamQueryClient({
  region: "eu-central-1",
  credentials: credentialsV2,
});
