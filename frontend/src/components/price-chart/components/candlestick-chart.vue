<template>
  <svg :width="width" :height="height" style="display: block">
    <g v-for="(candle, i) in candles" :key="i">
      <rect
        :x="candle.wX"
        :y="candle.uwY"
        :width="candleWickWidth"
        :height="candle.uwHeight"
        :style="`fill: ${candle.fillColor}`"
        class="test"
      />
      <rect
        :x="candle.x"
        :y="candle.y"
        :width="candleWidth"
        :height="candle.height"
        :style="`fill: ${candle.fillColor}`"
      />
      <rect
        :x="candle.wX"
        :y="candle.lwY"
        :width="candleWickWidth"
        :height="candle.lwHeight"
        :style="`fill: ${candle.fillColor}`"
      />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { PriceSeries } from '../price-chart.model';

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: number;
    data: PriceSeries[];
  }>(),
  {
    data: () => [],
  }
);

interface Candle {
  x: number;
  wX: number;
  y: number;
  uwY: number;
  lwY: number;
  height: number;
  uwHeight: number;
  lwHeight: number;
  fillColor: string;
}

const MAX_CANDLES_SHOW = 40;
const CANDLE_DISTANCE = 3; // in px
const CANDLE_WICK_THICKNESS = 0.15; // in percent

const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
// const CANDLE_BORDER_COLOR = 'black';

const data_max_candles_show = ref(props.data.slice(-MAX_CANDLES_SHOW));

const starting_distance_difference = MAX_CANDLES_SHOW - props.data.length;

const candles = ref<Candle[]>([]);

const maxCandleHigh = computed(() => {
  if (data_max_candles_show.value.length) {
    return Math.max(
      ...data_max_candles_show.value.map((ohlc) => Number(ohlc.h))
    );
  }
  return undefined;
});

const maxCandleLow = computed(() => {
  if (data_max_candles_show.value.length) {
    return Math.min(
      ...data_max_candles_show.value.map((ohlc) => Number(ohlc.l))
    );
  } else {
    return undefined;
  }
});

const candleH2L = computed(() => {
  if (
    maxCandleHigh.value &&
    maxCandleLow.value &&
    maxCandleHigh.value > maxCandleLow.value
  ) {
    return maxCandleHigh.value - maxCandleLow.value;
  } else {
    return undefined;
  }
});

const candleWidth = computed(() => {
  if (props.width) {
    return (
      props.width / MAX_CANDLES_SHOW -
      CANDLE_DISTANCE -
      CANDLE_DISTANCE / MAX_CANDLES_SHOW
    );
  }
  return 0;
});

const candleWickWidth = computed(() => {
  if (candleWidth.value) {
    return candleWidth.value * CANDLE_WICK_THICKNESS;
  }
  return undefined;
});

function drawChart() {
  if (!props.width || !props.height) {
    return;
  }
  candles.value = [];

  let xPositionCandlestick =
    (starting_distance_difference > 0 ? starting_distance_difference : 0) *
      (candleWidth.value + CANDLE_DISTANCE) +
    CANDLE_DISTANCE;

  data_max_candles_show.value.forEach((ohlc) => {
    drawCandle(xPositionCandlestick, ohlc, candleWidth.value);
    xPositionCandlestick += candleWidth.value + CANDLE_DISTANCE;
  });

  function drawCandle(
    x: number,
    ohlc: PriceSeries,
    width: number,
    bull_color: string = CANDLE_BULL_COLOR,
    bear_color: string = CANDLE_BEAR_COLOR,
    candle_border: boolean = CANDLE_BORDER
    // candle_border_color: string = CANDLE_BORDER_COLOR
  ) {
    if (
      !candleH2L.value ||
      !maxCandleHigh.value ||
      !props.height ||
      !props.width ||
      !candleWickWidth.value ||
      !maxCandleLow.value
    ) {
      return;
    }
    const candle: Candle = {} as Candle;

    candle.x = x;
    const xStartingPoint = x + width / 2;
    const candleWickDistance = candleWickWidth.value / 2;
    const xWickPoint = xStartingPoint - candleWickDistance;

    candle.wX = xWickPoint;

    const convert_to_scale = (val: number) => {
      if (props.height && maxCandleHigh.value && candleH2L.value)
        return props.height * ((maxCandleHigh.value - val) / candleH2L.value);
    };

    const o = convert_to_scale(ohlc.c) ?? 0;
    const h = convert_to_scale(ohlc.l) ?? 0;
    const l = convert_to_scale(ohlc.h) ?? 0;
    const c = convert_to_scale(ohlc.o) ?? 0;

    candle.height = Math.abs(o - c);

    candle.uwY = l;
    if (c > o) {
      candle.y = o;
      candle.fillColor = bull_color;
      candle.uwHeight = o - l + 1;
      candle.lwY = c - 1;
      candle.lwHeight = h - c + 1;
    } else {
      candle.y = c;
      candle.fillColor = bear_color;
      candle.uwHeight = c - l + 1;
      candle.lwY = o - 1;
      candle.lwHeight = h - o + 1;
    }
    candles.value?.push(candle);

    if (candle_border) {
      // TODO: introduce candle_border
    }
  }
}

// executed initially and when width or height changes
watchEffect(() => {
  if (!props.width || !props.height) {
    return;
  }
  drawChart();
});
</script>
