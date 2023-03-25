<template>
  <q-page
    class="q-pa-xs"
    @mouseup="stopResizeDrag"
    @mousemove="onResizeDrag"
    @mouseleave="onChartsPageLeave"
    @keyup="handleKeyUp"
    @keydown="handleKeyDown"
  >
    <ChartWindow
      v-for="(chart, id) in charts"
      :key="id"
      :id="id"
      v-model:width="chart.width"
      v-model:height="chart.height"
      v-model:fullWidth="chart.fullWidth"
      v-model:fullHeight="chart.fullHeight"
      v-model:candlesShow="chart.candlesShow"
      v-model:selected="chart.selected"
      v-model:offset="chart.offset"
      v-model:maxCandles="chart.maxCandles"
      v-model:timeFrame="chart.timeFrame"
      v-model:lookbackPeriod="chart.lookbackPeriod"
      @chartClick="onChartClick"
      @resizeDrag="onStartResizeDrag"
      @chartWidthHeightChange="updateResizeDragStart"
    />
    <div v-if="snapActive && !shiftKeyActive" class="snap-to-full" />
    <div v-if="snapActive && !shiftKeyActive" class="show-shift-key-hint">
      You can hold shift ⇧ to deactivate Snap Mode
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { onUnmounted, reactive, ref, nextTick, onMounted } from 'vue';
import { Chart } from './broker-charts.if';
import ChartWindow from 'src/components/chart-window/chart-window.vue';
import { useBrokerChartSizes } from './broker-charts.cp';
import { generateChartObject } from './helper/chart-generator';
import {
  HEADER_HEIGHT,
} from 'src/pages/broker-charts/consts';
import { useCursorOverwrite } from 'src/shared/composables/cursor-overwrite';

const MIN_CHART_HEIGHT = 300;
const MIN_CHART_WIDTH = 300;
const SNAP_PERCENTAGE = 0.05;

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

const { maxChartHeight, maxChartWidth } = useBrokerChartSizes();

const { setCursor, removeCursor } = useCursorOverwrite();

// TODO: make real charts created by users and saved in localStorage
const nonStandardChart = generateChartObject({
  symbol: 'ethusd',
  broker: 'perpetual',
  network: 'optimism',
  x: 0,
  y: 0,
  width: 300,
  height: 300,
  fullWidth: false,
  fullHeight: false,
  candlesShow: 80,
  selected: false,
  offset: 0,
  maxCandles: 200,
  timeFrame: 'M30',
  lookbackPeriod: '1quarter',
});

const testCharts = {
  ...generateChartObject(),
  // ...nonStandardChart,
};

const charts = reactive<Record<string, Chart>>(testCharts);

const selectedChartId = ref(Object.keys(charts)[0]);

const resizeDrag = ref(false);

const snapActive = ref(false);
const shiftKeyActive = ref(false);

// @keydown emit
function handleKeyDown(event: KeyboardEvent) {
  if (event.shiftKey) {
    shiftKeyActive.value = true;
  } else if (event.code === 'ArrowUp') {
    charts[selectedChartId.value].candlesShow++;
  } else if (event.code === 'ArrowDown') {
    if (charts[selectedChartId.value].candlesShow > 1) {
      charts[selectedChartId.value].candlesShow--;
    }
  } else if (event.code === 'ArrowRight') {
    if (charts[selectedChartId.value].offset < 0) {
      charts[selectedChartId.value].offset++;
    }
  } else if (event.code === 'ArrowLeft') {
    if (
      charts[selectedChartId.value].maxCandles +
        charts[selectedChartId.value].offset >
      1
    ) {
      charts[selectedChartId.value].offset--;
    }
  }
}

// @keyup event
function handleKeyUp() {
  shiftKeyActive.value = false;
}

// @chartClick event
function onChartClick(id: string) {
  selectedChartId.value = id;
}

// @resizeDrag event
function onStartResizeDrag(xOnly: boolean, yOnly: boolean) {
  resizeDrag.value = true;
  resizeDragXOnly.value = xOnly;
  resizeDragYOnly.value = yOnly;
  if (yOnly) {
    setCursor('ns-resize');
  }
}

function resetRisizeDragSnapAndDragXYOnly() {
  resizeDrag.value = false;
  snapActive.value = false;
  if (resizeDragYOnly.value) {
    removeCursor('ns-resize');
  }
  resizeDragXOnly.value = false;
  resizeDragYOnly.value = false;
}

const resizeDragStart = reactive({
  x: charts[selectedChartId.value].x + charts[selectedChartId.value].width,
  y:
    charts[selectedChartId.value].y +
    charts[selectedChartId.value].height +
    HEADER_HEIGHT,
});

// @chartWidthHeightChange emit
async function updateResizeDragStart() {
  await nextTick();
  resizeDragStart.x =
    charts[selectedChartId.value].x + charts[selectedChartId.value].width;
  resizeDragStart.y =
    charts[selectedChartId.value].y +
    charts[selectedChartId.value].height +
    HEADER_HEIGHT;
}

const resizeDragXOnly = ref(false);
const resizeDragYOnly = ref(false);

// @mousemove emit
function onResizeDrag(event: MouseEvent) {
  if (!resizeDrag.value) {
    return;
  }
  if (charts[selectedChartId.value].fullWidth && !resizeDragYOnly.value) {
    charts[selectedChartId.value].fullWidth = false;
  }
  if (charts[selectedChartId.value].fullHeight && !resizeDragXOnly.value) {
    charts[selectedChartId.value].fullHeight = false;
  }
  let newChartWidth = 0;
  if (!resizeDragYOnly.value) {
    const xDiff = event.x - resizeDragStart.x;
    newChartWidth = charts[selectedChartId.value].width + xDiff;
    if (
      newChartWidth >= MIN_CHART_WIDTH &&
      newChartWidth <= maxChartWidth.value
    ) {
      charts[selectedChartId.value].width = newChartWidth;
      resizeDragStart.x = event.x;
    }
  }
  let newChartHeight = 0;
  if (!resizeDragXOnly.value) {
    const yDiff = event.y - resizeDragStart.y;
    newChartHeight = charts[selectedChartId.value].height + yDiff;
    if (
      newChartHeight >= MIN_CHART_HEIGHT &&
      newChartHeight <= maxChartHeight.value
    ) {
      charts[selectedChartId.value].height = newChartHeight;
      resizeDragStart.y = event.y;
    }
  }
  if (
    newChartHeight &&
    newChartWidth &&
    !shiftKeyActive.value &&
    newChartWidth >
      maxChartWidth.value - SNAP_PERCENTAGE * maxChartWidth.value &&
    newChartHeight >
      maxChartHeight.value - SNAP_PERCENTAGE * maxChartHeight.value
  ) {
    snapActive.value = true;
  } else {
    snapActive.value = false;
  }
}

// @mouseup emit
function stopResizeDrag() {
  if (snapActive.value && !shiftKeyActive.value) {
    charts[selectedChartId.value].fullHeight = true;
    charts[selectedChartId.value].fullWidth = true;
  }
  resetRisizeDragSnapAndDragXYOnly();
}

// @mouseleave event
function onChartsPageLeave(event: MouseEvent) {
  if (!resizeDrag.value) {
    return;
  }
  if (event.x >= maxChartWidth.value) {
    charts[selectedChartId.value].fullWidth = true;
    resizeDragXOnly.value = false;
  }
  if (event.y >= maxChartHeight.value) {
    charts[selectedChartId.value].fullHeight = true;
    resizeDragYOnly.value = false;
  }
  resizeDrag.value = false;
}

onMounted(() => {
  if (charts[selectedChartId.value].fullWidth) {
    charts[selectedChartId.value].width = maxChartWidth.value;
    resizeDragStart.x = maxChartWidth.value;
  }
  if (charts[selectedChartId.value].fullHeight) {
    charts[selectedChartId.value].height = maxChartHeight.value;
    resizeDragStart.y = maxChartHeight.value + HEADER_HEIGHT;
  }
});
</script>

<style lang="scss" scoped>
.snap-to-full {
  background-color: var(--q-accent);
  position: absolute;
  z-index: -1;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  width: calc(100% - 8px);
}

.show-shift-key-hint {
  position: absolute;
  bottom: 0;
  z-index: 10;
  left: 50%;
  text-align: center;
  background: var(--q-dark-page);
  opacity: 0.9;
  color: white;
  padding: 8px;
  border-radius: 8px;
  transform: translate(-50%, -50%);
}
</style>
