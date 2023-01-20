<template>
  <chart-wrapper>
    <div style="height: 100%">
      <div class="row full-height" ref="chartRowRef">
        <div class="col justify-between chart-canvas">
          <div class="row" style="height: 100%">
            <canvas ref="chartCanvasRef" id="ChartCanvas" />
          </div>
          <div class="row"><canvas ref="yBarRef" id="YBarCanvas" /></div>
        </div>
        <div class="col x-bar">
          <canvas ref="xBarRef" id="XBarCanvas" />
        </div>
      </div>
    </div>
  </chart-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ChartWrapper from './charts/ChartWrapper.vue';
import { PriceSeries } from 'src/components/price-chart.model';

const props = withDefaults(
  defineProps<{
    data: PriceSeries[];
  }>(),
  {
    data: () => [],
  }
);

const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
const xBarRef = ref<HTMLCanvasElement | null>(null);
const yBarRef = ref<HTMLCanvasElement | null>(null);
const chartRowRef = ref<HTMLElement | null>(null);

const HORIZONTAL_LINES = 10;
const GRID_COLOR = 'lightgray';
const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
const CANDLE_BORDER_COLOR = 'black';
const CANDLE_DISTANCE = 5;
const MAX_CANDLES = 40;

const data_max_candles = ref(props.data.slice(-MAX_CANDLES));

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

onMounted(() => {
  if (chartCanvasRef.value && xBarRef.value && yBarRef.value) {
    const chartRow = chartRowRef.value;
    const chart = chartCanvasRef.value;
    const xBar = xBarRef.value;
    const yBar = yBarRef.value;
    const ctxChart = chart.getContext('2d');
    const ctxXBar = xBar.getContext('2d');
    const ctxYBar = yBar.getContext('2d');

    if (ctxChart && ctxXBar && ctxYBar && chartRow) {
      const clientHeight = chartRow.clientHeight;
      chart.width = chartRow.clientWidth;
      chart.height = clientHeight * 0.95;
      xBar.height = clientHeight;
      yBar.height = clientHeight * 0.05;

      // draw horizontal lines
      const lineDistance = chart.height / HORIZONTAL_LINES;
      for (let dist = lineDistance; dist < chart.height; dist += lineDistance) {
        ctxChart.strokeStyle = GRID_COLOR;
        ctxChart.beginPath();
        ctxChart.moveTo(0, dist);
        ctxChart.lineTo(chart.width, dist);
        ctxChart.stroke();
      }

      const candle_width =
        chart.width / MAX_CANDLES -
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
        if (!candleH2L.value || !maxCandleHigh.value || !ctxChart) {
          return;
        }
        const scaled_o =
          chart.height * ((maxCandleHigh.value - ohlc.o) / candleH2L.value);
        const scaled_h =
          chart.height * ((maxCandleHigh.value - ohlc.h) / candleH2L.value);
        const scaled_l =
          chart.height * ((maxCandleHigh.value - ohlc.l) / candleH2L.value);
        const scaled_c =
          chart.height * ((maxCandleHigh.value - ohlc.c) / candleH2L.value);
        // Draw the body and the wick of the candlestick
        if (ohlc.c > ohlc.o) {
          // body
          ctxChart.fillStyle = bull_color;
          ctxChart.fillRect(x, scaled_o, width, scaled_c - scaled_o);
          // upper wick
          ctxChart.strokeStyle = bull_color;
          if (candle_border) {
            ctxChart.strokeStyle = candle_border_color;
          }
          ctxChart.beginPath();
          ctxChart.moveTo(x + width / 2, scaled_h);
          ctxChart.lineTo(x + width / 2, scaled_c);
          ctxChart.stroke();
          // lower wick
          ctxChart.beginPath();
          ctxChart.moveTo(x + width / 2, scaled_l);
          ctxChart.lineTo(x + width / 2, scaled_o);
          ctxChart.stroke();
        } else {
          // body
          ctxChart.fillStyle = bear_color;
          ctxChart.fillRect(x, scaled_c, width, scaled_o - scaled_c);
          // upper wick
          ctxChart.strokeStyle = bear_color;
          if (candle_border) {
            ctxChart.strokeStyle = candle_border_color;
          }
          ctxChart.beginPath();
          ctxChart.moveTo(x + width / 2, scaled_h);
          ctxChart.lineTo(x + width / 2, scaled_o);
          ctxChart.stroke();
          // lower wick
          ctxChart.beginPath();
          ctxChart.moveTo(x + width / 2, scaled_l);
          ctxChart.lineTo(x + width / 2, scaled_c);
          ctxChart.stroke();
        }

        if (candle_border) {
          // Draw the border of the candlestick
          ctxChart.lineWidth = 2;
          ctxChart.strokeStyle = candle_border_color;
          ctxChart.strokeRect(x, scaled_c, width, scaled_o - scaled_c);
        }
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.chart-canvas {
  display: flex;
  flex-direction: column;
}

.x-bar {
  overflow: auto;
  min-width: 60px;
  max-width: 60px;
}

#ChartCanvas {
  height: 100%;
  width: 100%;
}

#XBarCanvas {
  height: 100%;
  background: red;
}

#YBarCanvas {
  background: yellow;
  width: 100%;
}
</style>
