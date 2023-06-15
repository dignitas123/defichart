<template>
  <svg :width="width" :height="height" class="d-block absolute">
    <line
      v-for="(priceY, i) in priceLines"
      :key="i"
      :x1="0"
      :y1="priceY"
      :x2="width"
      :y2="priceY"
      :stroke="`rgb(0, 0, 0, ${GRID_LINES_TRANSPARENCY})`"
    />
    <line
      v-for="(dateX, i) in dateLines"
      :key="i"
      :x1="dateX"
      :y1="0"
      :x2="dateX"
      :y2="height"
      :stroke="`rgb(0, 0, 0, ${GRID_LINES_TRANSPARENCY})`"
    />
  </svg>
  <svg :width="width" :height="height" class="d-block absolute">
    <CandleStick
      v-for="(candle, i) in candles"
      :key="i"
      :candle="candle"
      :candleWidth="candleWidth"
    />
  </svg>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { Candle, TimeDisplayProperties } from './candlestick-chart.if';
import { DatePosition, OHLC } from 'src/pages/broker-charts/broker-charts.if';
import {
  CANDLE_BEAR_COLOR,
  CANDLE_BORDER,
  CANDLE_BORDER_COLOR,
  CANDLE_BULL_COLOR,
  CANDLE_WICK_THICKNESS,
  GRID_LINES_TRANSPARENCY,
} from 'src/pages/broker-charts/consts';
import CandleStick from './child-components/candle-stick.vue';
import { useDateFunctions } from './candlestick-chart.cp';
import { TimeFrame } from '../header-bar/child-components/time-frame-dropdown.if';

const props = withDefaults(
  defineProps<{
    data?: OHLC[];
    dates?: Date[];
    candleCount: number;
    h2l?: number;
    high: number;
    low: number;
    height?: number;
    width?: number;
    priceLines?: number[];
    dateLines?: number[];
    timeFrame: TimeFrame;
    datePosition?: DatePosition;
    startingDistanceDifference?: number;
    candleWidth: number;
    candleDistance: number;
    offset: number;
    chartUpdateKey?: number;
  }>(),
  {
    priceLines: () => [],
    dateLines: () => [],
    startingDistanceDifference: 0,
    chartUpdateKey: 0,
  }
);

const emit = defineEmits<{
  (event: 'update:datePosition', datePosition: DatePosition | undefined): void;
  (event: 'update:candleWidth', width: number): void;
  (event: 'update:candleDistance', distance: number): void;
}>();

const datePosition = ref(props.datePosition);
const candleWidth = ref(props.candleWidth);
const candleDistance = ref(props.candleDistance);
const timeFrame = ref(props.timeFrame);
const dates = ref(props.dates);

watch(
  () => props.dates,
  () => {
    if (!props.dates) {
      return;
    }
    dates.value = props.dates;
  }
);

watch(
  () => props.timeFrame,
  () => {
    timeFrame.value = props.timeFrame;
  }
);

watch(datePosition, () => {
  emit('update:datePosition', datePosition.value);
});

watch(candleWidth, () => {
  emit('update:candleWidth', candleWidth.value);
});

watch(candleDistance, () => {
  emit('update:candleDistance', candleDistance.value);
});

const candles = ref<Candle[]>([]);

function calcCandleXDistance(cW: number) {
  const increase = CANDLE_BORDER ? 1 : 0;
  if (cW > 80) {
    return 20 + increase;
  } else if (cW > 40) {
    return 5 + increase;
  } else if (cW > 20) {
    return 4 + increase;
  } else if (cW > 16) {
    return 3 + increase;
  } else if (cW > 6.6) {
    return 2 + increase;
  } else if (cW > 3.8) {
    return 1 + increase;
  } else if (cW > 2.5) {
    return 0 + increase;
  }
  return 0;
}

const lastXPositionCandlestick = ref(0);
const xPositionCandlestick = ref(0);

const timeDisplayProps = ref<TimeDisplayProperties>();

const previousDate = ref<Date | undefined>(undefined);

function drawChart() {
  if (!props.width || !props.height || !props.dates || !props.data) {
    return;
  }
  candles.value = [];
  previousDate.value = getFirstPreviousDateFromTimeFrame(props.data[0].d);
  const candleWidthWithoutCandleDistance = props.width / props.candleCount;
  candleDistance.value = calcCandleXDistance(candleWidthWithoutCandleDistance);
  candleWidth.value =
    candleWidthWithoutCandleDistance -
    candleDistance.value -
    candleDistance.value / props.candleCount;
  const overCandles = props.candleCount - props.dates.length;

  const candleSumWidthPx =
    (candleWidth.value + candleDistance.value) *
    (props.candleCount - overCandles);

  timeDisplayProps.value = timeDisplayProperties(candleSumWidthPx);

  xPositionCandlestick.value =
    (props.startingDistanceDifference > 0
      ? props.startingDistanceDifference
      : 0) *
      (candleWidth.value + candleDistance.value) +
    candleDistance.value;

  if (datePosition.value) {
    datePosition.value.entries = [];
    datePosition.value.standardDateFormat = standardDateFormat.value;
  }

  props.data.forEach((ohlc) => {
    const candle = drawCandle(xPositionCandlestick.value, ohlc);
    if (candle) {
      candles.value.push(candle);
    }
    addDateToDatePositionEntries(
      ohlc.d,
      previousDate.value,
      xPositionCandlestick.value + candleWidth.value / 2
    );
    lastXPositionCandlestick.value = xPositionCandlestick.value;
    xPositionCandlestick.value += candleWidth.value + candleDistance.value;
    previousDate.value = ohlc.d;
  });

  // Check if a no-volume candle is outside of visible area
  const candleYMin = Math.max(...candles.value.map((candle) => candle.y));
  candles.value.forEach((candle, i) => {
    if (candle.y === candleYMin) {
      candles.value[i].y -= 2;
    }
  });
}

function drawCandle(
  x: number,
  ohlc: OHLC,
  bull_color: string = CANDLE_BULL_COLOR,
  bear_color: string = CANDLE_BEAR_COLOR,
  candle_border: boolean = CANDLE_BORDER,
  candle_border_color: string = CANDLE_BORDER_COLOR
) {
  if (
    !props.h2l ||
    !props.high ||
    !props.low ||
    !props.height ||
    !props.width
  ) {
    return;
  }
  const candle: Candle = {} as Candle;

  candle.x = x;
  const xStartingPoint = x + candleWidth.value / 2;
  const candleWickDistance = CANDLE_WICK_THICKNESS / 2;
  const xWickPoint = xStartingPoint - candleWickDistance;

  candle.wX = xWickPoint;

  const convert_to_scale = (val: number) => {
    if (!props.height || !props.high || !props.h2l) {
      return 0;
    }
    return props.height * ((props.high - val) / props.h2l);
  };

  const o = convert_to_scale(ohlc.c);
  const h = convert_to_scale(ohlc.l);
  const l = convert_to_scale(ohlc.h);
  const c = convert_to_scale(ohlc.o);

  candle.height = Math.abs(o - c);

  candle.uwY = l;

  if (c > o) {
    candle.fillColor = bull_color;
    candle.wickFillColor = candle_border ? candle_border_color : bull_color;
    candle.y = o;
    candle.uwHeight = o - l;
    candle.lwY = c;
    candle.lwHeight = h - c;
  } else {
    candle.fillColor = bear_color;
    candle.wickFillColor = candle_border ? candle_border_color : bear_color;
    candle.y = c;
    candle.uwHeight = c - l;
    candle.lwY = o;
    candle.lwHeight = h - o;
  }
  if (c === o) {
    candle.height = 1;
    if (candle_border) {
      candle.fillColor = candle_border_color;
    }
    // TODO: should be an option to make it transparent
    // if (ohlc.v === 0) {
    //   candle.fillColor = 'transparent';
    // }
  }
  return candle;
}

const {
  timeDisplayProperties,
  addDateToDatePositionEntries,
  standardDateFormat,
  getFirstPreviousDateFromTimeFrame,
} = useDateFunctions(
  props.width,
  dates,
  timeDisplayProps,
  datePosition,
  timeFrame
);

watch(
  [
    () => props.candleCount,
    () => props.width,
    () => props.height,
    () => props.offset,
    () => props.high,
    () => props.low,
    () => props.chartUpdateKey,
  ],
  () => {
    drawChart();
  }
);
</script>
