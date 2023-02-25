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
    <div class="container">
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
        <HeaderBar
          :zoomedOut="zoomedOut"
          @maximize="maximize"
          @close="close"
          @zoomIn="zoomIn"
          @zoomOut="zoomOut"
        />
      </div>
      <div class="price-row">
        <div
          class="chart"
          ref="chartRef"
          @contextmenu.prevent
          @wheel="onWheel"
          @mousemove="updateMouseContainer"
          @mouseleave="onChartLeave"
        >
          <CandlestickChart
            v-if="afterMountUpdated"
            :data="data"
            :dates="dataDates"
            :candleCount="candlesShow"
            :h2l="candlesInChartH2L"
            :high="candlesInChartHigh"
            :low="candlesInChartLow"
            :height="chartHeight"
            :width="chartWidth"
            :priceLines="priceLines"
            :dateLines="dateLines"
            :viewBoxOffset="viewBoxOffset"
            :startingDistanceDifference="startingDistanceDifference"
            v-model:datePositionEntries="datePositionEntries"
            v-model:candleWidth="candleWidth"
            v-model:candleDistance="candleDistance"
            v-model:candlesticksSVGWidth="candlesticksSVGWidth"
          />
          <CrossHair v-if="crosshair.show" :x="crosshair.x" :y="crosshair.y" />
        </div>
        <div class="price-axis-wrapper">
          <PriceAxis
            :h2l="candlesInChartH2L"
            :high="candlesInChartHigh"
            :height="chartHeight"
            @horizontalLine="addHorizontalLineToPriceLines"
          />
          <q-resize-observer :debounce="0" :onResize="onPriceAxisResize" />
        </div>
      </div>
      <div class="date-row">
        <div class="timestamps" @mousedown="startXDrag">
          <DateAxis
            :selectedCandleIndex="selectedCandleIndex"
            :entries="datePositionEntries"
            :width="chartWidth"
            :candleWidth="candleWidth"
            :candleDistance="candleDistance"
            :candlesShow="candlesShow"
            :badgeShow="crosshair.show"
            :candlesticksSVGWidth="candlesticksSVGWidth"
            @verticalLines="setVerticalLines"
          />
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
import { ref, nextTick, watch, onMounted, reactive, onUnmounted } from 'vue';
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
import { useBrokerChartSizes } from 'src/pages/broker-charts/broker-charts.cp';
import { useChartData } from './chart-window.cp';
import CrossHair from './child-components/cross-hair.vue';
import { CANDLE_WICK_THICKNESS } from 'src/pages/broker-charts/consts';

const props = defineProps<{
  id: string;
  width: number;
  height: number;
  fullWidth: boolean;
  fullHeight: boolean;
  candlesShow: number;
  selected: boolean;
  offset: number;
  maxCandles: number;
}>();

const emit = defineEmits<{
  (event: 'chartClick', id: string): void;
  (event: 'resizeDrag', xOnly: boolean, yOnly: boolean): void;
  (event: 'chartWidthHeightChange'): void;
  (event: 'update:width', width: number): void;
  (event: 'update:height', height: number): void;
  (event: 'update:fullWidth', fullWidth: boolean): void;
  (event: 'update:fullHeight', fullHeight: boolean): void;
  (event: 'update:candlesShow', candles: number): void;
  (event: 'update:selected', selected: boolean): void;
  (event: 'update:offset', offset: number): void;
  (event: 'update:maxCandles', maxCandes: number): void;
}>();

const DATEROW_HEIGHT = 22;
const HEADER_BAR_HEIGHT = 22;
const PRICE_AXIS_MARGIN = 8;

const data = ref<OHLC[]>([]);
const datePositionEntries = ref<DatePositionEntry[]>([]);
const candlesticksSVGWidth = ref(0); // svg with maxData

const width = ref(props.width);
const height = ref(props.height);
const fullWidth = ref(props.fullWidth);
const fullHeight = ref(props.fullHeight);
const candlesShow = ref(props.candlesShow);
const selected = ref(props.selected);
const offset = ref(props.offset);
const maxCandles = ref(props.maxCandles);

const candleWidth = ref(0);
const candleDistance = ref(0);

const crosshair = reactive({
  x: 0,
  y: 0,
  show: false,
});

const selectedCandleIndex = ref(0);

let lastChX = 0;
// @mousemove emit (.chart)
function updateMouseContainer(event: MouseEvent) {
  if (!chartRef.value) {
    return;
  }
  crosshair.show = true;
  let newX = event.clientX - chartRef.value.getBoundingClientRect().left;
  let newCandleMidpoint = findCandleMidpoint(newX);
  if (newCandleMidpoint) {
    crosshair.x = newCandleMidpoint;
  }
  crosshair.y = event.clientY - chartRef.value.getBoundingClientRect().top;
  if (crosshair.x < 0 || crosshair.y < 0) {
    crosshair.show = false;
  }
  lastChX = newX;
}

function findCandleMidpoint(x: number) {
  let cD = candleDistance.value;
  let cW = candleWidth.value;
  let dist = cW + cD;
  let candleIndex = Math.floor(x / dist);
  let start = candleIndex * dist + cD;
  if (x > start) {
    selectedCandleIndex.value = candleIndex;
    return start + cW / 2 - CANDLE_WICK_THICKNESS / 2;
  } else {
    return 0;
  }
}

function findCandleMidpointAfterZoom(x: number) {
  if (!chartWidth.value) {
    return;
  }
  let cD = candleDistance.value;
  let cW = candleWidth.value;
  let dist = cW + cD;
  let candleIndex = Math.floor(x / dist);
  let start = candleIndex * dist + cD;
  let ret = start + cW / 2 - CANDLE_WICK_THICKNESS / 2;
  selectedCandleIndex.value = candleIndex;
  if (ret > chartWidth.value) {
    start = Math.floor((x - candleWidth.value) / (cW + cD)) * (cW + cD) + cD;
    return start + cW / 2 - CANDLE_WICK_THICKNESS / 2;
  } else {
    return ret;
  }
}

// @mouseleave emit (.chart)
function onChartLeave() {
  crosshair.show = false;
}

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

watch(candlesShow, async () => {
  await nextTick();
  emit('update:candlesShow', candlesShow.value);
  let newCandleMidpoint = findCandleMidpointAfterZoom(lastChX);
  if (newCandleMidpoint) {
    crosshair.x = newCandleMidpoint;
  }
});
watch(
  () => props.candlesShow,
  () => {
    candlesShow.value = props.candlesShow;
  }
);
watch(offset, () => {
  emit('update:offset', offset.value);
});
watch(
  () => props.offset,
  () => {
    offset.value = props.offset;
  }
);
watch(selected, () => {
  emit('update:selected', selected.value);
});
watch(
  () => props.selected,
  () => {
    selected.value = props.selected;
  }
);
watch(maxCandles, () => {
  emit('update:maxCandles', maxCandles.value);
});
watch(
  () => props.maxCandles,
  () => {
    maxCandles.value = props.maxCandles;
  }
);

window.addEventListener('keydown', onKeyDown);

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'z') {
    if (zoomedOut.value) {
      zoomIn();
    } else {
      zoomOut();
    }
  }
}

const {
  increaseCandlesShow,
  decreaseCandlesShow,
  candlesInChartH2L,
  candlesInChartHigh,
  candlesInChartLow,
  dataDates,
  startingDistanceDifference,
} = useChartData(data, maxCandles, candlesShow, offset);

const { maxChartHeight, maxChartWidth } = useBrokerChartSizes();

const chartWrapperShadow = ref(false);

const chartRef = ref<HTMLElement>();

const priceAxisWidth = ref(0);

const chartHeight = ref<number>();
const chartWidth = ref<number>();

const xDragging = ref(false);
const xDraggingStart = ref(0);

// @mouseUp emit (.chart-wrapper)
function stopXDrag() {
  xDragging.value = false;
}

// @mousedown emit (.timestamps)
function startXDrag(event: MouseEvent) {
  xDragging.value = true;
  xDraggingStart.value = event.clientX;
}

// @mouseleave emit (.chart-wrapper)
function onChartContainterLeave() {
  xDragging.value = false;
  chartWrapperShadow.value = false;
}

// @mousemove emit (.chart-wrapper)
function onYDrag(event: MouseEvent) {
  if (!xDragging.value) return;
  let candlesToIncrease = Math.ceil(candlesShow.value / 30);
  if (event.x > xDraggingStart.value && candleWidth.value > 2) {
    increaseCandlesShow(candlesToIncrease);
    xDraggingStart.value = event.x;
  } else if (event.x < xDraggingStart.value) {
    decreaseCandlesShow(candlesToIncrease);
    xDraggingStart.value = event.x;
  }
}

function updateChartHeightAndWidth(substractWidth = 0) {
  if (substractWidth > 0 && chartRef.value) {
    chartWidth.value = chartRef.value.clientWidth - substractWidth;
  } else {
    chartWidth.value = chartRef.value?.clientWidth;
    chartHeight.value = chartRef.value?.clientHeight;
  }
}

const viewBoxOffset = ref(0);

// @wheel emit
function onWheel(event: WheelEvent) {
  let candles = 2;
  if (candlesShow.value < 15) {
    candles = 1;
  } else if (candlesShow.value > 70) {
    candles = 5;
  } else if (candlesShow.value > 100) {
    candles = 10;
  } else if (candlesShow.value > 150) {
    candles = 20;
  }

  // Calculate the angle of movement
  const angle = Math.atan2(event.deltaY, event.deltaX) * 180 / Math.PI;
  const absAngle = angle < 0 ? 360 + angle : angle;

  if ((absAngle >= 45 && absAngle <= 135) || (absAngle >= 225 && absAngle <= 315)) {
    if (event.deltaY > 0 && candleWidth.value > 2) {
      increaseCandlesShow(candles);
    } else if (event.deltaY < 0) {
      decreaseCandlesShow(candles);
    }
  }
}

function onResize() {
  updateChartHeightAndWidth();
}

function onPriceAxisResize(size: { width: number; height: number }) {
  priceAxisWidth.value = size.width;
  updateChartHeightAndWidth();
}

const afterMountUpdated = ref(false);
onMounted(async () => {
  data.value = generateData();
  await nextTick();
  if (data.value.length < maxCandles.value) {
    maxCandles.value = data.value.length;
  }
  updateChartHeightAndWidth(PRICE_AXIS_MARGIN);
  afterMountUpdated.value = true;
});

watch([chartHeight, chartWidth, candlesShow, offset], async () => {
  await nextTick();
  priceLines.value = [];
});

// @maximize emit
function maximize() {
  fullHeight.value = true;
  fullWidth.value = true;
  width.value = maxChartWidth.value;
  height.value = maxChartHeight.value;
  emit('chartWidthHeightChange');
}

// @close emit
function close() {
  fullHeight.value = false;
  fullWidth.value = false;
  width.value = 700;
  emit('chartWidthHeightChange');
}

const zoomedOut = ref(false);

// @zoomIn emit
function zoomIn() {
  candlesShow.value = Math.round(props.width / 18);
  zoomedOut.value = false;
}

// @zoomOut emit
function zoomOut() {
  candlesShow.value = Math.round(props.width / 5);
  zoomedOut.value = true;
}

const priceLines = ref<number[]>([]);
const dateLines = ref<number[]>([]);

// @horizontalLine emit
function addHorizontalLineToPriceLines(price: number) {
  priceLines.value.push(price);
}

// @verticalLines emit
function setVerticalLines(lines: number[]) {
  dateLines.value = lines;
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
        cursor: crosshair;
        position: relative;
      }
    }

    .date-row {
      height: v-bind("DATEROW_HEIGHT + 'px'");
      display: flex;

      .timestamps {
        flex: 1;
        overflow: hidden;
        position: relative;

        &:hover {
          cursor: ew-resize;
        }
      }
    }
  }
}
</style>
