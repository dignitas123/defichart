import { DAY, HOUR, MIN, WEEK } from 'src/pages/broker-charts/consts';

export const allowedTimeFramesEnum = {
  M1: MIN,
  M5: MIN * 5,
  H1: HOUR,
  D1: DAY,
  W1: WEEK,
};

export const allowedTimeFrames = ['M1', 'M5', 'H1', 'D1', 'W1'];

export type TimeFrame = 'M1' | 'M5' | 'H1' | 'D1' | 'W1';
