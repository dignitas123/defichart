import { timestreamWriteClient } from "../client.js";
import { constants } from "../constants.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

async function writeRecordsWithCommonAttributes() {
  // to overwrite data you need the time and set it to utc by adding +00:00 like
  // '2023-04-02 08:21:15.007+00:00' for '2023-04-02 08:21:15.0070000' and then new Date('2023-04-02 08:21:15.007+00:00').getTime().toString()
  const currentTime = Date.now().toString();

  const dimensions = [{ Name: "region", Value: "eu-central-1" }];

  const commonAttributes = {
    Dimensions: dimensions,
    MeasureValueType: "DOUBLE",
    Version: 1,
    Time: currentTime.toString(),
  };

  const open = {
    MeasureName: "open",
    MeasureValue: "100.1",
  };

  const high = {
    MeasureName: "high",
    MeasureValue: "100.5",
  };

  const low = {
    MeasureName: "low",
    MeasureValue: "99.8",
  };

  const close = {
    MeasureName: "close",
    MeasureValue: "100.0",
  };

  const volume = {
    MeasureName: "volume",
    MeasureValue: "0.91",
  };

  const records = [open, high, low, close, volume];

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: constants.TABLE_NAME,
    Records: records,
    CommonAttributes: commonAttributes,
  };

  const command = new WriteRecordsCommand(params);

  try {
    const data = await timestreamWriteClient.send(command);
    console.log("Data written", data);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}

await writeRecordsWithCommonAttributes();
