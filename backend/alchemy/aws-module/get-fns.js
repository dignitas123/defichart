import { timeStreamQueryClient } from "./client.js";
import { QueryCommand } from "@aws-sdk/client-timestream-query";

/**
 * Gets the records until a rounded up time, f.e. all ticks aggregated with high, low, volume for '1m'
 * (`timeFrame`) and 'minute' (`timeInterval` to be rounded)
 * @param { '1m' | '1h' | '1d' } timeFrame
 * @param { 'minute' | 'hour' | 'day' } timeInterval
 */
export async function getLastBinRecords(
  timeFrame,
  timeInterval,
  symbol = "btcusd-perp"
) {
  const params = {
    QueryString: `
        SELECT
            bin(time, ${timeFrame}) AS binned_time,
            first_price AS open,
            MAX(
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS high,
            MIN(
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS low,
            SUM(
                CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE 0 END
            ) AS volume
        FROM (
            SELECT 
                time,
                measure_name,
                measure_value::double,
                FIRST_VALUE(measure_value::double) OVER (
                    PARTITION BY bin(time, ${timeFrame})
                    ORDER BY time ASC
                ) AS first_price
            FROM "defichartTickDatabase"."${symbol}"
            WHERE time >= DATE_TRUNC('${timeInterval}', now())
        )
        WHERE time >= DATE_TRUNC('${timeInterval}', now())
        GROUP BY bin(time, ${timeFrame}), first_price
        ORDER BY binned_time DESC
    `,
  };

  try {
    const command = new QueryCommand(params);
    return await timeStreamQueryClient.send(command);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

/**
 * Will get high, low, volume from start time (utc)
 * @param { string } startTime F.e. '2023-04-14 11:01:00'
 */
export async function getLastBinRecordsFromStartTime(
  startTime,
  symbol = "btcusd-perp"
) {
  const params = {
    QueryString: `
        SELECT
          (SELECT measure_value::double
          FROM "defichartTickDatabase"."${symbol}"
          WHERE time >= '${startTime}'
          AND measure_name = 'price'
          ORDER BY time ASC
          LIMIT 1) AS open,
          MAX(
              CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
          ) AS high,
          MIN(
              CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
          ) AS low,
          SUM(
              CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE 0 END
          ) AS volume
      FROM "defichartTickDatabase"."${symbol}"
      WHERE time >= '${startTime}'
    `,
  };

  try {
    const command = new QueryCommand(params);
    return await timeStreamQueryClient.send(command);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getLastTick(symbol = "btcusd-perp") {
  const params = {
    QueryString: `
      SELECT
          measure_value::double
      FROM "defichartTickDatabase"."${symbol}"
        WHERE measure_name = 'price'
        ORDER BY time DESC LIMIT 1
    `,
  };

  try {
    const command = new QueryCommand(params);
    return await timeStreamQueryClient.send(command);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
