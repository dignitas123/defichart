import AWS from "aws-sdk";
import { credentials } from "../credentials.js";

AWS.config.update({
  accessKeyId: credentials.AWS_ACCESS_KEY_ID,
  secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
  region: credentials.AWS_REGION,
});
