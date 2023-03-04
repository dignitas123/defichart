import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';
import { TimeMode, TimeModePeriod } from './candlestick-chart.if';

export function useTimeDisplay(
  width: number | undefined,
  dates: Date[] | undefined
) {
  const MIN = 1000 * 60;
  const HOUR = MIN * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;

  function timeDisplayProperties(candleSumWidthPx: number) {
    let mode = TimeMode.Y1;
    let period = TimeModePeriod.Year;
    let timeDifferential = 1;
    if (!width || !dates) {
      return {
        mode: mode,
        period: period,
        timeDifferential: timeDifferential,
      };
    }

    const diff = dates[dates.length - 1].getTime() - dates[0].getTime();

    // This is the time difference, that fits in one time display
    const tDifDB = diff * (DATE_BOX_WIDTH / candleSumWidthPx);

    if (tDifDB < 3 * MIN) {
      mode = TimeMode.M1;
      timeDifferential = 1;
    } else if (tDifDB < 6 * MIN) {
      mode = TimeMode.M5;
      timeDifferential = 5;
    } else if (tDifDB < 10 * MIN) {
      mode = TimeMode.M10;
      timeDifferential = 10;
    } else if (tDifDB < 16 * MIN) {
      mode = TimeMode.M15;
      timeDifferential = 15;
    } else if (tDifDB < 20 * MIN) {
      mode = TimeMode.M30;
      timeDifferential = 30;
    } else if (tDifDB < 66 * MIN) {
      mode = TimeMode.H1;
      timeDifferential = 1;
    } else if (tDifDB < 190 * MIN) {
      mode = TimeMode.H3;
      timeDifferential = 2;
    } else if (tDifDB < 6 * HOUR) {
      mode = TimeMode.H6;
      timeDifferential = 6;
    } else if (tDifDB < 12 * HOUR) {
      mode = TimeMode.H12;
      timeDifferential = 12;
    } else if (tDifDB < 3 * DAY) {
      mode = TimeMode.D1;
      timeDifferential = 1;
    } else if (tDifDB < 8 * DAY) {
      mode = TimeMode.W1;
      timeDifferential = 7;
    } else if (tDifDB < 13 * DAY) {
      mode = TimeMode.W2;
      timeDifferential = 15;
    } else if (tDifDB < 15 * WEEK) {
      mode = TimeMode.MN1;
      timeDifferential = 1;
    } else if (tDifDB < 5 * MONTH) {
      mode = TimeMode.MN6;
      timeDifferential = 6;
    }

    if (
      [
        TimeMode.M1,
        TimeMode.M5,
        TimeMode.M10,
        TimeMode.M15,
        TimeMode.M30,
      ].includes(mode)
    ) {
      period = TimeModePeriod.Minute;
    } else if (
      [TimeMode.H1, TimeMode.H3, TimeMode.H6, TimeMode.H12].includes(mode)
    ) {
      period = TimeModePeriod.Hour;
    } else if ([TimeMode.D1, TimeMode.W1, TimeMode.W2].includes(mode)) {
      period = TimeModePeriod.Day;
    } else if ([TimeMode.MN1, TimeMode.MN6].includes(mode)) {
      period = TimeModePeriod.Month;
    }

    return {
      mode: mode,
      period: period,
      timeDifferential: timeDifferential,
    };
  }

  return {
    timeDisplayProperties,
  };
}
