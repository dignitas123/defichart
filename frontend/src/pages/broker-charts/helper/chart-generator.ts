import { nanoid } from 'nanoid';
import { Chart } from '../broker-charts.if';

export const defaultOptions: Chart = {
  symbol: 'btcusd',
  broker: 'perpetual',
  network: 'optimism',
  width: 500,
  height: 500,
  fullWidth: false,
  fullHeight: false,
};

export function generateChartObject(
  options: Chart = defaultOptions
): Record<string, Chart> {
  const id = nanoid();
  return JSON.parse(`{ "${id}": ${JSON.stringify(options)} }`);
}
