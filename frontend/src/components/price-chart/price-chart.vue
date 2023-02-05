<template>
  <q-page
    class="q-pa-xs"
    @mouseup="stopResizeDrag"
    @mousemove="onResizeDrag"
    @mouseleave="onChartsPageLeave"
    @keyup.shift="handleKeyUp"
    @keydown.shift="handleKeyDown"
  >
    <div
      class="chart-wrapper normal-bg-shadow"
      :class="{
        'bg-shadow': chartWrapperShadow,
        'full-width-chart': _fullWidthScreen,
        'normal-width-chart': !_fullWidthScreen,
        'full-height-chart': _fullHeightScreen,
        'normal-height-chart': !_fullHeightScreen,
      }"
      @mouseup="stopXDrag"
      @mousemove="onYDrag"
      @mouseleave="onChartContainterLeave"
      @mouseover="chartWrapperShadow = true"
    >
      <!-- TODO: loading spinner when loading chart data -->
      <div v-if="false" class="spinner-bar-wrapper">
        <q-spinner-ios color="primary" size="xl" />
      </div>
      <div class="container" @wheel="onWheel">
        <div class="resize-area" @mousedown="resizeDrag = true" />
        <div
          class="resize-area-x"
          @mousedown="
            resizeDragXOnly = true;
            resizeDrag = true;
          "
        />
        <div
          class="resize-area-y"
          @mousedown="
            resizeDragYOnly = true;
            resizeDrag = true;
          "
        />
        <div class="header-bar prevent-select">
          <HeaderBar @maximize="maximize" @close="close" />
        </div>
        <div class="price-row">
          <div class="chart" ref="chartRef">
            <CandlestickChart
              :height="chartHeight"
              :width="chartWidth"
              :priceLines="priceLines"
            />
          </div>
          <div>
            <PriceAxis
              :height="chartHeight"
              :width="priceAxisWidth"
              @horizontalLine="addHorizontalLineToPriceLines"
            />
          </div>
        </div>
        <div class="date-row">
          <div class="timestamps" @mousedown="startXDrag">
            <DateAxis :width="chartWidth" />
          </div>
          <div :style="`width: ${priceAxisWidth}px`">
            <ConfigBottomRight />
          </div>
        </div>
      </div>
      <q-resize-observer :debounce="0" :onResize="onResize" />
    </div>
    <div v-if="snapActive && !shiftKeyActive" class="snap-to-full" />
    <div v-if="snapActive && !shiftKeyActive" class="show-shift-key-hint">
      You can hold shift ⇧ to deactivate Snap Mode
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import {
  ref,
  withDefaults,
  nextTick,
  watch,
  reactive,
  computed,
  onUnmounted,
} from 'vue';
import CandlestickChart from './components/candlestick-chart.vue';
import HeaderBar from './components/header-bar.vue';
import { usePriceChartData } from 'src/components/price-chart/price-chart.model';
import PriceAxis from './components/price-axis.vue';
import ConfigBottomRight from './components/config-bottom-right.vue';
import DateAxis from './components/date-axis.vue';

interface ChartWrapperProps {
  height?: number;
  width?: number;
}

const props = withDefaults(defineProps<ChartWrapperProps>(), {
  height: 500,
  width: 500,
});

const HEADER_HEIGHT = 32;
const PAGE_PADDING = 4;
const MIN_CHART_HEIGHT = 300;
const MIN_CHART_WIDTH = 300;
const SNAP_PERCENTAGE = 0.05;
const HEADER_BAR_HEIGHT = 22;
const DATEROW_HEIGHT = 22;

const {
  setData,
  priceAxisWidth,
  maxCandlesShow,
  inceaseMaxCandleShow,
  decreaseMaxCandleShow,
} = usePriceChartData();

setData(generateData());

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

const $q = useQuasar();

const chartRef = ref<HTMLCanvasElement | null>(null);

const chartWrapperShadow = ref(false);

const _height = ref(props.height);
const _width = ref(props.width);

const _fullHeightScreen = ref(false);
const _fullWidthScreen = ref(false);

const chartHeight = ref<undefined | number>(undefined);
const chartWidth = ref<undefined | number>(undefined);

const xDragging = ref(false);
const xDraggingStart = ref(0);

const maxChartHeight = computed(() => {
  return $q.screen.height - HEADER_HEIGHT - PAGE_PADDING * 2;
});

const maxChartWidth = computed(() => {
  return $q.screen.width - PAGE_PADDING * 2;
});

function startXDrag(event: MouseEvent) {
  xDragging.value = true;
  xDraggingStart.value = event.clientX;
}

function onChartContainterLeave() {
  xDragging.value = false;
  chartWrapperShadow.value = false;
}

function onYDrag(event: MouseEvent) {
  if (!xDragging.value) return;
  let candlesToIncrease = Math.ceil(maxCandlesShow.value / 30);
  if (event.x > xDraggingStart.value) {
    inceaseMaxCandleShow(candlesToIncrease);
    xDraggingStart.value = event.x;
  } else if (event.x < xDraggingStart.value) {
    decreaseMaxCandleShow(candlesToIncrease);
    xDraggingStart.value = event.x;
  }
}

const snapActive = ref(false);
const shiftKeyActive = ref(false);

function handleKeyDown(event: KeyboardEvent) {
  if (event.shiftKey) {
    shiftKeyActive.value = true;
  }
}

function handleKeyUp() {
  shiftKeyActive.value = false;
}

function stopXDrag() {
  xDragging.value = false;
}

const resizeDrag = ref(false);
const resizeDragXOnly = ref(false);
const resizeDragYOnly = ref(false);

const resizeDragStart = reactive({
  x: 0,
  y: 0,
});

function stopResizeDrag() {
  if (snapActive.value) {
    _fullHeightScreen.value = true;
    _fullWidthScreen.value = true;
  }
  resizeDrag.value = false;
  snapActive.value = false;
  resizeDragXOnly.value = false;
  resizeDragYOnly.value = false;
}

function onResizeDrag(event: MouseEvent) {
  if (!resizeDrag.value) {
    return;
  }
  if (!resizeDragStart.x && !resizeDragYOnly.value) {
    resizeDragStart.x = event.x;
    return;
  }
  if (!resizeDragStart.y && !resizeDragXOnly.value) {
    resizeDragStart.y = event.y;
    return;
  }
  if (_fullWidthScreen.value && !resizeDragYOnly.value) {
    _fullWidthScreen.value = false;
  }
  if (_fullHeightScreen.value && !resizeDragXOnly.value) {
    _fullHeightScreen.value = false;
  }
  let newChartWidth = 0;
  let newChartHeight = 0;
  if (!resizeDragYOnly.value) {
    const xDiff = event.x - resizeDragStart.x;
    newChartWidth = _width.value + xDiff;
    if (
      newChartWidth >= MIN_CHART_WIDTH &&
      newChartWidth <= maxChartWidth.value
    ) {
      _width.value = newChartWidth;
      resizeDragStart.x = event.x;
    }
  }
  if (!resizeDragXOnly.value) {
    const yDiff = event.y - resizeDragStart.y;
    newChartHeight = _height.value + yDiff;
    if (
      newChartHeight >= MIN_CHART_HEIGHT &&
      newChartHeight <= maxChartHeight.value
    ) {
      _height.value = newChartHeight;
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

function onChartsPageLeave(event: MouseEvent) {
  if (!resizeDrag.value) {
    return;
  }
  if (event.x >= maxChartWidth.value) {
    _fullWidthScreen.value = true;
    resizeDragXOnly.value = false;
  }
  if (event.y >= maxChartHeight.value) {
    _fullHeightScreen.value = true;
    resizeDragYOnly.value = false;
  }
  resizeDrag.value = false;
}

function updateChartHeightAndWidth() {
  chartHeight.value = chartRef.value?.clientHeight;
  chartWidth.value = chartRef.value?.clientWidth;
}

const wheelDragginStart = ref(0);

function onWheel(event: WheelEvent) {
  let candles = 2;
  if (maxCandlesShow.value < 15) {
    candles = 1;
  }
  if (event.deltaY > wheelDragginStart.value) {
    inceaseMaxCandleShow(candles);
    wheelDragginStart.value = 0;
  } else if (event.deltaY < wheelDragginStart.value) {
    decreaseMaxCandleShow(candles);
    wheelDragginStart.value = 0;
  }
}

function generateData() {
  const data = [];
  let o = 100;
  let currentDate = new Date();
  for (let i = 0; i < 400; i++) {
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    const d = new Date(currentDate);
    const h = o + Math.random() * 5;
    let l = o - Math.random() * 5;
    let c = o + Math.random() * 5 - Math.random() * 5;
    const v = Math.random();
    if (l > c) {
      l = c;
    }
    if (c > h) {
      c = h;
    }
    data.push({ d, o, h, l, c, v });
    o = c;
  }
  return data;
}

function onResize() {
  updateChartHeightAndWidth();
}

watch([chartHeight, chartWidth, maxCandlesShow], async () => {
  await nextTick();
  priceLines.value = [];
});

function maximize() {
  _fullHeightScreen.value = true;
  _fullWidthScreen.value = true;
  _width.value = maxChartWidth.value;
  _height.value = maxChartHeight.value;
}

function close() {
  _width.value = 700;
  _fullHeightScreen.value = false;
  _fullWidthScreen.value = false;
}

const priceLines = ref<number[]>([]);

// @horizontalLine emit
function addHorizontalLineToPriceLines(price: number) {
  priceLines.value.push(price);
}
</script>

<style lang="scss" scoped>
.chart-wrapper {
  border: 1px solid var(--q-primary);
  // border-radius: 3px; // TODO: not sure if should have border radius

  &.full-width-chart {
    width: 100%;
  }
  &.normal-width-chart {
    width: v-bind("_width + 'px'");
  }

  &.full-height-chart {
    height: v-bind("maxChartHeight + 'px'");
  }

  &.normal-height-chart {
    height: v-bind("_height + 'px'");
  }

  .container {
    background-color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;

    .resize-area {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 25px;
      height: 25px;
      cursor: nwse-resize;
    }

    .resize-area-x {
      position: absolute;
      top: 0;
      bottom: -4px;
      right: -4px;
      width: 8px;
      height: calc(100% - #{v-bind("DATEROW_HEIGHT + 'px'")});
      cursor: ew-resize;
    }

    .resize-area-y {
      position: absolute;
      bottom: -4px;
      width: calc(100% - 25px);
      height: 8px;
      cursor: ns-resize;
    }

    .header-bar {
      display: flex;
      height: v-bind("HEADER_BAR_HEIGHT + 'px'");
      flex-direction: column;
    }

    .price-row {
      flex: 1;
      display: flex;
      height: 0;

      .chart {
        flex: 1;
        height: 100%;
      }
    }

    .date-row {
      height: v-bind("DATEROW_HEIGHT + 'px'");
      display: flex;

      .timestamps {
        flex: 1;
        &:hover {
          cursor: ew-resize;
        }
      }
    }
  }
}

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
