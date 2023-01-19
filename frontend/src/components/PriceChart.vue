<template>
  <chart-wrapper>
    <div style="height: 100%">
      <div class="row full-height" ref="chartRowRef">
        <div class="col chart-canvas"><canvas ref="chartCanvasRef" id="ChartCanvas" /></div>
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

const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
const xBarRef = ref<HTMLCanvasElement | null>(null);
const chartRowRef = ref<HTMLElement | null>(null);

const HORIZONTAL_LINES = 10;
const GRID_COLOR = 'lightgray';

onMounted(() => {
  if (chartCanvasRef.value && xBarRef.value) {
    const chartRow = chartRowRef.value;
    const chart = chartCanvasRef.value;
    const xBar = xBarRef.value;
    const ctxChart = chart.getContext('2d');
    const ctxXBar = xBar.getContext('2d');

    if (ctxChart && ctxXBar && chartRow) {
      const clientHeight = chartRow.clientHeight;
      chart.width = chartRow.clientWidth;
      chart.height = clientHeight;
      xBar.height = clientHeight;
      
      // draw horizontal lines
      const lineDistance = chart.height / HORIZONTAL_LINES;
      for (let dist = lineDistance; dist < chart.height; dist += lineDistance) {
        ctxChart.strokeStyle = GRID_COLOR;
        ctxChart.beginPath();
        ctxChart.moveTo(0, dist);
        ctxChart.lineTo(chart.width, dist);
        ctxChart.stroke();
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
  min-width: 200px;
  max-width: 200px;
}

#chartCanvasRef {
  height: 100%;
}

#XBarCanvas {
  height: 100%;
  background: red;
}
</style>
