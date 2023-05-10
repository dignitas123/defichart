import { DAY, HOUR, MIN, WEEK } from 'src/pages/broker-charts/consts';
import { TimeFrame } from './child-components/header-bar/child-components/time-frame-dropdown.if';

export function getTimeFrameInMs(timeFrame: TimeFrame) {
  switch (timeFrame) {
    case 'M1':
      return MIN;
    case 'M2':
      return MIN * 2;
    case 'M3':
      return MIN * 3;
    case 'M4':
      return MIN * 4;
    case 'M5':
      return MIN * 5;
    case 'M10':
      return MIN * 10;
    case 'M15':
      return MIN * 15;
    case 'M20':
      return MIN * 20;
    case 'M30':
      return MIN * 30;
    case 'H1':
      return HOUR;
    case 'H2':
      return HOUR * 2;
    case 'H3':
      return HOUR * 3;
    case 'H4':
      return HOUR * 4;
    case 'H6':
      return HOUR * 6;
    case 'D1':
      return DAY;
    case 'D2':
      return DAY * 2;
    case 'D3':
      return DAY * 3;
    case 'D4':
      return DAY * 4;
    case 'W1':
      return WEEK;
    case 'W2':
      return WEEK * 2;
    case 'W3':
      return WEEK * 3;
    case 'W4':
      return WEEK * 4;
  }
}
