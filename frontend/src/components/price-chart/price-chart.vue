<template>
  <div
    class="chart-wrapper"
    :style="`height: ${
      _fullScreen
        ? $q.screen.height - HEADER_HEIGHT - INDEX_PAGE_PADDING + 'px'
        : _height + 'px'
    }; width: ${_fullScreen ? '100%' : _width + 'px'}`"
    @mouseup="stopXDrag"
    @mousemove="onXDrag"
  >
    <!-- TODO: loading spinner when loading chart data -->
    <div v-if="false" class="spinner-bar-wrapper">
      <q-spinner-ios color="primary" size="xl" />
    </div>
    <div class="container" @wheel="onWheel">
      <div class="header-bar">
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
        <div class="config-corner">
          <ConfigBottomRight />
        </div>
      </div>
    </div>
    <q-resize-observer :debounce="0" :onResize="onResize" />
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, withDefaults, nextTick, computed, watch } from 'vue';
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

const _height = ref(props.height);
const _width = ref(props.width);

const _fullScreen = ref(true);

const chartHeight = ref<undefined | number>(undefined);
const chartWidth = ref<undefined | number>(undefined);

const xDragging = ref(false);
const xDraggingStart = ref(0);

function startXDrag(event: MouseEvent) {
  xDragging.value = true;
  xDraggingStart.value = event.clientX;
}

function onXDrag(event: MouseEvent) {
  if (!xDragging.value) return;
  if (event.clientX > xDraggingStart.value + 5) {
    inceaseMaxCandleShow(2);
    xDraggingStart.value = event.clientX;
  } else if (event.clientX < xDraggingStart.value - 5) {
    decreaseMaxCandleShow(2);
    xDraggingStart.value = event.clientX;
  }
}

function stopXDrag() {
  xDragging.value = false;
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

const priceAxisWidthInPx = computed(() => {
  if (!priceAxisWidth.value) return undefined;
  return priceAxisWidth.value + 'px';
});
</script>

<style lang="scss" scoped>
$price-axis-width: v-bind('priceAxisWidthInPx');

.chart-wrapper {
  border: 1px solid var(--q-primary);
  border-radius: 3px;

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;

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
        width: calc(100% - #{$price-axis-width});
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

      .config-corner {
        width: $price-axis-width;
      }
    }
  }
}
</style>
