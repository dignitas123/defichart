<template>
  <chart-wrapper>
    <!-- TODO: loading spinner when loading chart data -->
    <div v-if="false" class="spinner-bar-wrapper">
      <q-spinner-ios color="primary" size="xl" />
    </div>
    <div class="price-chart" ref="chartRowRef">
      <div ref="chartRowRef" class="row test">
        <div class="col">
          <canvas ref="chartCanvasRef" id="ChartCanvas" />
        </div>
        <div class="col x-bar">
          <price-axis
            :highestPrice="maxCandleHigh"
            :h2l="candleH2L"
            :width="priceAxisWidth"
            :height="chartHeight"
            :tickSize="DATA_TICKSIZE"
            :update="updateYXaxis"
            @horizontalLine="drawHorizontalGridLine"
          />
        </div>
      </div>
      <div class="row time-row">
        <div class="col">
          <date-axis
            :dates="data_dates"
            :update="updateYXaxis"
          />
        </div>
        <div class="col settings-button">
          <q-icon color="dark" name="settings" size="xs" />
        </div>
      </div>
    </div>
    <q-resize-observer @resize="onResize" />
  </chart-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import ChartWrapper from '../ChartWrapper.vue';
import { PriceSeries } from './price-chart.model';
import PriceAxis from './components/price-axis.vue';
import DateAxis from './components/date-axis.vue';
import { getDigits, getBeforeComma } from './helpers/digits';
import { DATA_TICKSIZE } from './consts';

const props = withDefaults(
  defineProps<{
    data: PriceSeries[];
  }>(),
  {
    data: () => [],
  }
);

const updateYXaxis = ref(false);

// size: {width: number; height: number;}
function onResize() {
  if (chartCanvasRef.value) {
    calculateChart(chartCanvasRef.value);
    updateYXaxis.value = !updateYXaxis.value;
  }
}

const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
const chartRowRef = ref<HTMLElement | null>(null);

const GRID_COLOR = '#e4e4e4';
const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
const CANDLE_BORDER_COLOR = 'black';
const CANDLE_DISTANCE = 5;
const MAX_CANDLES = 40;
const PRICE_AXIS_STANDARD_WIDTH = 60;
const CANVAS_HD_SCALE_FACTOR = 5; // improves quality of Chart Canvas

const data_max_candles = ref(props.data.slice(-MAX_CANDLES));

const priceAxisWidth = ref(PRICE_AXIS_STANDARD_WIDTH);

// @dev: for price-axis
const chartHeight = computed(() => {
  if (chartRowRef.value) {
    return chartRowRef.value.clientHeight;
  } else {
    return undefined;
  }
});

const data_dates = computed((): Date[] | undefined => {
  if (data_max_candles.value.length) {
    return data_max_candles.value.map((ohlc) => ohlc.d);
  } else {
    return undefined;
  }
});

const maxCandleHigh = computed(() => {
  if (data_max_candles.value.length) {
    return Math.max(...data_max_candles.value.map((ohlc) => Number(ohlc.h)));
  } else {
    return undefined;
  }
});

const maxCandleLow = computed(() => {
  if (data_max_candles.value.length) {
    return Math.min(...data_max_candles.value.map((ohlc) => Number(ohlc.l)));
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

const chartContext = computed(() => {
  if (chartCanvasRef.value) {
    return chartCanvasRef.value.getContext('2d');
  } else {
    return undefined;
  }
});

const chartWidth = ref(0);

// @emit function
function drawHorizontalGridLine(price: number) {
  if (chartContext.value && chartWidth.value) {
    chartContext.value.strokeStyle = GRID_COLOR;
    chartContext.value.beginPath();
    chartContext.value.moveTo(0, price);
    chartContext.value.lineTo(chartWidth.value, price);
    chartContext.value.globalCompositeOperation = 'destination-over';
    chartContext.value.stroke();
  }
}

const priceAxisStandardWidthInPixel = computed(() => {
  return priceAxisWidth.value + 'px';
});

const ctxChart = computed(() => {
  return chartCanvasRef.value?.getContext('2d');
});

function calculateChart(chart: HTMLCanvasElement) {
  if (ctxChart.value && chartRowRef.value) {
    const clientWidth = chartRowRef.value.clientWidth;
    const clientHeight = chartRowRef.value.clientHeight;

    // set the chart initial width and height
    chart.width = clientWidth;
    chart.height = clientHeight;

    const rect = chart.getBoundingClientRect();

    // Set the "actual" size of the canvas
    chart.width = rect.width * CANVAS_HD_SCALE_FACTOR;
    chart.height = rect.height * CANVAS_HD_SCALE_FACTOR;

    // Scale the context to ensure correct drawing operations
    ctxChart.value.scale(CANVAS_HD_SCALE_FACTOR, CANVAS_HD_SCALE_FACTOR);

    // Set the "drawn" size of the canvas
    chart.style.width = `${rect.width}px`;
    chart.style.height = `${rect.height - 35}px`;

    // save the chartWidth value for the horizontal line calculation width
    chartWidth.value = clientWidth;

    let candle_width =
      chart.width / MAX_CANDLES -
      CANDLE_DISTANCE * CANVAS_HD_SCALE_FACTOR -
      (CANDLE_DISTANCE * CANVAS_HD_SCALE_FACTOR) / MAX_CANDLES;

    const starting_distance_difference = MAX_CANDLES - props.data.length;

    let xPositionCandlestick =
      0 +
      (starting_distance_difference > 0 ? starting_distance_difference : 0) *
        (candle_width + CANDLE_DISTANCE * CANVAS_HD_SCALE_FACTOR) +
      CANDLE_DISTANCE * CANVAS_HD_SCALE_FACTOR;

    data_max_candles.value.forEach((ohlc) => {
      drawCandle(xPositionCandlestick, ohlc);
      xPositionCandlestick +=
        candle_width + CANDLE_DISTANCE * CANVAS_HD_SCALE_FACTOR;
    });

    function drawCandle(
      x: number,
      ohlc: PriceSeries,
      width: number = candle_width,
      bull_color: string = CANDLE_BULL_COLOR,
      bear_color: string = CANDLE_BEAR_COLOR,
      candle_border: boolean = CANDLE_BORDER,
      candle_border_color: string = CANDLE_BORDER_COLOR
    ) {
      if (
        !candleH2L.value ||
        !maxCandleHigh.value ||
        !chartCanvasRef.value ||
        !ctxChart.value
      ) {
        return;
      }
      const scaled_o =
        (chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.o) / candleH2L.value)) /
        CANVAS_HD_SCALE_FACTOR;
      const scaled_h =
        (chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.h) / candleH2L.value)) /
        CANVAS_HD_SCALE_FACTOR;
      const scaled_l =
        (chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.l) / candleH2L.value)) /
        CANVAS_HD_SCALE_FACTOR;
      const scaled_c =
        (chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.c) / candleH2L.value)) /
        CANVAS_HD_SCALE_FACTOR;

      const xScaled = x / CANVAS_HD_SCALE_FACTOR;
      const widthScaled = width / CANVAS_HD_SCALE_FACTOR;
      // Draw the body and the wick of the candlestick
      if (ohlc.c > ohlc.o) {
        ctxChart.value.lineWidth = 0;
        // body
        ctxChart.value.fillStyle = bull_color;
        ctxChart.value.fillRect(
          x / CANVAS_HD_SCALE_FACTOR,
          scaled_o,
          width / CANVAS_HD_SCALE_FACTOR,
          scaled_c - scaled_o
        );
        ctxChart.value.lineWidth = 0;
        // upper wick
        ctxChart.value.strokeStyle = bull_color;
        if (candle_border) {
          ctxChart.value.strokeStyle = candle_border_color;
        }
        const xStartingPoint = xScaled + widthScaled / 2;
        ctxChart.value.beginPath();
        ctxChart.value.moveTo(xStartingPoint, scaled_h);
        ctxChart.value.lineTo(xStartingPoint, scaled_c);
        ctxChart.value.stroke();
        // lower wick
        ctxChart.value.beginPath();
        ctxChart.value.moveTo(xStartingPoint, scaled_l);
        ctxChart.value.lineTo(xStartingPoint, scaled_o);
        ctxChart.value.stroke();
      } else {
        ctxChart.value.lineWidth = 0;
        // body
        ctxChart.value.fillStyle = bear_color;
        ctxChart.value.fillRect(
          x / CANVAS_HD_SCALE_FACTOR,
          scaled_c,
          width / CANVAS_HD_SCALE_FACTOR,
          scaled_o - scaled_c
        );
        ctxChart.value.lineWidth = 0;
        // upper wick
        ctxChart.value.strokeStyle = bear_color;
        if (candle_border) {
          ctxChart.value.strokeStyle = candle_border_color;
        }
        const xStartingPoint = xScaled + widthScaled / 2;
        ctxChart.value.beginPath();
        ctxChart.value.moveTo(xStartingPoint, scaled_h);
        ctxChart.value.lineTo(xStartingPoint, scaled_o);
        ctxChart.value.stroke();
        // lower wick
        ctxChart.value.beginPath();
        ctxChart.value.moveTo(xStartingPoint, scaled_l);
        ctxChart.value.lineTo(xStartingPoint, scaled_c);
        ctxChart.value.stroke();
      }

      // TODO: probably doesn't work yet
      if (candle_border) {
        // Draw the border of the candlestick
        ctxChart.value.lineWidth = 2;
        ctxChart.value.strokeStyle = candle_border_color;
        ctxChart.value.strokeRect(x, scaled_c, width, scaled_o - scaled_c);
      }
    }
  }
}

watchEffect(() => {
  // set priceAxisWidth depending on digits
  if (maxCandleHigh.value && DATA_TICKSIZE) {
    const digits = getDigits(DATA_TICKSIZE);
    const beforeComma = getBeforeComma(maxCandleHigh.value);
    const width_per_letter = 10.3;
    const widthPixelsSum = (digits + beforeComma) * width_per_letter;
    const maxPriceAxisWidth = 100;
    if (widthPixelsSum > maxPriceAxisWidth) {
      priceAxisWidth.value = maxPriceAxisWidth;
    } else {
      priceAxisWidth.value = widthPixelsSum;
    }
  }
});
</script>

<style lang="scss" scoped>
.spinner-bar-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
}
.price-chart {
  height: 100%;
  width: 100%;
  .x-bar {
    min-width: v-bind(priceAxisStandardWidthInPixel);
    max-width: v-bind(priceAxisStandardWidthInPixel);
  }

  .time-row {
    width: 100%;
  }

  .settings-button {
    overflow: auto;
    min-width: v-bind(priceAxisStandardWidthInPixel);
    max-width: v-bind(priceAxisStandardWidthInPixel);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #ChartCanvas {
    height: 100%;
    width: 100%;
  }
}
</style>
