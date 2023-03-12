import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { DATA_TICKSIZE } from 'src/pages/broker-charts/consts';
import { increaseToDivisibleByX } from 'src/shared/utils/modulo-functions';
import { TimeFrameMode } from '../chart-window.if';
import { roundToTicksize } from './digits';

const LOAD_FAKE_DATA_AMOUNT = 300;

export function generateData(
  timeMode: TimeFrameMode,
  timeModeCount: number
): OHLC[] {
  const data = [];
  let o = roundToTicksize(100, DATA_TICKSIZE);
  const date = new Date();
  let currentDate = new Date();
  if (timeMode === 'M') {
    currentDate = new Date(
      Math.round(date.getTime() / (1000 * 60 * timeModeCount)) *
        (1000 * 60 * timeModeCount)
    );
  } else if (timeMode === 'H') {
    currentDate = new Date(
      Math.round(date.getTime() / (1000 * 60 * 60 * timeModeCount)) *
        (1000 * 60 * 60 * timeModeCount)
    );
    if (timeModeCount === 2) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 2);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 3) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 3);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 4) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 4);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 6) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 6);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 8) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 8);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 12) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 12);
      currentDate.setHours(increaseToHour);
    }
  }
  for (let i = 0; i < LOAD_FAKE_DATA_AMOUNT; i++) {
    if (timeMode === 'M') {
      currentDate.setMinutes(currentDate.getMinutes() + timeModeCount);
    } else if (timeMode === 'H') {
      currentDate.setHours(currentDate.getHours() + timeModeCount);
      if (timeModeCount === 2) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          2
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 3) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          3
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 4) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          4
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 6) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          6
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 8) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          8
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 12) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          12
        );
        currentDate.setHours(increaseToHour);
      }
    } else if (timeMode === 'D') {
      currentDate.setDate(currentDate.getDate() + timeModeCount);
    } else if (timeMode === 'W') {
      currentDate.setDate(currentDate.getDate() + timeModeCount * 7);
    }
    const d = new Date(currentDate);
    const h = roundToTicksize(o + Math.random() * 5, DATA_TICKSIZE);
    let l = roundToTicksize(o - Math.random() * 5, DATA_TICKSIZE);
    let c = roundToTicksize(
      o + Math.random() * 5 - Math.random() * 5,
      DATA_TICKSIZE
    );
    const v = Math.random();
    if (l > c) {
      l = c;
    }
    if (c > h) {
      c = h;
    }
    data.push({ d, o, h, l, c, v });
    o = c;
  }
  return data;
}
