import { TimeFrame, timeFrameMapping } from "./types";
import { constants } from "../aws-module/constants";

function calculateAgo(timeFrame: TimeFrame, amount: number) {
  switch (timeFrame) {
    case "M1":
      return amount + "m";
    case "M5":
      return amount * 5 + "m";
    case "H1":
      return amount + "h";
    case "D1":
      return amount + "d";
    case "W1":
      return amount * 7 + "d";
  }
}

function getTimestreamTableFrom(symbol: string, timeFrame: TimeFrame) {
  switch (timeFrame) {
    case "M1":
      return symbol + "_m1";
    case "M5":
      return symbol + "_m5";
    case "H1":
      return symbol + "_h1";
    case "D1":
      return symbol + "_d1";
    default:
      return symbol + "_w1";
  }
}

export const timeFrameBinQuery = (
  timeFrame: TimeFrame,
  symbol = constants.TABLE_NAME,
  binAmount = 200,
  amountStartShift = 0,
  database = constants.DATABASE_NAME
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
            FROM "${database}"."${symbol}"
            WHERE time between ago(${agoString}) and ${startAgoString}
        )
        WHERE time between ago(${agoString}) and ${startAgoString}
        GROUP BY bin(time, ${mappedTimeFrame})
        ORDER BY binned_time DESC
    `;
};

export const timeFrameQuery = (
  timeFrame: TimeFrame,
  symbol = constants.TABLE_NAME,
  binAmount = 200,
  amountStartShift = 0,
  database = constants.DATABASE_NAME
) => {
  const agoString = calculateAgo(timeFrame, amountStartShift + binAmount);
  let startAgoString = "now()";
  if (amountStartShift > 0) {
    startAgoString = `ago(${calculateAgo(timeFrame, amountStartShift)})`;
  }
  const timestreamTable = getTimestreamTableFrom(symbol, timeFrame);
  return `
      SELECT
        time,
        MAX(CASE WHEN measure_name = 'open' THEN measure_value::double ELSE NULL END) as open,
        MAX(CASE WHEN measure_name = 'high' THEN measure_value::double ELSE NULL END) as high,
        MAX(CASE WHEN measure_name = 'low' THEN measure_value::double ELSE NULL END) as low,
        MAX(CASE WHEN measure_name = 'close' THEN measure_value::double ELSE NULL END) as close,
        MAX(CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE NULL END) as volume
      FROM "${database}"."${timestreamTable}"
      WHERE time between ago(${agoString}) and ${startAgoString}
      GROUP BY time
      ORDER BY time DESC
    `;
};
