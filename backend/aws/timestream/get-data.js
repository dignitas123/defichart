import { timeStreamQueryClient } from "../client.js";
import { QueryCommand } from "@aws-sdk/client-timestream-query";

/**
 * Gets the records until a rounded up time, f.e. all ticks aggregated with high, low, volume for '1m'
 * (`timeFrame`) and 'minute' (`timeInterval` to be rounded)
 * @param { '1m' | '1h' | '1d' } timeFrame e.g. '5m' also possible
 * @param { string } startTime YYYY-MM-DD HH:MM:SS
 * @param { string } endTime don't fill out so it will be until `now()`
 */
export async function getBinRecordsFromStartTime(
  timeFrame,
  startTime,
  endTime = 'now()',
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
                FIRST_VALUE(CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END) OVER (
                    PARTITION BY bin(time, ${timeFrame})
                    ORDER BY time ASC
                ) AS first_price
            WHERE time between '${startTime}' and ${endTime === 'now()' ? endTime : `'${endTime}'`}
            FROM "defichartTickDatabase"."${symbol}"
        )
        WHERE time between '${startTime}' and ${endTime === 'now()' ? endTime : `'${endTime}'`}
        GROUP BY bin(time, ${timeFrame}), first_price
        ORDER BY binned_time DESC
    `,
  };

  console.log(params.QueryString);

  try {
    const command = new QueryCommand(params);
    return await timeStreamQueryClient.send(command);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
