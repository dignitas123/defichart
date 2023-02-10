import { OHLC } from 'src/pages/broker-charts/broker-charts.if';

export function generateData(): OHLC[] {
  const data = [];
  let o = 100;
  const roundedMinutes = 5;
  const date = new Date();
  const currentDate = new Date(
    Math.round(date.getTime() / (1000 * 60 * roundedMinutes)) *
      (1000 * 60 * roundedMinutes)
  );
  for (let i = 0; i < 200; i++) {
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    const d = new Date(currentDate);
    const h = o + Math.random() * 5;
    let l = o - Math.random() * 5;
    let c = o + Math.random() * 5 - Math.random() * 5;
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
