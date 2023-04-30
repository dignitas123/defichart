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

export type TimeFrame = "M1" | "M5" | "H1" | "D1" | "W1";
