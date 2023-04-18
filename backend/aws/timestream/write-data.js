import { timestreamWriteClient } from "../client.js";
import { constants } from "../constants.js";
import { WriteRecordsCommand } from "@aws-sdk/client-timestream-write";

export async function writeExampleRecordsWithCommonAttributes() {
  // to overwrite data you need the time and set it to utc by adding +00:00 like
  // '2023-04-02 08:21:15.007+00:00' for '2023-04-02 08:21:15.0070000' and then new Date('2023-04-02 08:21:15.007+00:00').getTime().toString()
  const currentTime = Date.now().toString();

  const dimensions = [{ Name: "region", Value: constants.REGION }];

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

export async function tickDataStreamWrite(
  _volume,
  _direction,
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

/**
 * @param { obj } hlcvt {
    high: number,
    low: number,
    close: number,
    volume: number,
    timestamp: number, // timestamp in milliseconds
  }
  @param { string } tableName
 */
export async function candleSticksStreamWrite(hlcvt, tableName) {
  if (!Array.isArray(hlcvt) || hlcvt.length > 200) {
    throw new Error(
      !Array.isArray(hlcvt)
        ? "hlcvt has to be an array"
        : "hlcvt array can't be longer than 500"
    );
  }

  const dimensions = [{ Name: "region", Value: constants.REGION }];

  const commonAttributes = {
    Dimensions: dimensions,
    Version: 1,
  };

  const records = [];

  hlcvt.forEach((entry) => {
    const timeStampInMilliseconds = entry.timestamp.toString();

    const high = {
      MeasureValueType: "DOUBLE",
      MeasureName: "high",
      MeasureValue: String(entry.high),
      Time: timeStampInMilliseconds,
    };

    const low = {
      MeasureValueType: "DOUBLE",
      MeasureName: "low",
      MeasureValue: String(entry.low),
      Time: timeStampInMilliseconds,
    };

    const close = {
      MeasureValueType: "DOUBLE",
      MeasureName: "close",
      MeasureValue: String(entry.close),
      Time: timeStampInMilliseconds,
    };

    const volume = {
      MeasureValueType: "DOUBLE",
      MeasureName: "volume",
      MeasureValue: String(entry.volume),
      Time: timeStampInMilliseconds,
    };

    records.push(high);
    records.push(low);
    records.push(close);
    records.push(volume);
  });

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: tableName,
    Records: records,
    CommonAttributes: commonAttributes,
  };

  const command = new WriteRecordsCommand(params);

  try {
    const writeRecordDataOutput = await timestreamWriteClient.send(command);
    console.log("candlesticks written", writeRecordDataOutput);
  } catch (error) {
    console.log("Error writing data. ", error);
  }
}
