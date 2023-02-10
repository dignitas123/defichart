<template>
  <div
    class="chart-wrapper"
    :class="{
      'bg-shadow-primary': selected,
      'bg-shadow-secondary': chartWrapperShadow && !selected,
      'full-width-chart': fullWidth,
      'normal-width-chart': !fullWidth,
      'full-height-chart': fullHeight,
      'normal-height-chart': !fullHeight,
    }"
    @mouseup="stopXDrag"
    @mousemove="onYDrag"
    @mouseleave="onChartContainterLeave"
    @mouseover="chartWrapperShadow = true"
    @click="
      $emit('chartClick', id);
      selected = true;
    "
  >
    <!-- TODO: loading spinner when loading chart data -->
    <div v-if="false" class="spinner-bar-wrapper">
      <q-spinner-ios color="primary" size="xl" />
    </div>
    <div class="container" @wheel="onWheel">
      <div class="resize-area" @mousedown="$emit('resizeDrag', false, false)" />
      <div
        class="resize-area-x"
        @mousedown="$emit('resizeDrag', true, false)"
      />
      <div
        class="resize-area-y"
        @mousedown="$emit('resizeDrag', false, true)"
      />
      <div class="header-bar prevent-select">
        <HeaderBar @maximize="maximize" @close="close" />
      </div>
      <div class="price-row">
        <div class="chart" ref="chartRef">
          <CandlestickChart
            v-if="chartHeightWidthUpdated"
            :dataMaxCandlesShow="dataMaxCandlesShow"
            :dataDates="dataDates"
            v-model:datePositionEntries="datePositionEntries"
            :height="chartHeight"
            :width="chartWidth"
            :priceLines="priceLines"
            :maxCandlesShow="maxCandlesShow"
            :startingDistanceDifference="startingDistanceDifference"
            :candleH2L="candleH2L"
            :maxCandleHigh="maxCandleHigh"
            :minCandleLow="minCandleLow"
          />
        </div>
        <div>
          <PriceAxis
            :candleH2L="candleH2L"
            :maxCandleHigh="maxCandleHigh"
            :height="chartHeight"
            :width="priceAxisWidth"
            @horizontalLine="addHorizontalLineToPriceLines"
          />
        </div>
      </div>
      <div class="date-row">
        <div class="timestamps" @mousedown="startXDrag">
          <DateAxis :entries="datePositionEntries" :width="chartWidth" />
        </div>
        <div :style="`width: ${priceAxisWidth}px`">
          <ConfigBottomRight />
        </div>
      </div>
    </div>
    <q-resize-observer :debounce="0" :onResize="onResize" />
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue';
import CandlestickChart from './child-components/candlestick-chart.vue';
import HeaderBar from './child-components/header-bar.vue';
import PriceAxis from './child-components/price-axis.vue';
import ConfigBottomRight from './child-components/config-bottom-right.vue';
import DateAxis from './child-components/date-axis.vue';
import { generateData } from './helpers/fake-data-generator';
import {
  DatePositionEntry,
  OHLC,
} from 'src/pages/broker-charts/broker-charts.if';
import { usePriceChart } from 'src/pages/broker-charts/broker-charts.cp';
import { usePriceChartData } from './chart-window.cp';

const props = defineProps<{
  id: string;
  width: number;
  height: number;
  fullWidth: boolean;
  fullHeight: boolean;
}>();

const emit = defineEmits<{
  (event: 'chartClick', id: string): void;
  (event: 'resizeDrag', xOnly: boolean, yOnly: boolean): void;
  (event: 'update:width', width: number): void;
  (event: 'update:height', height: number): void;
  (event: 'update:fullWidth', fullWidth: boolean): void;
  (event: 'update:fullHeight', fullHeight: boolean): void;
}>();

const HEADER_BAR_HEIGHT = 22;
const DATEROW_HEIGHT = 22;

const maxCandlesShow = ref(40);
const data = ref<OHLC[]>([]);
const datePositionEntries = ref<DatePositionEntry[]>([]);

const {
  dataMaxCandlesShow,
  candleH2L,
  maxCandleHigh,
  minCandleLow,
  priceAxisWidth,
  inceaseMaxCandleShow,
  decreaseMaxCandleShow,
  dataDates,
  startingDistanceDifference,
} = usePriceChartData(data, maxCandlesShow);

const { maxChartHeight, maxChartWidth } = usePriceChart();

const selected = ref(false);
const chartWrapperShadow = ref(false);

const chartRef = ref<HTMLCanvasElement | null>(null);

const width = ref(props.width);
const height = ref(props.height);
const fullWidth = ref(props.fullWidth);
const fullHeight = ref(props.fullHeight);

watch(width, () => {
  emit('update:width', width.value);
});
watch(
  () => props.width,
  () => {
    width.value = props.width;
  }
);
watch(height, () => {
  emit('update:height', height.value);
});
watch(
  () => props.height,
  () => {
    height.value = props.height;
  }
);
watch(fullWidth, () => {
  emit('update:fullWidth', fullWidth.value);
});
watch(
  () => props.fullWidth,
  () => {
    fullWidth.value = props.fullWidth;
  }
);
watch(fullHeight, () => {
  emit('update:fullHeight', fullHeight.value);
});
watch(
  () => props.fullHeight,
  () => {
    fullHeight.value = props.fullHeight;
  }
);

const chartHeight = ref<undefined | number>(undefined);
const chartWidth = ref<undefined | number>(undefined);

const xDragging = ref(false);
const xDraggingStart = ref(0);

// @mouseUp emit
function stopXDrag() {
  xDragging.value = false;
}

// @mousedown emit
function startXDrag(event: MouseEvent) {
  xDragging.value = true;
  xDraggingStart.value = event.clientX;
}

// @mouseleave emit
function onChartContainterLeave() {
  xDragging.value = false;
  chartWrapperShadow.value = false;
}

// @mousemove emit
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

function updateChartHeightAndWidth() {
  chartHeight.value = chartRef.value?.clientHeight;
  chartWidth.value = chartRef.value?.clientWidth;
}

const wheelDraggingStart = ref(0);

// @wheel emit
function onWheel(event: WheelEvent) {
  let candles = 2;
  if (maxCandlesShow.value < 15) {
    candles = 1;
  }
  if (event.deltaY > wheelDraggingStart.value) {
    inceaseMaxCandleShow(candles);
    wheelDraggingStart.value = 0;
  } else if (event.deltaY < wheelDraggingStart.value) {
    decreaseMaxCandleShow(candles);
    wheelDraggingStart.value = 0;
  }
}

function onResize() {
  updateChartHeightAndWidth();
}

const chartHeightWidthUpdated = ref(false);

onMounted(async () => {
  data.value = generateData();
  await nextTick();
  updateChartHeightAndWidth();
  chartHeightWidthUpdated.value = true;
});

watch([chartHeight, chartWidth, maxCandlesShow], async () => {
  await nextTick();
  priceLines.value = [];
});

// @maximize emit
function maximize() {
  fullHeight.value = true;
  fullWidth.value = true;
  width.value = maxChartWidth.value;
  height.value = maxChartHeight.value;
}

// @close emit
function close() {
  fullHeight.value = false;
  fullWidth.value = false;
  width.value = 700;
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

  &.selected {
    border: 1px solid var(--q-secondary);
  }

  &.full-width-chart {
    width: 100%;
  }
  &.normal-width-chart {
    width: v-bind("width + 'px'");
  }

  &.full-height-chart {
    height: v-bind("maxChartHeight + 'px'");
  }

  &.normal-height-chart {
    height: v-bind("height + 'px'");
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
</style>
