import { constants } from "../constants.js";
import { timestreamWriteClient } from "../client.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

export async function writeCandleToTimestream(
  _volume,
  _price,
  _timestamp = Date.now()
) {
  const currentTime = _timestamp.toString();

  const dimensions = [{ Name: "region", Value: constants.REGION }];

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
    const writeRecordDataOutput = await timestreamWriteClient.send(command);
    console.log(writeRecordDataOutput);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}
