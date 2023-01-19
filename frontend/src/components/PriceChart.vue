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
import { ref, onMounted } from 'vue';
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

      const ohlc = {
        d: new Date('20-01-1994'),
        o: 50,
        h: 90,
        l: 30,
        c: 80,
        v: 1029102,
      };

      // Set the x and y coordinates of the candlestick
      const x = 100;
      const y = 50;

      drawCandle(ctxChart, x, y, ohlc);
    }
  }
});

function drawCandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ohlc: PriceSeries,
  width: number = CANDLE_WIDTH,
  bull_color: string = CANDLE_BULL_COLOR,
  bear_color: string = CANDLE_BEAR_COLOR,
  candle_border: boolean = CANDLE_BORDER,
  candle_border_color: string = CANDLE_BORDER_COLOR
) {
  // Draw the body and the wick of the candlestick
  if (open > close) {
    // body
    ctx.fillStyle = bear_color;
    ctx.fillRect(x, ohlc.c, width, ohlc.o - ohlc.c);
    // upper wick
    ctx.strokeStyle = bear_color;
    if (candle_border) {
      ctx.strokeStyle = candle_border_color;
    }
    ctx.beginPath();
    ctx.moveTo(x + width / 2, ohlc.h);
    ctx.lineTo(x + width / 2, ohlc.o);
    ctx.stroke();
    // lower wick
    ctx.beginPath();
    ctx.moveTo(x + width / 2, ohlc.l);
    ctx.lineTo(x + width / 2, ohlc.c);
    ctx.stroke();
  } else {
    // body
    ctx.fillStyle = bull_color;
    ctx.fillRect(x, ohlc.o, width, ohlc.c - ohlc.o);
    // upper wick
    ctx.strokeStyle = bull_color;
    if (candle_border) {
      ctx.strokeStyle = candle_border_color;
    }
    ctx.beginPath();
    ctx.moveTo(x + width / 2, ohlc.h);
    ctx.lineTo(x + width / 2, ohlc.c);
    ctx.stroke();
    // lower wick
    ctx.beginPath();
    ctx.moveTo(x + width / 2, ohlc.l);
    ctx.lineTo(x + width / 2, ohlc.o);
    ctx.stroke();
  }

  if (candle_border) {
    // Draw the border of the candlestick
    ctx.lineWidth = 2;
    ctx.strokeStyle = candle_border_color;
    ctx.strokeRect(x, ohlc.c, width, ohlc.o - ohlc.c);
  }
}
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
