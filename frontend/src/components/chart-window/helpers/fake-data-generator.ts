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
    if (timeModeCount === 3 && timeModeCount % 3 === 0) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours());
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 6 && timeModeCount % 6 === 0) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 6);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 8 && timeModeCount % 8 === 0) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 8);
      currentDate.setHours(increaseToHour);
    } else if (timeModeCount === 12 && timeModeCount % 12 === 0) {
      const increaseToHour = increaseToDivisibleByX(currentDate.getHours(), 12);
      currentDate.setHours(increaseToHour);
    } else if (currentDate.getHours() % 2 === 1) {
      currentDate.setHours(currentDate.getHours() + 1);
    }
  }
  for (let i = 0; i < LOAD_FAKE_DATA_AMOUNT; i++) {
    if (timeMode === 'M') {
      currentDate.setMinutes(currentDate.getMinutes() + timeModeCount);
    } else if (timeMode === 'H') {
      currentDate.setHours(currentDate.getHours() + timeModeCount);
      if (timeModeCount === 3 && timeModeCount % 3 === 0) {
        const increaseToHour = increaseToDivisibleByX(currentDate.getHours());
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 6 && timeModeCount % 6 === 0) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          6
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 8 && timeModeCount % 8 === 0) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          8
        );
        currentDate.setHours(increaseToHour);
      } else if (timeModeCount === 12 && timeModeCount % 12 === 0) {
        const increaseToHour = increaseToDivisibleByX(
          currentDate.getHours(),
          12
        );
        currentDate.setHours(increaseToHour);
      } else if (currentDate.getHours() % 2 === 1) {
        currentDate.setHours(currentDate.getHours() + 1);
      }
    } else if (timeMode === 'D') {
      currentDate.setDate(currentDate.getDate() + timeModeCount);
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
