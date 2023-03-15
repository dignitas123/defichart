import { LookbackPeriod } from 'src/components/chart-window/child-components/header-bar/child-components/lookback-dropdown.if';
import { TimeFrame } from 'src/components/chart-window/child-components/header-bar/child-components/time-frame-dropdown.if';

export type Network = 'optimism';
export type Broker = 'perpetual' | 'gains';
export type AssetPair = 'btcusd' | 'ethusd';

export interface OHLC {
  d: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Chart {
  symbol: AssetPair;
  broker: Broker;
  network: Network;
  x: number;
  y: number;
  width: number;
  height: number;
  fullWidth: boolean;
  fullHeight: boolean;
  candlesShow: number;
  selected: boolean;
  offset: number;
  maxCandles: number;
  timeFrame: TimeFrame;
  lookbackPeriod: LookbackPeriod;
}

export interface DatePositionEntry {
  x: number;
  date: Date;
  dateFormat: string;
  bold: boolean;
}

export interface DatePosition {
  standardDateFormat: string;
  entries: DatePositionEntry[];
}
