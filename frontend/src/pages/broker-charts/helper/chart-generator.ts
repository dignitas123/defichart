import { nanoid } from 'nanoid';
import { Chart } from '../broker-charts.if';
import { INITIAL_LOOKBACK_PERIOD, INITIAL_TIME_FRAME } from '../consts';

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
  candlesShow: 30,
  selected: true,
  offset: 0,
  maxCandles: 200,
  timeFrame: INITIAL_TIME_FRAME,
  lookbackPeriod: INITIAL_LOOKBACK_PERIOD,
};

export function generateChartObject(
  options: Chart = defaultOptions
): Record<string, Chart> {
  const id = nanoid();
  return JSON.parse(`{ "${id}": ${JSON.stringify(options)} }`);
}
