import { GetTimeFrameQuery } from 'src/generated/graphql';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { MAX_CANDLES_LOAD, MIN } from 'src/pages/broker-charts/consts';
import { ComputedRef, Ref } from 'vue';

export function useSetCandleData(
  timeFrameInMs: ComputedRef<number>,
  dataRecordsAmountForQuery: Ref<number>,
  data: Ref<OHLC[] | undefined>
) {
  function setCandleDataValues(
    result: Ref<GetTimeFrameQuery | undefined>,
    startShift = 0,
    oldOHLCData: OHLC[] | undefined = undefined
  ) {
    if (!result.value) {
      return;
    }
    const timeFrameRecords = result.value.timeFrameRecords
      ? [...result.value.timeFrameRecords]
      : undefined;
    const reversedRecords = timeFrameRecords?.reverse();

    const oldestOHLCDataOldestRecord = oldOHLCData && oldOHLCData[0];

    const ohlcData: OHLC[] = [];
    if (reversedRecords) {
      const startTimestamp = reversedRecords[0]?.timestamp ?? 0;
      const endTimestamp =
        reversedRecords[reversedRecords.length - 1]?.timestamp ?? 0;
      const timeStep = timeFrameInMs.value ?? MIN;
      let candleTimeStamp = startTimestamp ?? 0;

      let newestRecordTimestamp =
        oldestOHLCDataOldestRecord && dataRecordsAmountForQuery.value
          ? oldestOHLCDataOldestRecord.d.getTime()
          : endTimestamp;

      ohlcData.push({
        o: reversedRecords[0]?.open ?? 0,
        h: reversedRecords[0]?.high ?? 0,
        l: reversedRecords[0]?.low ?? 0,
        c: reversedRecords[0]?.close ?? 0,
        v: reversedRecords[0]?.volume ?? 0,
        d: new Date(candleTimeStamp),
      });

      if (dataRecordsAmountForQuery.value > 0) {
        newestRecordTimestamp -= timeStep;
      }

      if (dataRecordsAmountForQuery.value === 0) {
        candleTimeStamp += timeStep;
      }

      let j = 1;
      while (candleTimeStamp <= newestRecordTimestamp) {
        if (reversedRecords[j]?.timestamp === candleTimeStamp) {
          ohlcData.push({
            o: reversedRecords[j]?.open ?? 0,
            h: reversedRecords[j]?.high ?? 0,
            l: reversedRecords[j]?.low ?? 0,
            c: reversedRecords[j]?.close ?? 0,
            v: reversedRecords[j]?.volume ?? 0,
            d: new Date(reversedRecords[j]?.timestamp ?? 0),
          });
          j++;
        } else if (ohlcData.length > 0) {
          const previousCandle = ohlcData[ohlcData.length - 1];
          ohlcData.push({
            o: previousCandle.c,
            h: previousCandle.c,
            l: previousCandle.c,
            c: previousCandle.c,
            v: 0,
            d: new Date(candleTimeStamp),
          });
        }
        candleTimeStamp += timeStep;
      }
    }
    if (startShift > 0) {
      if (!oldOHLCData) {
        return;
      }
      data.value = [...ohlcData, ...oldOHLCData];
      dataRecordsAmountForQuery.value += MAX_CANDLES_LOAD;
    } else {
      data.value = ohlcData;
      dataRecordsAmountForQuery.value += MAX_CANDLES_LOAD;
    }
  }
  return {
    setCandleDataValues,
  };
}
