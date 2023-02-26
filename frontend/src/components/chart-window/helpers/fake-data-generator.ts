import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { DATA_TICKSIZE } from 'src/pages/broker-charts/consts';
import { roundToTicksize } from './digits';

export function generateData(): OHLC[] {
  const data = [];
  let o = roundToTicksize(100, DATA_TICKSIZE);
  const roundedMinutes = 5;
  const date = new Date();
  const currentDate = new Date(
    Math.round(date.getTime() / (1000 * 60 * roundedMinutes)) *
      (1000 * 60 * roundedMinutes)
  );
  for (let i = 0; i < 200; i++) {
    currentDate.setMinutes(currentDate.getMinutes() + 5);
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
