import { credentialsV2 } from "./credentials.js";
import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";

export const writeClient = new TimestreamWriteClient({
  region: "eu-central-1",
  credentials: credentialsV2,
});
