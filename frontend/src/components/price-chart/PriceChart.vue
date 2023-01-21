<template>
  <chart-wrapper>
    <div
      class="row full-height"
      ref="chartRowRef"
      style="flex-direction: column"
      id="test"
    >
      <div class="row" style="flex-grow: 1">
        <div class="col">
          <canvas ref="chartCanvasRef" id="ChartCanvas" />
        </div>
        <div class="col x-bar">
          <price-axis
            :highestPrice="maxCandleHigh"
            :width="priceAxisWidth"
            :height="chartCanvasHeight"
            :scale="xScale"
            :maxScale="MAX_X_SCALE"
            :tickSize="DATA_TICKSIZE"
            @horizontalLine="drawHorizontalGridLine"
          />
        </div>
      </div>
      <div class="row time-row" :style="`height: ${DATE_BAR_HEIGHT}px`">
        <div class="col">
          <canvas ref="yBarRef" id="YBarCanvas" />
        </div>
        <div class="col settings-button" :style="`height: ${DATE_BAR_HEIGHT}px`">
          <q-icon
            color="dark"
            name="settings"
            size="xs"
          />
        </div>
      </div>
    </div>
  </chart-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue';
import ChartWrapper from '../charts/ChartWrapper.vue';
import { PriceSeries } from 'src/components/price-chart.model';
import PriceAxis from './components/price-axis.vue';
import { roundToTicksize, getDigits, getBeforeComma } from './helpers/digits';

const props = withDefaults(
  defineProps<{
    data: PriceSeries[];
  }>(),
  {
    data: () => [],
  }
);

const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
const yBarRef = ref<HTMLCanvasElement | null>(null);
const chartRowRef = ref<HTMLElement | null>(null);

const GRID_COLOR = 'lightgray';
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

const data_max_candles = ref(props.data.slice(-MAX_CANDLES));
const priceAxisWidth = ref(PRICE_AXIS_STANDARD_WIDTH);

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

const chartCanvasHeight = computed(() => {
  if (chartCanvasRef.value) {
    return chartCanvasRef.value.height;
  } else {
    return undefined;
  }
});

const chartWidth = computed(() => {
  if (chartRowRef.value) {
    return chartRowRef.value.clientWidth;
  } else {
    return undefined;
  }
});

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

const ctxChart = computed(() => {
  return chartCanvasRef.value?.getContext('2d');
});

onMounted(() => {
  if (chartCanvasRef.value && yBarRef.value) {
    const chartRow = chartRowRef.value;
    const yBar = yBarRef.value;
    const ctxYBar = yBar.getContext('2d');

    if (ctxChart.value && ctxYBar && chartRow) {
      const clientHeight = chartRow.clientHeight;
      chartCanvasRef.value.width = chartRow.clientWidth;
      chartCanvasRef.value.height = clientHeight - DATE_BAR_HEIGHT;
      yBar.height = DATE_BAR_HEIGHT;

      const candle_width =
        chartCanvasRef.value.width / MAX_CANDLES -
        CANDLE_DISTANCE -
        CANDLE_DISTANCE / MAX_CANDLES;

      const starting_distance_difference = MAX_CANDLES - props.data.length;

      let xPositionCandlestick =
        0 +
        (starting_distance_difference > 0 ? starting_distance_difference : 0) *
          (candle_width + CANDLE_DISTANCE) +
        CANDLE_DISTANCE;
      data_max_candles.value.forEach((ohlc) => {
        drawCandle(xPositionCandlestick, ohlc);
        xPositionCandlestick += candle_width + CANDLE_DISTANCE;
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
          chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.o) / candleH2L.value);
        const scaled_h =
          chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.h) / candleH2L.value);
        const scaled_l =
          chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.l) / candleH2L.value);
        const scaled_c =
          chartCanvasRef.value.height *
          ((maxCandleHigh.value - ohlc.c) / candleH2L.value);
        // Draw the body and the wick of the candlestick
        if (ohlc.c > ohlc.o) {
          // body
          ctxChart.value.fillStyle = bull_color;
          ctxChart.value.fillRect(x, scaled_o, width, scaled_c - scaled_o);
          // upper wick
          ctxChart.value.strokeStyle = bull_color;
          if (candle_border) {
            ctxChart.value.strokeStyle = candle_border_color;
          }
          ctxChart.value.beginPath();
          ctxChart.value.moveTo(x + width / 2, scaled_h);
          ctxChart.value.lineTo(x + width / 2, scaled_c);
          ctxChart.value.stroke();
          // lower wick
          ctxChart.value.beginPath();
          ctxChart.value.moveTo(x + width / 2, scaled_l);
          ctxChart.value.lineTo(x + width / 2, scaled_o);
          ctxChart.value.stroke();
        } else {
          // body
          ctxChart.value.fillStyle = bear_color;
          ctxChart.value.fillRect(x, scaled_c, width, scaled_o - scaled_c);
          // upper wick
          ctxChart.value.strokeStyle = bear_color;
          if (candle_border) {
            ctxChart.value.strokeStyle = candle_border_color;
          }
          ctxChart.value.beginPath();
          ctxChart.value.moveTo(x + width / 2, scaled_h);
          ctxChart.value.lineTo(x + width / 2, scaled_o);
          ctxChart.value.stroke();
          // lower wick
          ctxChart.value.beginPath();
          ctxChart.value.moveTo(x + width / 2, scaled_l);
          ctxChart.value.lineTo(x + width / 2, scaled_c);
          ctxChart.value.stroke();
        }

        if (candle_border) {
          // Draw the border of the candlestick
          ctxChart.value.lineWidth = 2;
          ctxChart.value.strokeStyle = candle_border_color;
          ctxChart.value.strokeRect(x, scaled_c, width, scaled_o - scaled_c);
        }
      }
    }
  }
});
</script>

<style lang="scss" scoped>
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

#YBarCanvas {
  height: 100%;
  width: 100%;
}
</style>
