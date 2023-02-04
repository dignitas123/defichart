<template>
  <q-page class="q-pa-xs"
    @mouseup="stopResizeDrag"
    @mousemove="onResizeDrag">
  <div
    class="chart-wrapper"
    :class="{'bg-shadow': chartWrapperShadow}"
    :style="`height: ${
      _fullScreen
        ? $q.screen.height - HEADER_HEIGHT - INDEX_PAGE_PADDING + 'px'
        : _height + 'px'
    }; width: ${_fullScreen ? '100%' : _width + 'px'}`"
    @mouseup="stopXDrag"
    @mousemove="onXDrag"
    @mouseleave="onChartContainterLeave"
    @mouseover="chartWrapperShadow = true"
  >
    <!-- TODO: loading spinner when loading chart data -->
    <div v-if="false" class="spinner-bar-wrapper">
      <q-spinner-ios color="primary" size="xl" />
    </div>
    <div class="container" @wheel="onWheel">
      <div class="resize-area"
        @mousedown="startOnResizeDrag"
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
</q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, withDefaults, nextTick, watch, reactive } from 'vue';
import CandlestickChart from './components/candlestick-chart.vue';
import HeaderBar from './components/header-bar.vue';
import { usePriceChartData } from 'src/components/price-chart/price-chart.model';
import PriceAxis from './components/price-axis.vue';
import ConfigBottomRight from './components/config-bottom-right.vue';
import DateAxis from './components/date-axis.vue';

interface ChartWrapperProps {
  height?: number;
  width?: number;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<ChartWrapperProps>(), {
  height: 600,
  width: 700,
  fullScreen: true,
});

const HEADER_HEIGHT = 32;
const INDEX_PAGE_PADDING = 2 * 4;
const MIN_CHART_HEIGHT = 300;
const MIN_CHART_WIDTH = 300;

const {
  setData,
  priceAxisWidth,
  maxCandlesShow,
  inceaseMaxCandleShow,
  decreaseMaxCandleShow,
} = usePriceChartData();

setData(generateData());

const $q = useQuasar();

const chartRef = ref<HTMLCanvasElement | null>(null);

const chartWrapperShadow = ref(false);

const _height = ref(props.height);
const _width = ref(props.width);

const _fullScreen = ref(false);

const chartHeight = ref<undefined | number>(undefined);
const chartWidth = ref<undefined | number>(undefined);

const xDragging = ref(false);
const xDraggingStart = ref(0);

function startXDrag(event: MouseEvent) {
  xDragging.value = true;
  xDraggingStart.value = event.clientX;
}

function onChartContainterLeave() {
  xDragging.value = false;
  chartWrapperShadow.value = false;
}

function onXDrag(event: MouseEvent) {
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

function stopXDrag() {
  xDragging.value = false;
}

const resizeDrag = ref(false);
const resizeDragStart = reactive({
  x: 0,
  y: 0
});

console.log('resizeDragStart', resizeDragStart, _width.value, _height.value);

function startOnResizeDrag() {
  resizeDrag.value = true;
}

function stopResizeDrag() {
  resizeDrag.value = false;
}

function onResizeDrag(event: MouseEvent) {
  if(!resizeDrag.value) {
    return;
  }
  if(!resizeDragStart.x || !resizeDragStart.y) {
    resizeDragStart.x = event.x;
    resizeDragStart.y = event.y;
    return;
  }
  const xDiff = event.x - resizeDragStart.x;
  const newChartWidth = _width.value + xDiff;
  if(newChartWidth >= MIN_CHART_WIDTH) {
    _width.value = newChartWidth;
    resizeDragStart.x = event.x;
  }
  const yDiff = event.y - resizeDragStart.y;
  const newChartHeight = _height.value + yDiff;
  if(newChartHeight >= MIN_CHART_HEIGHT) {
    _height.value = newChartHeight;
    resizeDragStart.y = event.y;
  }
}

function updateChartHeightAndWidth() {
  chartHeight.value = chartRef.value?.clientHeight;
  chartWidth.value = chartRef.value?.clientWidth;
}

const wheelDragginStart = ref(0);

function onWheel(event: WheelEvent) {
  let candleToIncrease = 2;
  if (maxCandlesShow.value < 15) {
    candleToIncrease = 1;
  }
  if (event.deltaY > wheelDragginStart.value) {
    inceaseMaxCandleShow(candleToIncrease);
    wheelDragginStart.value = 0;
  } else if (event.deltaY < wheelDragginStart.value) {
    decreaseMaxCandleShow(candleToIncrease);
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
  _fullScreen.value = true;
}

function close() {
  _width.value = 700;
  _fullScreen.value = false;
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

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;

    .resize-area {
      position: absolute;
      bottom: -8px;
      right: -8px;
      width: 25px;
      height: 25px;
      &:hover {
        cursor: nwse-resize;
      }
    }

    .header-bar {
      display: flex;
      height: 22px;
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
      height: 22px;
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
</style>
