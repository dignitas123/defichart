<template>
  <chart-wrapper>
    <div style="height: 100%">
      <div class="row full-height" ref="chartRowRef">
        <div class="col chart-canvas">
          <canvas ref="chartCanvasRef" id="ChartCanvas" />
          <canvas ref="yBarRef" id="YBarCanvas" />
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
const CANDLE_WIDTH = 20;
const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
const CANDLE_BORDER_COLOR = 'black';
const CANDLE_DISTANCE = 5;

const maxCandleHigh = computed(() => {
  if (props.data.length) {
    return Math.max(...props.data.map((ohlc) => Number(ohlc.h)));
  } else {
    return undefined;
  }
});

const maxCandleLow = computed(() => {
  if (props.data.length) {
    return Math.min(...props.data.map((ohlc) => Number(ohlc.l)));
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

      // Set the x and y coordinates of the candlestick
      const CANDLE_PADDING = 5;
      let xPositionCandlestick = 0 + CANDLE_PADDING;
      props.data.forEach((ohlc) => {
        drawCandle(ctxChart, xPositionCandlestick, ohlc);
        xPositionCandlestick += CANDLE_WIDTH + CANDLE_DISTANCE;
      });

      function drawCandle(
        ctx: CanvasRenderingContext2D,
        x: number,
        ohlc: PriceSeries,
        width: number = CANDLE_WIDTH,
        bull_color: string = CANDLE_BULL_COLOR,
        bear_color: string = CANDLE_BEAR_COLOR,
        candle_border: boolean = CANDLE_BORDER,
        candle_border_color: string = CANDLE_BORDER_COLOR
      ) {
        if (!candleH2L.value || !maxCandleHigh.value) {
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
          ctx.fillStyle = bull_color;
          ctx.fillRect(x, scaled_o, width, scaled_c - scaled_o);
          // upper wick
          ctx.strokeStyle = bull_color;
          if (candle_border) {
            ctx.strokeStyle = candle_border_color;
          }
          ctx.beginPath();
          ctx.moveTo(x + width / 2, scaled_h);
          ctx.lineTo(x + width / 2, scaled_c);
          ctx.stroke();
          // lower wick
          ctx.beginPath();
          ctx.moveTo(x + width / 2, scaled_l);
          ctx.lineTo(x + width / 2, scaled_o);
          ctx.stroke();
        } else {
          // body
          ctx.fillStyle = bear_color;
          ctx.fillRect(x, scaled_c, width, scaled_o - scaled_c);
          // upper wick
          ctx.strokeStyle = bear_color;
          if (candle_border) {
            ctx.strokeStyle = candle_border_color;
          }
          ctx.beginPath();
          ctx.moveTo(x + width / 2, scaled_h);
          ctx.lineTo(x + width / 2, scaled_o);
          ctx.stroke();
          // lower wick
          ctx.beginPath();
          ctx.moveTo(x + width / 2, scaled_l);
          ctx.lineTo(x + width / 2, scaled_c);
          ctx.stroke();
        }

        if (candle_border) {
          // Draw the border of the candlestick
          ctx.lineWidth = 2;
          ctx.strokeStyle = candle_border_color;
          ctx.strokeRect(x, scaled_c, width, scaled_o - scaled_c);
        }
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.chart-canvas {
  overflow: auto;
}

.x-bar {
  overflow: auto;
  min-width: 60px;
  max-width: 60px;
}

#chartCanvasRef {
  height: 100%;
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
