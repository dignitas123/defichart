// TimeMode means case difference for time distances on the date axis
export enum TimeMode {
  M1,
  M5,
  M10,
  M15,
  M30,
  H1,
  H3,
  H6,
  H12,
  D1,
  W1,
  W2,
  MN1,
  MN6,
  Y1,
  Y2,
  Y3,
}

export enum TimeModePeriod {
  Minute,
  Hour,
  Day,
  Month,
  Year,
}

export interface Candle {
  x: number;
  wX: number;
  y: number;
  uwY: number;
  lwY: number;
  height: number;
  uwHeight: number;
  lwHeight: number;
  fillColor: string;
  wickFillColor: string;
}

export interface TimeDisplayProperties {
  mode: TimeMode;
  period: TimeModePeriod;
  minuteTimeDifferential: number;
}
