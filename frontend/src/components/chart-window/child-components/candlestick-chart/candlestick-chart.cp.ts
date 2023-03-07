import { computed, Ref } from 'vue';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';
import {
  TimeDisplayProperties,
  TimeMode,
  TimeModePeriod,
} from './candlestick-chart.if';
import { DatePosition } from 'src/pages/broker-charts/broker-charts.if';
import { TimeFrame } from '../header-bar/child-components/time-frame-dropdown.if';

export function useDateFunctions(
  width: number | undefined,
  dates: Date[] | undefined,
  timeDisplayProps: Ref<TimeDisplayProperties | undefined>,
  datePosition: Ref<DatePosition | undefined>,
  timeFrame: TimeFrame
) {
  const timeFrameModeChar = computed(() => {
    return timeFrame.charAt(0);
  });

  function addDateToDatePositionEntries(date: Date, xPosition: number) {
    if (!timeDisplayProps.value) {
      return;
    }
    let showEntryDateFormat = '';
    let bold = false;

    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();

    if (timeDisplayProps.value.period === TimeModePeriod.Minute) {
      if (minutes === 0 && hours === 0) {
        showEntryDateFormat = 'dd.MM';
      }
      if (minutes % timeDisplayProps.value.minuteTimeDifferential === 0) {
        let noShowEntryDateFormat = false;
        if (timeDisplayProps.value.mode === TimeMode.M1) {
          if (minutes % 10 === 0) {
            bold = true;
          } else if (minutes % 5 !== 0) {
            noShowEntryDateFormat = true;
          }
        } else if (
          timeDisplayProps.value.mode === TimeMode.M5 &&
          minutes % 15 === 0
        ) {
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
        if (!noShowEntryDateFormat) {
          showEntryDateFormat = 'HH:mm';
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Hour) {
      if (timeFrameModeChar.value === 'D') {
        showEntryDateFormat = 'dd.MM';
      } else if (minutes % 60 === 0) {
        if (hours === 0) {
          showEntryDateFormat = 'dd.MM';
          bold = true;
        } else {
          if (timeDisplayProps.value.mode === TimeMode.H1) {
            if (hours % 4 === 0) {
              bold = true;
            }
            showEntryDateFormat = 'HH:mm';
          } else if (timeDisplayProps.value.mode === TimeMode.H3) {
            if (hours % 9 === 0) {
              bold = true;
            }
            if (hours % 3 === 0) {
              showEntryDateFormat = 'HH:mm';
            }
          } else if (timeDisplayProps.value.mode === TimeMode.H6) {
            if (hours % 12 === 0) {
              bold = true;
            }
            if (hours % 6 === 0) {
              showEntryDateFormat = 'HH:mm';
            }
          } else if (timeDisplayProps.value.mode === TimeMode.H12) {
            if (hours % 24 === 0) {
              bold = true;
            }
            if (hours % 12 === 0) {
              showEntryDateFormat = 'HH:mm';
            }
          }
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Day) {
      const month = date.getMonth();
      if (timeFrameModeChar.value === 'D') {
        if (timeDisplayProps.value.mode === TimeMode.W1) {
          if (month === 0 && days === 1) {
            bold = true;
            showEntryDateFormat = 'YYY';
          } else if (days === 1) {
            bold = true;
            showEntryDateFormat = 'MMM';
          } else if (days % 5 === 0 && days !== 30) {
            showEntryDateFormat = 'd';
          }
        } else if (timeDisplayProps.value.mode === TimeMode.W2) {
          if (month === 0 && days === 1) {
            bold = true;
            showEntryDateFormat = 'YYY';
          } else if (days === 1) {
            bold = true;
            showEntryDateFormat = 'MMM';
          } else if (days === 15) {
            showEntryDateFormat = 'd';
          }
        }
      } else {
        if (timeDisplayProps.value.mode === TimeMode.W1) {
          if (hours === 0 && days % 4 === 0) {
            showEntryDateFormat = 'dd.MM';
          }
          if (days === 1 && hours === 0) {
            showEntryDateFormat = 'MMM';
            bold = true;
            if (month === 0) {
              showEntryDateFormat = 'YYYY';
            }
          }
        } else if (timeDisplayProps.value.mode === TimeMode.W2) {
          if (hours === 0 && days === 15) {
            showEntryDateFormat = 'dd.MM';
          }
          if (days === 1 && hours === 0) {
            showEntryDateFormat = 'MMM';
            bold = true;
            if (month === 0) {
              showEntryDateFormat = 'YYYY';
            }
          }
        } else {
          if (hours === 0) {
            showEntryDateFormat = 'dd.MM';
          }
          if (days === 1 && hours === 0) {
            showEntryDateFormat = 'MMM';
            bold = true;
            if (month === 0) {
              showEntryDateFormat = 'YYYY';
            }
          }
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Month) {
      const month = date.getMonth();
      if (month === 0 && days === 1) {
        bold = true;
        showEntryDateFormat = 'YYY';
      } else if (days === 1) {
        showEntryDateFormat = 'MMM';
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Year) {
      if (date.getFullYear() % 10 === 0) {
        bold = true;
      }
      showEntryDateFormat = 'YYYY';
    }

    datePosition.value?.entries.push({
      x: xPosition,
      date: date,
      dateFormat: showEntryDateFormat,
      bold: bold,
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
    let minuteTimeDifferential = 5;
    if (!width || !dates) {
      return {
        mode: mode,
        period: period,
        minuteTimeDifferential: minuteTimeDifferential,
      };
    }

    const diff = dates[dates.length - 1].getTime() - dates[0].getTime();

    // This is the time difference, that fits in one time display
    const tDifDB = diff * (DATE_BOX_WIDTH / candleSumWidthPx);

    if (tDifDB < 3 * MIN) {
      mode = TimeMode.M1;
      minuteTimeDifferential = 1;
    } else if (tDifDB < 6 * MIN) {
      mode = TimeMode.M5;
      minuteTimeDifferential = 5;
    } else if (tDifDB < 10 * MIN) {
      mode = TimeMode.M10;
      minuteTimeDifferential = 10;
    } else if (tDifDB < 16 * MIN) {
      mode = TimeMode.M15;
      minuteTimeDifferential = 15;
    } else if (tDifDB < 20 * MIN) {
      mode = TimeMode.M30;
      minuteTimeDifferential = 30;
    } else if (tDifDB < 66 * MIN) {
      mode = TimeMode.H1;
    } else if (tDifDB < 190 * MIN) {
      mode = TimeMode.H3;
    } else if (tDifDB < 6 * HOUR) {
      mode = TimeMode.H6;
    } else if (tDifDB < 12 * HOUR) {
      mode = TimeMode.H12;
    } else if (tDifDB < 1.25 * DAY) {
      mode = TimeMode.D1;
    } else if (tDifDB < 4.8 * DAY) {
      mode = TimeMode.W1;
    } else if (tDifDB < 13 * DAY) {
      mode = TimeMode.W2;
    } else if (tDifDB < 15 * WEEK) {
      mode = TimeMode.MN1;
    } else if (tDifDB < 5 * MONTH) {
      mode = TimeMode.MN6;
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
      minuteTimeDifferential: minuteTimeDifferential,
    };
  }

  const standardDateFormat = computed(() => {
    const fallBackFormat = 'HH:mm';
    if (!timeDisplayProps.value) {
      return fallBackFormat;
    }
    if (timeFrameModeChar.value === 'D') {
      return 'd EEE, YYY';
    } else if (
      timeDisplayProps.value.period === TimeModePeriod.Minute ||
      timeDisplayProps.value.period === TimeModePeriod.Hour
    ) {
      return 'HH:mm';
    } else if (timeDisplayProps.value.period === TimeModePeriod.Day) {
      return 'd EEE, HH:mm';
    }
    return fallBackFormat;
  });

  return {
    timeDisplayProperties,
    addDateToDatePositionEntries,
    standardDateFormat,
  };
}
