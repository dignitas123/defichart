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
}

export interface DatePositionEntry {
  index: number;
  x: number;
  date: string;
  bold: boolean;
  show: boolean;
}
