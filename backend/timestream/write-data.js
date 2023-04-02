import { constants } from "./constants.js";
import { writeClient } from "./client.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

async function writeRecordsWithCommonAttributes() {
  console.log("Writing records with common attributes");
  const currentTime = Date.now().toString(); // Unix time in milliseconds

  const dimensions = [{ Name: "region", Value: "eu-central-1" }];

  const commonAttributes = {
    Dimensions: dimensions,
    MeasureValueType: "DOUBLE",
    Time: currentTime.toString(),
  };

  const price = {
    MeasureName: "price",
    MeasureValue: "13.4",
  };

  const volume = {
    MeasureName: "volume",
    MeasureValue: "41",
  };

  const records = [price, volume];

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: constants.TABLE_NAME,
    Records: records,
    CommonAttributes: commonAttributes,
  };

  const command = new WriteRecordsCommand(params);

  try {
    const data = await writeClient.send(command);
    console.log("Data written", data);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}

await writeRecordsWithCommonAttributes();
