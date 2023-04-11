import { TimeStreamRecord } from "../timestream-query/types";
import { timeStreamQueryClient } from "./client";
import { QueryCommand } from "@aws-sdk/client-timestream-query";

export async function getTimestreamRecords(queryString: string) {
  const params = {
    QueryString: queryString,
    ClientToken: "a-long-client-token-coming-from-localhost",
  };

  try {
    const command = new QueryCommand(params);
    const data = await timeStreamQueryClient.send(command);
    const res: TimeStreamRecord[] = [];
    if (!data.Rows) {
      return undefined;
    }
    data.Rows.forEach((row) => {
      if (!row.Data || row.Data.length < 4) {
        return undefined;
      }
      if (row.Data.some((data) => !data.ScalarValue)) {
        return undefined;
      }
      res.push({
        timestamp: new Date(row.Data[0].ScalarValue as string)
          .getTime()
          .toString(),
        high: Number(row.Data[1].ScalarValue),
        low: Number(row.Data[2].ScalarValue),
        close: Number(row.Data[3].ScalarValue),
        volume: Number(row.Data[4].ScalarValue),
      });
    });
    return res;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
