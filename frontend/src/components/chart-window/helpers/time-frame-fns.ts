import { DAY, HOUR, MIN, WEEK } from 'src/pages/broker-charts/consts';
import { TimeFrame } from '../child-components/header-bar/child-components/time-frame-dropdown.if';

export function getTimeFrameInMs(timeFrame: TimeFrame) {
  switch (timeFrame) {
    case 'M1':
      return MIN;
    case 'M5':
      return MIN * 5;
    case 'H1':
      return HOUR;
    case 'D1':
      return DAY;
    case 'W1':
      return WEEK;
  }
}
