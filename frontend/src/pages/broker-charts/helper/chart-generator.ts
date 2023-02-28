import { nanoid } from 'nanoid';
import { Chart } from '../broker-charts.if';

export const defaultOptions: Chart = {
  symbol: 'btcusd',
  broker: 'perpetual',
  network: 'optimism',
  x: 0,
  y: 0,
  width: 500,
  height: 500,
  fullWidth: true,
  fullHeight: true,
  candlesShow: 40,
  selected: true,
  offset: 0,
  maxCandles: 200,
};

export function generateChartObject(
  options: Chart = defaultOptions
): Record<string, Chart> {
  const id = nanoid();
  return JSON.parse(`{ "${id}": ${JSON.stringify(options)} }`);
}
