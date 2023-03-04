import { Ref } from 'vue';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';
import { useLanguageStore } from 'src/stores/language';
import {
  TimeDisplayProperties,
  TimeMode,
  TimeModePeriod,
} from './candlestick-chart.if';
import { format as dateFormat } from 'date-fns';
import { DatePositionEntry } from 'src/pages/broker-charts/broker-charts.if';

export function useDateFunctions(
  width: number | undefined,
  dates: Date[] | undefined,
  timeDisplayProps: Ref<TimeDisplayProperties | undefined>,
  xPositionCandlestick: Ref<number>,
  candleWidth: Ref<number>,
  datePositionEntries: Ref<DatePositionEntry[]>
) {
  const languageStore = useLanguageStore();

  function formatDate(date: Date, format: string) {
    return dateFormat(date, format, { locale: languageStore.language });
  }

  function addDateToDatePositionEntries(date: Date, index: number) {
    if (!timeDisplayProps.value) {
      return;
    }
    let formattedDate = '';
    let bold = false;
    let format = '';

    const minutes = date.getMinutes();
    const hours = date.getHours();

    if (timeDisplayProps.value.period === TimeModePeriod.Minute) {
      format = 'HH:mm';
      if (minutes === 0 && hours === 0) {
        format = 'dd.MM';
      }
      if (minutes % timeDisplayProps.value.timeDifferential === 0) {
        if (timeDisplayProps.value.mode === TimeMode.M5 && minutes % 15 === 0) {
          bold = true;
        } else if (
          timeDisplayProps.value.mode === TimeMode.M10 &&
          minutes % 30 === 0
        ) {
          bold = true;
        } else if (
          timeDisplayProps.value.mode === TimeMode.M15 &&
          minutes === 0
        ) {
          bold = true;
        } else if (
          timeDisplayProps.value.mode === TimeMode.M30 &&
          date.getHours() % 2 === 0 &&
          minutes === 0
        ) {
          bold = true;
        }
        formattedDate = formatDate(date, format);
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Hour) {
      format = 'HH:mm';
      if (minutes % 60 === 0) {
        if (hours === 0) {
          format = 'dd.MM';
          bold = true;
        }
        if (timeDisplayProps.value.mode === TimeMode.H1) {
          if (hours % 4 === 0) {
            bold = true;
          }
          formattedDate = formatDate(date, format);
        } else if (timeDisplayProps.value.mode === TimeMode.H3) {
          if (hours % 9 === 0) {
            bold = true;
          }
          if (hours % 3 === 0) {
            formattedDate = formatDate(date, format);
          }
        } else if (timeDisplayProps.value.mode === TimeMode.H6) {
          if (hours % 12 === 0) {
            bold = true;
          }
          if (hours % 6 === 0) {
            formattedDate = formatDate(date, format);
          }
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Day) {
      const days = date.getDate();
      format = 'dd.MM';
      if (days % timeDisplayProps.value.timeDifferential === 0) {
        if (timeDisplayProps.value.mode === TimeMode.W2) {
          if (days % 15 === 0 && days !== 30) {
            formattedDate = formatDate(date, format);
          }
        } else {
          formattedDate = formatDate(date, format);
        }
        if (days === 1) {
          format = 'MM';
          formattedDate = formatDate(date, format);
        }
        if (date.getMonth() === 1) {
          format = 'YYYY';
          formattedDate = formatDate(date, format);
          bold = true;
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Month) {
      const month = date.getMonth();
      format = 'MM';
      if (month % timeDisplayProps.value.timeDifferential === 0) {
        if (month === 1) {
          bold = true;
          format = 'YYYY';
        }
        formattedDate = formatDate(date, format);
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Year) {
      format = 'YYYY';
      if (date.getFullYear() % 10 === 0) {
        bold = true;
      }
      formattedDate = formatDate(date, format);
    }

    const xPosition = xPositionCandlestick.value + candleWidth.value / 2;
    if (!formattedDate) {
      datePositionEntries.value.push({
        index: index,
        x: xPosition,
        date: formatDate(date, format),
        bold: bold,
        show: false,
      });
      return;
    }

    datePositionEntries.value.push({
      index: index,
      x: xPosition,
      date: formattedDate,
      bold: bold,
      show: true,
    });
  }

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
    addDateToDatePositionEntries,
  };
}
