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
  endTime = "now()",
  symbol = "btcusd-perp",
  databaseName = "defichartTickDatabase"
) {
  const params = {
    QueryString: `SELECT
        bin(time, ${timeFrame}) AS binned_time,
            first_price AS open,
            MAX(  
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS high,
            MIN(
                CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
            ) AS low,
            MAX(
                CASE WHEN measure_name = 'close' THEN measure_value::double ELSE NULL END
            )as close,
            SUM(
                CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE 0 END
            ) AS volume
        FROM (
            SELECT
                time,
                measure_name,
                measure_value::double,
                FIRST_VALUE(
                    CASE WHEN measure_name = 'price' THEN measure_value::double ELSE NULL END
                ) OVER (
                    PARTITION BY bin(time, ${timeFrame})
                    ORDER BY time ASC
                ) AS first_price
            FROM
                "${databaseName}"."${symbol}"
            WHERE
                time BETWEEN '${startTime}' AND ${
      endTime === "now()" ? endTime : `'${endTime}'`
    }
        ) AS subquery
        WHERE
            time BETWEEN '${startTime}' and ${
      endTime === "now()" ? endTime : `'${endTime}'`
    }
        GROUP BY
            bin(time, ${timeFrame}),
            first_price
        ORDER BY
            binned_time DESC`,
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
 * Gets the records from startTime to now
 * @param { string } startTime YYYY-MM-DD HH:MM:SS
 */
export async function getRecordsFromStartTime(
  table,
  startTime,
  databaseName = "defichartTickDatabase"
) {
  const params = {
    QueryString: `SELECT
        time,
        MAX(CASE WHEN measure_name = 'open' THEN measure_value::double ELSE NULL END) as open,
        MAX(CASE WHEN measure_name = 'high' THEN measure_value::double ELSE NULL END) as high,
        MAX(CASE WHEN measure_name = 'low' THEN measure_value::double ELSE NULL END) as low,
        MAX(CASE WHEN measure_name = 'close' THEN measure_value::double ELSE NULL END) as close,
        MAX(CASE WHEN measure_name = 'volume' THEN measure_value::double ELSE NULL END) as volume
    FROM "${databaseName}"."${table}"
    WHERE time between '${startTime}' and now()
    GROUP BY time
    ORDER BY time DESC`,
  };
  try {
    const command = new QueryCommand(params);
    return await timeStreamQueryClient.send(command);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
