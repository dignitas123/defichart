import { credentials } from "./credentials";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

export const timeStreamQueryClient = new TimestreamQueryClient({
  region: "eu-central-1",
  credentials: credentials,
});
