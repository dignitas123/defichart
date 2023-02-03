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
import { computed, ref, watch, watchEffect } from 'vue';
import { PRICE_LINES_TRANSPARENCY } from '../consts';
import { PriceSeries } from '../price-chart.model';
import { usePriceChartData } from '../price-chart.model';

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: number;
    priceLines?: number[];
  }>(),
  {
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
  dataMaxCandlesShow,
  maxCandlesShow,
  candleH2L,
  maxCandleHigh,
  minCandleLow,
  startingDistanceDifference,
} = usePriceChartData();

const CANDLE_WICK_THICKNESS = 0.15; // in percent

const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
// const CANDLE_BORDER_COLOR = 'black';

const candles = ref<Candle[]>([]);

const candleDistance = ref(3); // inital 3 as standard

const candleWidth = computed(() => {
  if (props.width) {
    return (
      props.width / maxCandlesShow.value -
      candleDistance.value -
      candleDistance.value / maxCandlesShow.value
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

// candleDistance has to calculate after candleWidth
watch(candleWidth, () => {
  candleDistance.value = calcCandleDistance();
});

// x-distance between candles
function calcCandleDistance() {
  const cW = candleWidth.value;
  if (cW) {
    if (cW > 40) {
      return 5;
    } else if (cW > 16) {
      return 4;
    } else if (cW > 20) {
      return 3;
    } else if (cW > 6.5) {
      return 2;
    } else if (cW > 4) {
      return 1;
    } else {
      return 0;
    }
  }
  return 3;
}

function drawChart() {
  if (!props.width || !props.height) {
    return;
  }
  candles.value = [];

  let xPositionCandlestick =
    (startingDistanceDifference.value > 0
      ? startingDistanceDifference.value
      : 0) *
      (candleWidth.value + candleDistance.value) +
    candleDistance.value;

  dataMaxCandlesShow.value.forEach((ohlc) => {
    drawCandle(xPositionCandlestick, ohlc, candleWidth.value);
    xPositionCandlestick += candleWidth.value + candleDistance.value;
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
  candleDistance.value = calcCandleDistance();
});
</script>
