import { constants } from "./constants.js";
import { writeClient } from "./client.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

export async function timestreamWrite(
  _volume,
  _direction,
  _price,
  _timestamp = Date.now()
) {
  // to overwrite data you need the time and set it to utc by adding +00:00 like
  // '2023-04-02 08:21:15.007+00:00' for '2023-04-02 08:21:15.0070000' and then new Date('2023-04-02 08:21:15.007+00:00').getTime().toString()
  const currentTime = _timestamp.toString();

  const dimensions = [{ Name: "region", Value: "eu-central-1" }];

  const commonAttributes = {
    Dimensions: dimensions,
    Version: 1,
    Time: currentTime,
  };

  const volume = {
    MeasureValueType: "DOUBLE",
    MeasureName: "volume",
    MeasureValue: String(_volume),
  };

  const direction = {
    MeasureValueType: "BOOLEAN",
    MeasureName: "direction",
    MeasureValue: String(_direction),
  };

  const price = {
    MeasureValueType: "DOUBLE",
    MeasureName: "price",
    MeasureValue: String(_price),
  };

  const records = [volume, direction, price];

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: constants.TABLE_NAME,
    Records: records,
    CommonAttributes: commonAttributes,
  };

  const command = new WriteRecordsCommand(params);

  try {
    const writeRecordDataOutput = await writeClient.send(command);
    console.log(writeRecordDataOutput);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}
