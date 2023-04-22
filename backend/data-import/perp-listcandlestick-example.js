import fs from "fs";

// data to be retrieved from graphql queries on app.perp.com
const d1 = {
  data: {
    listCandleSticks: {
      items: [
        {
          market: "0x86f1e0420c26a858fc203A3645dD1A36868F18e5",
          resolution: "5m",
          startTime: 1680572400,
          open: "27850.9736040537288201949727074843667957208481",
          high: "27850.9736040537288201949727074843667957208481",
          low: "27850.9736040537288201949727074843667957208481",
          close: "27850.9736040537288201949727074843667957208481",
          volume: "0",
          baseAssetVol: "0",
          txCount: 0,
          blockNumber: 85983700,
          version: 0,
          __typename: "CandleStick",
        },
      ],
      __typename: "CandleStickConnection",
    },
  },
};

const res = [];
d1.data.listCandleSticks.items.forEach((item) => {
  res.push({
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: Number(item.baseAssetVol),
    timestamp: item.startTime,
  });
});
// d2 etc. (you have to name the single requests with list candlesticks items each)

const headers = Object.keys(res[0]).join(",");
const rows = res
  .filter((obj) => obj.volume > 0)
  .map((obj) => Object.values(obj).join(","));

const csv = `${headers}\n${rows.join("\n")}`;

fs.writeFile("btcusd-perp_m5.csv", csv, (err) => {
  if (err) throw err;
  console.log("CSV file has been created successfully.");
});
