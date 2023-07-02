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
let startTimestamp = 0;
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
    d: new Date(startTimestamp),
  });
}

function resetAllTemporaryCandleVariables() {
  previousClose = 0;
  res.length = 0;
  resetAggregateCandlestick();
}

function intervalCalculation(
  records: Query['timeFrameRecords'],
  amount: number,
  timeStep: number,
  dividableTimeCallback: (date: Date) => number,
  dataRecordsAmount: number,
  oldestRecord: OHLC | undefined = undefined,
  mergeNewData = false,
  unevenBeginning = false
) {
  resetAllTemporaryCandleVariables();

  if (records) {
    const oldestRecordDate = mergeNewData
      ? records[records.length - 1]?.timestamp ?? 0
      : new Date(records[0]?.timestamp ?? 0).getTime();
    startTimestamp = oldestRecordDate;
    const endTimestamp = records[records.length - 1]?.timestamp ?? 0;
    let newestRecordTimestamp =
      oldestRecord && dataRecordsAmount && !mergeNewData
        ? oldestRecord.d.getTime()
        : endTimestamp;

    const firstEntryClose = records[0]?.close ?? 0;
    resetAggregateCandlestick();
    open = records[0]?.open ?? 0;
    previousClose = firstEntryClose;
    aggregateCandlestickHighLowVolume(records[0]);

    let candleTimeStamp = startTimestamp + timeStep;
    if (mergeNewData) {
      newestRecordTimestamp -= timeStep;
      candleTimeStamp += timeStep;
    }

    let j = 1;
    while (candleTimeStamp <= newestRecordTimestamp) {
      if (dividableTimeCallback(new Date(candleTimeStamp)) % amount === 0) {
        if (records[j]?.timestamp === candleTimeStamp) {
          pushCandle();
          startTimestamp = records[j]?.timestamp as number;
          open = records[j]?.open as number;
        } else if (previousClose) {
          open = previousClose;
          startTimestamp = candleTimeStamp;
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
    if (unevenBeginning) {
      aggregateCandlestickHighLowVolume({
        close: oldestRecord?.c ?? 0,
        high: oldestRecord?.h ?? 0,
        low: oldestRecord?.l ?? 0,
        open: oldestRecord?.o ?? 0,
        timestamp: oldestRecord?.d.getTime() ?? 0,
        volume: oldestRecord?.v ?? 0,
      });
      res.push({
        o: open,
        h: aggregateHigh,
        l: aggregateLow,
        c: oldestRecord?.c ?? 0,
        v: aggregateVolume,
        d: new Date(startTimestamp),
      });
    } else {
      pushCandle();
    }
  }
  return res;
}

export function timeFrameAggregate(
  tsRecords: Query['timeFrameRecords'],
  timeFrameMode: TimeFrameMode,
  timeModeCount: number,
  dataRecordsAmount: number,
  oldestRecord: OHLC | undefined = undefined,
  mergeNewData = false,
  unevenBeginning = false
) {
  if (!tsRecords) {
    return undefined;
  }
  switch (timeFrameMode) {
    case 'M':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        MIN,
        (date: Date) => date.getMinutes(),
        dataRecordsAmount,
        oldestRecord,
        mergeNewData,
        unevenBeginning
      );
    case 'H':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        HOUR,
        (date: Date) => date.getHours(),
        dataRecordsAmount,
        oldestRecord,
        mergeNewData,
        unevenBeginning
      );
    case 'D':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        DAY,
        getDayOfYear,
        dataRecordsAmount,
        oldestRecord,
        mergeNewData,
        unevenBeginning
      );
    case 'W':
      return intervalCalculation(
        tsRecords,
        timeModeCount,
        WEEK,
        getISOWeek,
        dataRecordsAmount,
        oldestRecord,
        mergeNewData,
        unevenBeginning
      );
  }
}
