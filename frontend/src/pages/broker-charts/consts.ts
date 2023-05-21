import { LookbackPeriod } from 'src/components/chart-window/child-components/header-bar/child-components/lookback-dropdown.if';
import { TimeFrame } from 'src/components/chart-window/child-components/header-bar/child-components/time-frame-dropdown.if';

export const DATA_TICKSIZE = 0.1;
export const GRID_LINES_TRANSPARENCY = 0.06;
export const DATE_BOX_WIDTH = 80;
export const HEADER_HEIGHT = 32;
export const PAGE_PADDING = 4;
export const CANDLE_WICK_THICKNESS = 1;
export const CANDLE_BULL_COLOR = 'green';
export const CANDLE_BEAR_COLOR = 'red';
export const CANDLE_BORDER = true;
export const CANDLE_BORDER_COLOR = 'black';
export const M5_TIMEFRAMES = ['M5', 'M10', 'M15', 'M20', 'M30'];
export const INITIAL_TIME_FRAME: TimeFrame = 'M15';
export const INITIAL_LOOKBACK_PERIOD: LookbackPeriod = '1year';
export const WANTED_PX_PER_CANDLE = 8;
export const MAX_CANDLES_LOAD = 200;

export const MIN = 1000 * 60;
export const HOUR = MIN * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 30;
export const YEAR = MONTH * 12;
