import { TimeStreamRecord, Query, Maybe } from 'src/generated/graphql';
import { TimeFrameMode } from '../chart-window.if';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { getDayOfYear, getISOWeek } from 'date-fns';
import { DAY, HOUR, MIN, WEEK } from 'src/pages/broker-charts/consts';

const res: OHLC[] = [];

let aggregateVolume = 0;
let aggregateHigh = 0;
let aggregateLow = Infinity;
let open = 0;
let openDate = 0;
let previousClose = 0;

function aggregateCandlestickHighLowVolume(tsRecord: Maybe<TimeStreamRecord>) {
  if (!tsRecord) {
    return;
  }
  aggregateVolume += tsRecord.volume ?? 0;
  if (tsRecord.high > aggregateHigh) {
    aggregateHigh = tsRecord.high;
  }
  if (tsRecord.low < aggregateLow) {
    aggregateLow = tsRecord.low;
  }
}

function resetAggregateCandlestick() {
  aggregateVolume = 0;
  aggregateHigh = 0;
  aggregateLow = Infinity;
}

function pushCandle() {
  res.push({
    o: open,
    h: aggregateHigh,
    l: aggregateLow,
    c: previousClose,
    v: aggregateVolume,
    d: new Date(openDate),
  });
}

function resetAllTemporaryCandleVariables() {
  previousClose = 0;
  res.length = 0;
  resetAggregateCandlestick();
}

function roundDownMinute(date: Date, amount: number) {
  const currentMinute = date.getMinutes();
  const roundDownMinute = Math.floor(currentMinute / amount) * amount;
  return date.getTime() - (currentMinute - roundDownMinute) * MIN;
}

function intervalCalculation(
  records: Query['timeFrameRecords'],
  amount: number,
  timeStep: number,
  dividableTimeCallback: (date: Date) => number,
  roundStartTimeCallback: (date: Date, amount: number) => number,
  dataRecordsAmount: number,
  oldestRecord: OHLC | undefined = undefined
) {
  resetAllTemporaryCandleVariables();
  // take first date, get rounded date
  if (records) {
    const oldestRecordDate = new Date(records[0]?.timestamp ?? 0).getTime();
    openDate = roundStartTimeCallback(new Date(oldestRecordDate), amount);
    const newestRecordTimestamp =
      oldestRecord && dataRecordsAmount
        ? oldestRecord.d.getTime()
        : records[records.length - 1]?.timestamp ?? 0;

    // first entry
    res.push({
      o: records[0]?.open ?? 0,
      h: records[0]?.high ?? 0,
      l: records[0]?.low ?? 0,
      c: records[0]?.close ?? 0,
      v: records[0]?.volume ?? 0,
      d: new Date(openDate),
    });
    resetAggregateCandlestick();
    open = res[0].c;
    previousClose = res[0].c;
    aggregateCandlestickHighLowVolume({
      open: previousClose,
      high: previousClose,
      low: previousClose,
      close: previousClose,
      volume: 0,
      timestamp: openDate,
    });
    let candleTimeStamp = openDate + timeStep;

    let j = 1;
    while (candleTimeStamp <= newestRecordTimestamp) {
      if (dividableTimeCallback(new Date(candleTimeStamp)) % amount === 0) {
        if (records[j]?.timestamp === candleTimeStamp) {
          aggregateCandlestickHighLowVolume(records[j]);
          openDate = records[j]?.timestamp as number;
          pushCandle();
          open = records[j]?.open as number;
        } else if (previousClose) {
          // 0 volume candle has open === previousClose and openDate candleTimeStamp iteration
          open = previousClose;
          openDate = candleTimeStamp;
          pushCandle();
        }
        resetAggregateCandlestick();
      }
      if (records[j]?.timestamp === candleTimeStamp) {
        aggregateCandlestickHighLowVolume(records[j]);
        previousClose = records[j]?.close as number;
        j++;
      } else {
        aggregateCandlestickHighLowVolume({
          open: previousClose,
          high: previousClose,
          low: previousClose,
          close: previousClose,
          volume: 0,
          timestamp: candleTimeStamp,
        });
      }
      candleTimeStamp += timeStep;
    }
  }
  return res;
}

export function timeFrameAggregate(
  tsRecords: Query['timeFrameRecords'],
  timeFrameMode: TimeFrameMode,
  timeModeCount: number,
  dataRecordsAmount: number,
  oldestRecord: OHLC | undefined = undefined
) {
  if (!tsRecords) {
    return undefined;
  }
  switch (timeFrameMode) {
    case 'M':
      const amount = timeModeCount === 5 ? timeModeCount / 5 : timeModeCount;
      return intervalCalculation(
        tsRecords,
        amount,
        timeModeCount === 5 ? MIN * 5 : MIN,
        (date: Date) => date.getMinutes(),
        roundDownMinute,
        dataRecordsAmount,
        oldestRecord
      );
    case 'H':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        HOUR,
        (date: Date) => date.getHours(),
        roundDownMinute,
        dataRecordsAmount,
        oldestRecord
      );
    case 'D':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        DAY,
        getDayOfYear,
        roundDownMinute,
        dataRecordsAmount,
        oldestRecord
      );
    case 'W':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        WEEK,
        getISOWeek,
        roundDownMinute,
        dataRecordsAmount,
        oldestRecord
      );
  }
}
