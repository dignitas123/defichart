import { getBinRecordsFromStartTime } from "../get-data.js";
import fs from "fs";

const START_DATE = "2023-05-21 00:00:00";
const TIME_FRAME = "1d";
const OUTPUT_FILE_NAME = "BTCUSD_d1.csv";

const ret = await getBinRecordsFromStartTime(TIME_FRAME, START_DATE);

const hlcvtRecords = ret.Rows.map((row) => {
  return {
    open: row.Data[1].ScalarValue,
    high: row.Data[2].ScalarValue,
    low: row.Data[3].ScalarValue,
    close: row.Data[4].ScalarValue,
    volume: row.Data[5].ScalarValue,
  };
});

const headers = Object.keys(hlcvtRecords[0]).join(",");
const rows = hlcvtRecords
  .filter((obj) => obj.volume > 0)
  .map((obj) => Object.values(obj).join(","));

const csvRows = `${headers}\n${rows.join("\n")}`;

fs.writeFile(OUTPUT_FILE_NAME, csvRows, (err) => {
  if (err) throw err;
  console.log("CSV file has been created successfully.");
});
