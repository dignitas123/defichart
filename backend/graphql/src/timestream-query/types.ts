export const MIN = 1000 * 60;
export const HOUR = MIN * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 30;
export const YEAR = MONTH * 12;

export interface TimeStreamRecord {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeFrame =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M10"
  | "M15"
  | "M20"
  | "M30"
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H6"
  | "H8"
  | "H12"
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "W1"
  | "W2"
  | "W3"
  | "W4";

  export type TimeFrameOnlyWeek =
  | "W1"
  | "W2"
  | "W3"
  | "W4";

export const timeFrameMapping = {
  M1: "1m",
  M2: "2m",
  M3: "3m",
  M4: "4m",
  M5: "5m",
  M10: "10m",
  M15: "15m",
  M20: "20m",
  M30: "30m",
  H1: "1h",
  H2: "2h",
  H3: "3h",
  H4: "4h",
  H6: "6h",
  H8: "8h",
  H12: "12h",
  D1: "1d",
  D2: "2d",
  D3: "3d",
  D4: "4d",
  W1: "1w",
  W2: "2w",
  W3: "3w",
  W4: "4w",
};
