import { DAY, HOUR, MIN, WEEK } from 'src/pages/broker-charts/consts';

export const allowedTimeFramesEnum = {
  M1: MIN,
  M2: MIN * 2,
  M3: MIN * 3,
  M4: MIN * 4,
  M5: MIN * 5,
  M10: MIN * 10,
  M15: MIN * 15,
  M20: MIN * 20,
  M30: MIN * 30,
  H1: HOUR,
  H2: HOUR * 2,
  H3: HOUR * 3,
  H4: HOUR * 4,
  H6: HOUR * 6,
  H8: HOUR * 8,
  H12: HOUR * 12,
  D1: DAY,
  D2: DAY * 2,
  D3: DAY * 3,
  D4: DAY * 4,
  W1: WEEK,
  W2: WEEK * 2,
  W3: WEEK * 3,
  W4: WEEK * 4,
};

export const allowedTimeFrames = [
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
  'M10',
  'M15',
  'M20',
  'M30',
  'H1',
  'H2',
  'H3',
  'H4',
  'H6',
  'H8',
  'H12',
  'D1',
  'D2',
  'D3',
  'D4',
  'W1',
  'W2',
  'W3',
  'W4',
];

export type TimeFrame =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M10'
  | 'M15'
  | 'M20'
  | 'M30'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H6'
  | 'H8'
  | 'H12'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'W1'
  | 'W2'
  | 'W3'
  | 'W4';
