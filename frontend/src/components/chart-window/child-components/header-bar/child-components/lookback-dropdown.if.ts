import {
  DAY,
  HOUR,
  MIN,
  MONTH,
  WEEK,
  YEAR,
} from 'src/pages/broker-charts/consts';

export const lookbackPeriodEnum = {
  '1minute': MIN,
  '1hour': HOUR,
  '1day': DAY,
  '1week': WEEK,
  '1month': MONTH,
  '1quarter': MONTH * 3,
  '1year': YEAR,
  '5year': YEAR * 5,
} as const;

export type LookbackPeriod = keyof typeof lookbackPeriodEnum;

const yearNameString = { singular: 'year', plural: 'years' };
export const lookbackPeriodStringEnum = {
  '1minute': { singular: 'minute', plural: 'minutes' },
  '1hour': { singular: 'hour', plural: 'hours' },
  '1day': { singular: 'day', plural: 'days' },
  '1week': { singular: 'week', plural: 'weeks' },
  '1month': { singular: 'month', plural: 'months' },
  '1quarter': { singular: 'quarter', plural: 'quarters' },
  '1year': yearNameString,
  '5year': yearNameString,
} as const;

export type LookbackPeriodString = keyof typeof lookbackPeriodStringEnum;
