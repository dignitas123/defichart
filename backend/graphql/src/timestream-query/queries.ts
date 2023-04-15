import { TimeFrame, timeFrameMapping } from "./types";
import { constants } from "../aws-module/constants";

function calculateAgo(timeFrame: TimeFrame, amount: number) {
  switch (timeFrame) {
    case "M1":
      return amount + "m";
    case "M2":
      return amount * 2 + "m";
    case "M3":
      return amount * 3 + "m";
    case "M4":
      return amount * 4 + "m";
    case "M5":
      return amount * 5 + "m";
    case "M10":
      return amount * 10 + "m";
    case "M15":
      return amount * 15 + "m";
    case "M20":
      return amount * 20 + "m";
    case "M30":
      return amount * 30 + "m";
    case "H1":
      return amount + "h";
    case "H2":
      return amount * 2 + "h";
    case "H3":
      return amount * 3 + "h";
    case "H4":
      return amount * 4 + "h";
    case "H6":
      return amount * 6 + "h";
    case "H8":
      return amount * 8 + "h";
    case "H12":
      return amount * 12 + "h";
    case "D1":
      return amount + "d";
    case "D2":
      return amount * 2 + "d";
    case "D3":
      return amount * 3 + "d";
    case "D4":
      return amount * 4 + "d";
    case "W1":
      return amount + "w";
    case "W2":
      return amount * 2 + "w";
    case "W3":
      return amount * 3 + "w";
    case "W4":
      return amount * 4 + "w";
  }
}

export const timestreamRecordsQuery = (
  timeFrame: TimeFrame,
  binAmount = 200,
  amountStartShift = 0,
  database = constants.DATABASE_NAME,
  table = constants.TABLE_NAME
) => {
  const agoString = calculateAgo(timeFrame, amountStartShift + binAmount);
  let startAgoString = "now()";
  if (amountStartShift > 0) {
    startAgoString = `ago(${calculateAgo(timeFrame, amountStartShift)})`;
  }
  const mappedTimeFrame = timeFrameMapping[timeFrame];
  return `
        SELECT
            bin(time, ${mappedTimeFrame}) as binned_time,
            MAX(
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS high,
            MIN(
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS low,
            MAX(CASE WHEN desc_rank = 1 THEN measure_value::double ELSE NULL END) as close,
            SUM(
                CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE 0 END
            ) AS volume
        FROM (
            SELECT 
                time,
                measure_name,
                measure_value::double,
                RANK() OVER (PARTITION BY bin(time, ${mappedTimeFrame}) ORDER BY time DESC) as desc_rank
            FROM "${database}"."${table}"
            WHERE time between ago(${agoString}) and ${startAgoString}
        )
        WHERE time between ago(${agoString}) and ${startAgoString}
        GROUP BY bin(time, ${mappedTimeFrame})
        ORDER BY binned_time DESC
    `;
};