import { DAY, MONTH, WEEK, YEAR } from 'src/pages/broker-charts/consts';

export const lookbackPeriodEnum = {
  '1day': DAY,
  '1week': WEEK,
  '1month': MONTH,
  '1quarter': MONTH * 3,
  '1year': YEAR,
  '5year': YEAR * 5,
} as const;

export type LookbackPeriod = keyof typeof lookbackPeriodEnum;
