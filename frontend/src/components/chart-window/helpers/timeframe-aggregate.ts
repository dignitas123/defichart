import { TimeStreamRecord, Query, Maybe } from 'src/generated/graphql';
import { TimeFrameMode } from '../chart-window.if';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { getDayOfYear, getISOWeek } from 'date-fns';

const res: OHLC[] = [];

let aggregateVolume = 0;
let aggregateHigh = 0;
let aggregateLow = Infinity;
let first = false;
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
  first = false;
  resetAggregateCandlestick();
}

function intervalCalculation(
  records: Query['timeFrameRecords'],
  amount: number,
  callback: (date: number | Date) => number
) {
  resetAllTemporaryCandleVariables();
  records?.forEach((tsRecord, index, array) => {
    if (!tsRecord) {
      return;
    }
    if (!first) {
      if (callback(new Date(tsRecord.timestamp)) % amount === 0) {
        first = true;
        open = tsRecord?.open ?? 0;
        openDate = tsRecord?.timestamp ?? 0;
        aggregateCandlestickHighLowVolume(tsRecord);
      }
      return;
    }
    if (callback(new Date(tsRecord.timestamp)) % amount === 0) {
      if (previousClose) {
        pushCandle();
      }
      open = tsRecord.open;
      openDate = tsRecord.timestamp;
      resetAggregateCandlestick();
    }
    aggregateCandlestickHighLowVolume(tsRecord);
    previousClose = tsRecord.close;
    if (index === array.length - 1) {
      pushCandle();
    }
  });
  return res;
}

export function timeFrameAggregate(
  tsRecords: Query['timeFrameRecords'],
  timeFrameMode: TimeFrameMode,
  timeModeCount: number
) {
  if (!tsRecords) {
    return undefined;
  }
  switch (timeFrameMode) {
    case 'D':
      return intervalCalculation(tsRecords, timeModeCount, getDayOfYear);
    case 'W':
      return intervalCalculation(tsRecords, timeModeCount, getISOWeek);
  }
}
