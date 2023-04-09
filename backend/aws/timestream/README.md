## deleting/modifying data

You can't delete data from AWS Timestream, you can "upsert" data by executing write-data.js and increasing the Version by 1, more information in write-data.js.

## query timeframe interval data from timestream

Example for 30m intervals (high, low, close, volume) data, last one is the current open, last close is current price
```
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
```