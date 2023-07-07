import { DAY, HOUR, MIN, SECOND } from 'src/pages/broker-charts/consts';
import { TabSwitch } from 'src/stores/atomic-time';
import { ComputedRef } from 'vue';
import { TimeFrameMode } from './chart-window.if';

export function useGetMissingCandles(
  timeFrameInMs: ComputedRef<number | undefined>,
  timeFrameMode: ComputedRef<TimeFrameMode>
) {
  function getMissingCandles(tabSwitch: TabSwitch) {
    if (!timeFrameInMs.value) {
      return;
    }
    let missingCandles =
      1 + Math.floor(tabSwitch.timeDiff / timeFrameInMs.value);
    switch (timeFrameMode.value) {
      case 'M':
        const missingSecondsToOneMinute = 60 - tabSwitch.startTime.getSeconds();
        missingCandles +=
          tabSwitch.timeDiff / SECOND - missingSecondsToOneMinute > 0 ? 1 : 0;
        break;
      case 'H':
        const missingMinutesToOneHour = 60 - tabSwitch.startTime.getMinutes();
        missingCandles +=
          tabSwitch.timeDiff / MIN - missingMinutesToOneHour > 0 ? 1 : 0;
        break;
      case 'D':
        const missingHoursToOneDay = 24 - tabSwitch.startTime.getHours();
        missingCandles +=
          tabSwitch.timeDiff / HOUR - missingHoursToOneDay > 0 ? 1 : 0;
        break;
      case 'W':
        const missingDaysToOneWeek = 7 - tabSwitch.startTime.getDate();
        missingCandles +=
          tabSwitch.timeDiff / DAY - missingDaysToOneWeek > 0 ? 1 : 0;
        break;
    }
    return missingCandles;
  }
  return {
    getMissingCandles,
  };
}
