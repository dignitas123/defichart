<template>
  <svg
    :width="width"
    :height="height"
    class="price-lines-svg d-block absolute"
    style="z-index: 1"
  >
    <line
      v-for="(price, i) in priceLines"
      :key="i"
      :x1="0"
      :y1="price"
      :x2="width"
      :y2="price"
      :stroke="`rgb(0, 0, 0, ${PRICE_LINES_TRANSPARENCY})`"
    />
  </svg>
  <svg
    :width="width"
    :height="height"
    class="chart-svg d-block absolute"
    style="z-index: 2"
  >
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
import { MAX_CANDLES_SHOW, PRICE_LINES_TRANSPARENCY } from '../consts';
import { PriceSeries } from '../price-chart.model';
import { usePriceChartData } from '../price-chart.model';

const props = withDefaults(
  defineProps<{
    data?: PriceSeries[];
    height?: number;
    width?: number;
    priceLines?: number[];
  }>(),
  {
    data: () => [],
    priceLines: () => [],
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

const {
  starting_distance_difference,
  data_max_candles_show,
  candleH2L,
  maxCandleHigh,
  minCandleLow,
} = usePriceChartData(props.data);

const CANDLE_DISTANCE = 3; // in px
const CANDLE_WICK_THICKNESS = 0.15; // in percent

const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
// const CANDLE_BORDER_COLOR = 'black';

const candles = ref<Candle[]>([]);

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
      !minCandleLow.value ||
      !props.height ||
      !props.width ||
      !candleWickWidth.value
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

watchEffect(() => {
  if (!props.width || !props.height) {
    return;
  }
  drawChart();
});
</script>
