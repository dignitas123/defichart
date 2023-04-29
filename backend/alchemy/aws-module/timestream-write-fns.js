import { constants } from "./constants.js";
import { timestreamWriteClient } from "./client.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

export async function tickDataStreamWrite(
  _volume,
  _direction,
  _price,
  _timestamp = Date.now(),
  _version = 1
) {
  // to overwrite data you need the time and set it to utc by adding +00:00 like
  // '2023-04-02 08:21:15.007+00:00' for '2023-04-02 08:21:15.0070000' and then new Date('2023-04-02 08:21:15.007+00:00').getTime().toString()
  const currentTime = _timestamp.toString();

  const dimensions = [{ Name: "region", Value: constants.REGION }];

  const commonAttributes = {
    Dimensions: dimensions,
    Version: _version,
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
    return await timestreamWriteClient.send(command);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}

export async function candleStickStreamWrite(
  _volume,
  _open,
  _high,
  _low,
  _close,
  _timestamp = Date.now(),
  tableName
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

  const open = {
    MeasureValueType: "DOUBLE",
    MeasureName: "open",
    MeasureValue: String(_open),
  };

  const high = {
    MeasureValueType: "DOUBLE",
    MeasureName: "high",
    MeasureValue: String(_high),
  };

  const low = {
    MeasureValueType: "DOUBLE",
    MeasureName: "low",
    MeasureValue: String(_low),
  };

  const close = {
    MeasureValueType: "DOUBLE",
    MeasureName: "close",
    MeasureValue: String(_close),
  };

  const records = [volume, open, high, low, close];

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: tableName,
    Records: records,
    CommonAttributes: commonAttributes,
  };

  const command = new WriteRecordsCommand(params);

  try {
    await timestreamWriteClient.send(command);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}
