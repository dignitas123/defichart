<template>
  <chart-wrapper>
    <div class="price-chart" ref="chartRowRef">
      <div chartRowRef class="row" style="flex-grow: 1">
        <div class="col">
          <canvas ref="chartCanvasRef" id="ChartCanvas" />
        </div>
        <div class="col x-bar">
          <price-axis
            :highestPrice="maxCandleHigh"
            :width="priceAxisWidth"
            :height="chartHeight"
            :scale="xScale"
            :maxScale="MAX_X_SCALE"
            :tickSize="DATA_TICKSIZE"
            :update="updateYXaxis"
            @horizontalLine="drawHorizontalGridLine"
          />
        </div>
      </div>
      <div class="row time-row" :style="`height: ${DATE_BAR_HEIGHT}px`">
        <div class="col" :style="`height: ${DATE_BAR_HEIGHT}px`">
          <date-axis
            :dates="data_dates"
            :height="DATE_BAR_HEIGHT"
            :width="chartWidth"
            :update="updateYXaxis"
          />
        </div>
        <div
          class="col settings-button"
          :style="`height: ${DATE_BAR_HEIGHT}px`"
        >
          <q-icon color="dark" name="settings" size="xs" />
        </div>
      </div>
    </div>
    <q-resize-observer @resize="onResize" />
  </chart-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue';
import ChartWrapper from '../../charts/ChartWrapper.vue';
import { PriceSeries } from './price-chart.model';
import PriceAxis from './components/price-axis.vue';
import DateAxis from './components/date-axis.vue';
import { roundToTicksize, getDigits, getBeforeComma } from './helpers/digits';

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
const MAX_X_SCALE = 13;
const DATA_TICKSIZE = 0.00001;
const PRICE_AXIS_STANDARD_WIDTH = 60;
const DATE_BAR_HEIGHT = 35;
const CANVAS_HD_SCALE_FACTOR = 5; // improves quality of Chart Canvas

const data_max_candles = ref(props.data.slice(-MAX_CANDLES));

const priceAxisWidth = ref(PRICE_AXIS_STANDARD_WIDTH);

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

const xScale = computed(() => {
  if (candleH2L.value) {
    const distance = candleH2L.value / MAX_X_SCALE;
    return roundToTicksize(distance, DATA_TICKSIZE);
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

onMounted(() => {
  if (chartCanvasRef.value) {
    calculateChart(chartCanvasRef.value);
  }
});

function calculateChart(chart: HTMLCanvasElement) {
  const chartRow = chartRowRef.value;
  if (ctxChart.value && chartRow) {
    const clientWidth = chartRow.clientWidth;
    const clientHeight = chartRow.clientHeight;

    // set the chart initial width and height
    chart.width = clientWidth;
    chart.height = clientHeight - DATE_BAR_HEIGHT;

    const rect = chart.getBoundingClientRect();

    // Set the "actual" size of the canvas
    chart.width = rect.width * CANVAS_HD_SCALE_FACTOR;
    chart.height = rect.height * CANVAS_HD_SCALE_FACTOR;

    // Scale the context to ensure correct drawing operations
    ctxChart.value?.scale(CANVAS_HD_SCALE_FACTOR, CANVAS_HD_SCALE_FACTOR);

    // Set the "drawn" size of the canvas
    chart.style.width = `${rect.width}px`;
    chart.style.height = `${rect.height}px`;

    // set the chartWidth value for the price-axis
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
    const widthPixelsSum = (digits + beforeComma) * 10;
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
.price-chart {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  .x-bar {
    overflow: auto;
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
