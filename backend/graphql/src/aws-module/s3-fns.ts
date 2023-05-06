import { s3Client as client } from "./client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { constants } from "./constants";
import { Readable } from "stream";
import { TimeFrame } from "../timestream-query/types";

interface OHLV {
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface CurrentCandleData {
  m1: OHLV;
  m5: OHLV;
  h1: OHLV;
  d1: OHLV;
  w1: OHLV;
  close: number;
}

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk;
    });
    stream.on("end", () => {
      resolve(data);
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
}

function getBeginningOfCurrentMinute() {
  const now: Date = new Date();
  const beginningOfMinute: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0,
    0
  );
  return beginningOfMinute.getTime();
}

function getBeginningOfCurrentFiveMinuteInterval() {
  const now: Date = new Date();
  const minutes: number = Math.floor(now.getMinutes() / 5) * 5;
  const beginningOfFiveMinuteInterval: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    minutes,
    0,
    0
  );
  return beginningOfFiveMinuteInterval.getTime();
}

function getBeginningOfCurrentHour() {
  const now: Date = new Date();
  const beginningOfHour: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  );
  return beginningOfHour.getTime();
}

function getBeginningOfCurrentDay() {
  const now: Date = new Date();
  const beginningOfDay: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  return beginningOfDay.getTime();
}

function getBeginningOfCurrentWeek() {
  const now: Date = new Date();
  const beginningOfWeek: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + 1,
    0,
    0,
    0,
    0
  );
  return beginningOfWeek.getTime();
}

export async function getObjectOnS3(objKey = "btcusd-perp-cp") {
  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: constants.S3_BUCKET_NAME,
      Key: objKey,
    });

    const response = await client.send(getObjectCommand);

    const objectData = await streamToString(response.Body as Readable);

    return JSON.parse(objectData);
  } catch (error) {
    console.error("Error getting object data:", error);
  }
}

export function getCurrentCandleDataForTF(
  data: CurrentCandleData,
  timeFrame: TimeFrame
) {
  switch (timeFrame) {
    case "M1":
      return data.m1
        ? { ...data.m1, ...{ timestamp: getBeginningOfCurrentMinute() } }
        : undefined;
    case "M5":
      return data.m5
        ? {
            ...data.m5,
            ...{ timestamp: getBeginningOfCurrentFiveMinuteInterval() },
          }
        : undefined;
    case "H1":
      return data.h1
        ? { ...data.h1, ...{ timestamp: getBeginningOfCurrentHour() } }
        : undefined;
    case "D1":
      return data.d1
        ? { ...data.d1, ...{ timestamp: getBeginningOfCurrentDay() } }
        : undefined;
    case "W1":
      return data.w1
        ? { ...data.w1, ...{ timestamp: getBeginningOfCurrentWeek() } }
        : undefined;
  }
}
