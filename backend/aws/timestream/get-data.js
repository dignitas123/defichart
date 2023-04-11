import { timeStreamQueryClient } from "./client.js";
import { QueryCommand } from "@aws-sdk/client-timestream-query";

async function getRecords() {
  const params = {
    QueryString: `
      SELECT
          bin(time, 30m) as binned_time,
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
        RANK() OVER (PARTITION BY bin(time, 30m) ORDER BY time DESC) as desc_rank
        FROM "defichartTickDatabase"."btcusd-perp"
        WHERE time >= ago(2h)
      )
      WHERE time >= ago(2h)
      GROUP BY bin(time, 30m)
      ORDER BY binned_time DESC
    `,
    ClientToken: "a-long-client-token-coming-from-localhost",
  };

  try {
    const command = new QueryCommand(params);
    const data = await timeStreamQueryClient.send(command);
    if (data.Rows) {
      data.Rows.forEach((row, i) => {
        console.log(`row ${i}`);
        row.Data.forEach((rowData, i) => {
          console.log(`row data ${i}`, rowData.ScalarValue);
        });
      });
    }
  } catch (error) {
    console.error(error);
  }
}

await getRecords();
