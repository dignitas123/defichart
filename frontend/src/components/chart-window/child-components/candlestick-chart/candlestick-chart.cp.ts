import { computed, Ref } from 'vue';
import {
  DATE_BOX_WIDTH,
  DAY,
  HOUR,
  MIN,
  MONTH,
  WEEK,
  YEAR,
} from 'src/pages/broker-charts/consts';
import {
  TimeDisplayProperties,
  TimeMode,
  TimeModePeriod,
} from './candlestick-chart.if';
import { DatePosition } from 'src/pages/broker-charts/broker-charts.if';
import { TimeFrame } from '../header-bar/child-components/time-frame-dropdown.if';

export function useDateFunctions(
  width: number | undefined,
  dates: Ref<Date[] | undefined>,
  timeDisplayProps: Ref<TimeDisplayProperties | undefined>,
  datePosition: Ref<DatePosition | undefined>,
  timeFrame: Ref<TimeFrame>
) {
  const timeFrameModeChar = computed(() => {
    return timeFrame.value.charAt(0);
  });

  function getFirstPreviousDateFromTimeFrame(firstDate: Date) {
    if (!timeFrame.value) {
      return undefined;
    }
    const newestDate = new Date(firstDate);
    switch (timeFrame.value) {
      case 'M1':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 1));
      case 'M2':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 2));
      case 'M3':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 3));
      case 'M4':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 4));
      case 'M5':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 5));
      case 'M10':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 10));
      case 'M15':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 15));
      case 'M20':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 20));
      case 'M30':
        return new Date(newestDate.setMinutes(newestDate.getMinutes() - 30));
      case 'H1':
        return new Date(newestDate.setHours(newestDate.getHours() - 1));
      case 'H2':
        return new Date(newestDate.setHours(newestDate.getHours() - 2));
      case 'H3':
        return new Date(newestDate.setHours(newestDate.getHours() - 3));
      case 'H4':
        return new Date(newestDate.setHours(newestDate.getHours() - 4));
      case 'H6':
        return new Date(newestDate.setHours(newestDate.getHours() - 6));
      case 'H8':
        return new Date(newestDate.setHours(newestDate.getHours() - 8));
      case 'H12':
        return new Date(newestDate.setHours(newestDate.getHours() - 12));
      case 'D1':
        return new Date(newestDate.setDate(newestDate.getDate() - 1));
      case 'D2':
        return new Date(newestDate.setDate(newestDate.getDate() - 2));
      case 'D3':
        return new Date(newestDate.setDate(newestDate.getDate() - 3));
      case 'D4':
        return new Date(newestDate.setDate(newestDate.getDate() - 4));
      case 'W1':
        return new Date(newestDate.setDate(newestDate.getDate() - 7));
      case 'W2':
        return new Date(newestDate.setDate(newestDate.getDate() - 7 * 2));
      case 'W3':
        return new Date(newestDate.setDate(newestDate.getDate() - 7 * 3));
      case 'W4':
        return new Date(newestDate.setDate(newestDate.getDate() - 7 * 4));
    }
  }

  function addDateToDatePositionEntries(
    date: Date,
    previousDate: Date | undefined,
    xPosition: number
  ) {
    if (!timeDisplayProps.value) {
      return;
    }
    let showEntryDateFormat = '';
    let bold = false;

    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const month = date.getMonth();

    if (timeDisplayProps.value.period === TimeModePeriod.Minute) {
      if (minutes % timeDisplayProps.value.minuteTimeDifferential === 0) {
        showEntryDateFormat = 'HH:mm';
        if (minutes === 0 && hours === 0) {
          showEntryDateFormat = 'dd.MM';
          bold = true;
          if (days === 1) {
            showEntryDateFormat = 'MMM';
            if (month === 0) {
              showEntryDateFormat = 'YYY';
            }
          }
        } else if (timeDisplayProps.value.mode === TimeMode.M1) {
          if (timeFrame.value === 'M2') {
            if (minutes === 0) {
              bold = true;
            } else if (minutes % 5 !== 0) {
              showEntryDateFormat = '';
            }
          } else {
            if (minutes % 10 === 0) {
              bold = true;
            } else if (minutes % 5 !== 0) {
              showEntryDateFormat = '';
            }
          }
        } else if (timeDisplayProps.value.mode === TimeMode.M5) {
          if (timeFrame.value === 'M5') {
            if (minutes === 0) {
              bold = true;
            } else if (minutes % 15 !== 0) {
              showEntryDateFormat = '';
            }
          } else if (minutes % 15 === 0 && timeFrame.value !== 'M3') {
            bold = true;
          }
        } else if (
          timeDisplayProps.value.mode === TimeMode.M10 &&
          minutes % 30 === 0
        ) {
          if (timeFrame.value === 'M10') {
            if (minutes === 0) {
              bold = true;
            } else if (minutes % 30 !== 0) {
              showEntryDateFormat = '';
            }
          } else if (minutes % 30 === 0) {
            bold = true;
          }
        } else if (timeDisplayProps.value.mode === TimeMode.M30) {
          if (minutes === 30) {
            showEntryDateFormat = '';
          }
        }
      }
    } else if (timeDisplayProps.value.period === TimeModePeriod.Hour) {
      let yearTransition = false;
      let monthTransition = false;
      if (previousDate) {
        const prevDateMonth = previousDate.getMonth();
        if (prevDateMonth === 11 && month === 0) {
          yearTransition = true;
        } else if (prevDateMonth < month) {
          monthTransition = true;
        }
      }
      if (timeFrameModeChar.value === 'M') {
        if (monthTransition) {
          bold = true;
          showEntryDateFormat = 'MMM';
        } else if (yearTransition) {
          bold = true;
          showEntryDateFormat = 'YYY';
        } else if (hours === 0 && minutes === 0) {
          bold = true;
          showEntryDateFormat = 'dd.MM';
        } else if (timeDisplayProps.value.mode === TimeMode.H6) {
          if (hours % 6 === 0 && minutes === 0) {
            showEntryDateFormat = 'HH:mm';
          }
        } else if (timeDisplayProps.value.mode === TimeMode.H12) {
          if (hours % 12 === 0 && minutes === 0) {
            showEntryDateFormat = 'HH:mm';
          }
        } else if (hours % 2 === 0 && minutes === 0) {
          showEntryDateFormat = 'HH:mm';
          if(hours % 4 === 0) {
            bold = true;
          }
        }
      } else if (timeFrameModeChar.value === 'D') {
        showEntryDateFormat = 'dd.MM';
      } else {
        if (monthTransition) {
          bold = true;
          showEntryDateFormat = 'MMM';
        } else if (yearTransition) {
          bold = true;
          showEntryDateFormat = 'YYY';
        } else if (hours === 0) {
          showEntryDateFormat = 'dd.MM';
          if (timeFrame.value !== 'H8' && timeFrame.value !== 'H12') {
            bold = true;
          }
        } else if (minutes % 60 === 0) {
          if (timeDisplayProps.value.mode === TimeMode.H1 && hours % 4 === 0) {
            showEntryDateFormat = 'HH:mm';
          } else if (
            timeDisplayProps.value.mode === TimeMode.H3 &&
            hours % 6 === 0
          ) {
            showEntryDateFormat = 'HH:mm';
          } else if (timeDisplayProps.value.mode === TimeMode.H6) {
            if (days % 2 === 0 && hours === 0) {
              bold = true;
            }
            if (hours % 12 === 0) {
              showEntryDateFormat = 'HH:mm';
            }
          } else if (timeDisplayProps.value.mode === TimeMode.H12) {
            if (days % 4 === 0 && hours === 0) {
              bold = true;
            }
            if (timeFrame.value === 'H12') {
              if (days % 2 === 0 && hours === 0) {
                showEntryDateFormat = 'HH:mm';
              }
            } else if (hours % 12 === 0) {
              showEntryDateFormat = 'HH:mm';
            }
          }
        }
      }
    } else if (timeDisplayProps.value.period >= TimeModePeriod.Day) {
      let yearTransition = false;
      let monthTransition = false;
      let halfMonthTransition = false;
      if (previousDate) {
        const prevDateMonth = previousDate.getMonth();
        if (prevDateMonth === 11 && month === 0) {
          yearTransition = true;
        } else if (prevDateMonth < month) {
          monthTransition = true;
        } else if (previousDate.getDate() < 15 && days >= 15) {
          halfMonthTransition = true;
        }
      }
      if (timeDisplayProps.value.period === TimeModePeriod.Day) {
        if (timeFrameModeChar.value === 'D') {
          if (
            timeDisplayProps.value.mode === TimeMode.W1 ||
            timeDisplayProps.value.mode === TimeMode.D1
          ) {
            if (yearTransition) {
              bold = true;
              showEntryDateFormat = 'YYY';
            } else if (monthTransition) {
              bold = true;
              showEntryDateFormat = 'MMM';
            } else if (days % 5 === 0 && days !== 30) {
              showEntryDateFormat = 'd';
            }
          } else if (timeDisplayProps.value.mode === TimeMode.W2) {
            if (yearTransition) {
              bold = true;
              showEntryDateFormat = 'YYY';
            } else if (monthTransition) {
              bold = true;
              showEntryDateFormat = 'MMM';
            } else if (halfMonthTransition) {
              showEntryDateFormat = 'd';
            }
          }
        } else if (timeFrameModeChar.value === 'W') {
          if (monthTransition) {
            showEntryDateFormat = 'MMM';
          } else if (yearTransition) {
            bold = true;
            showEntryDateFormat = 'YYY';
          }
        } else {
          if (monthTransition) {
            bold = true;
            showEntryDateFormat = 'MMM';
          } else if (yearTransition) {
            bold = true;
            showEntryDateFormat = 'YYY';
          }
          if (timeDisplayProps.value.mode === TimeMode.W1) {
            if (hours === 0 && days % 4 === 0) {
              showEntryDateFormat = 'dd.MM';
            }
          } else if (timeDisplayProps.value.mode === TimeMode.W2) {
            if (halfMonthTransition) {
              showEntryDateFormat = 'dd.MM';
            }
          } else if (hours === 0 && (!monthTransition || yearTransition)) {
            showEntryDateFormat = 'dd.MM';
          }
        }
      } else if (timeDisplayProps.value.period === TimeModePeriod.Month) {
        if (yearTransition) {
          bold = true;
          showEntryDateFormat = 'YYY';
        } else {
          if (monthTransition) {
            if (timeFrame.value !== 'D1') {
              if ([3, 6, 9].includes(month)) {
                showEntryDateFormat = 'MMM';
              }
            } else {
              showEntryDateFormat = 'MMM';
            }
          }
        }
      } else if (timeDisplayProps.value.period === TimeModePeriod.Year) {
        if (yearTransition) {
          showEntryDateFormat = 'YYY';
          if (date.getFullYear() % 5 === 0) {
            bold = true;
          }
        }
        if (
          timeDisplayProps.value.mode !== TimeMode.Y1 &&
          timeDisplayProps.value.mode !== TimeMode.Y3
        ) {
          if (month === 6 && monthTransition) {
            showEntryDateFormat = 'MMM';
          }
        }
      }
    }

    datePosition.value?.entries.push({
      x: xPosition,
      date: date,
      dateFormat: showEntryDateFormat,
      bold: bold,
    });
  }

  function timeDisplayProperties(candleSumWidthPx: number) {
    let mode = TimeMode.Y3;
    let period = TimeModePeriod.Year;
    let minuteTimeDifferential = 5;
    if (!width || !dates.value) {
      return {
        mode: mode,
        period: period,
        minuteTimeDifferential: minuteTimeDifferential,
      };
    }

    // difference in ms from beginning to end of time in the chart
    const diff =
      dates.value[dates.value.length - 1].getTime() - dates.value[0].getTime();

    // This is the time difference, that fits in one time display 'timeDifferenceDisplayBox'
    const tDifDB = diff * (DATE_BOX_WIDTH / candleSumWidthPx);

    if (tDifDB < 3 * MIN) {
      mode = TimeMode.M1;
      minuteTimeDifferential = 1;
    } else if (tDifDB < 6 * MIN) {
      mode = TimeMode.M5;
      minuteTimeDifferential = 5;
    } else if (tDifDB < 10 * MIN) {
      mode = TimeMode.M10;
      if (timeFrame.value === 'M2') {
        minuteTimeDifferential = 10;
      } else {
        minuteTimeDifferential = 15;
      }
    } else if (tDifDB < 16 * MIN) {
      mode = TimeMode.M15;
      minuteTimeDifferential = 20;
    } else if (tDifDB < 30 * MIN) {
      mode = TimeMode.M30;
      minuteTimeDifferential = 30;
    } else if (tDifDB < 66 * MIN) {
      mode = TimeMode.H1;
    } else if (tDifDB < 160 * MIN) {
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
    } else if (tDifDB < 4.9 * WEEK) {
      mode = TimeMode.MN1;
    } else if (tDifDB < 2 * MONTH) {
      mode = TimeMode.MN6;
    } else if (tDifDB < 0.18 * YEAR) {
      mode = TimeMode.Y1;
    } else if (tDifDB < 0.5 * YEAR) {
      mode = TimeMode.Y2;
    } else {
      mode = TimeMode.Y3;
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
    } else if (timeFrameModeChar.value === 'W') {
      return 'MMM d EEE, YYY';
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
    getFirstPreviousDateFromTimeFrame,
  };
}
