<template>
  <div
    class="chart-wrapper disable-dbl-tap-zoom"
    :class="{
      'bg-shadow-primary': selected,
      'bg-shadow-secondary': chartWrapperShadow && !selected,
      'full-width-chart': fullWidth,
      'normal-width-chart': !fullWidth,
      'full-height-chart': fullHeight,
      'normal-height-chart': !fullHeight,
    }"
    @mouseup="stopTimeAxisAndPriceAxisDrag"
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
          :timeFrame="timeFrame"
          @maximize="maximize"
          @close="close"
          @zoomIn="zoomIn"
          @zoomOut="zoomOut"
          @setTimeFrame="setTimeFrame"
          @setLookbackPeriod="setLookbackPeriod"
        />
      </div>
      <div class="price-row">
        <div
          class="chart"
          ref="chartRef"
          @contextmenu.prevent
          @wheel="onWheel"
          @touchstart="handleChartTouchStart"
          @touchmove="handleChartTouchMove"
          @mousemove="updateMouseContainer"
          @mouseleave="onChartLeave"
        >
          <CandlestickChart
            v-if="afterMountUpdated"
            :data="candlesInChartData"
            :dates="dataDates"
            :candleCount="candlesShow"
            :h2l="candlesInChartH2L"
            :high="candlesInChartHigh"
            :low="candlesInChartLow"
            :height="chartHeight"
            :width="chartWidth"
            :priceLines="priceLines"
            :dateLines="dateLines"
            :offset="offset"
            :startingDistanceDifference="startingDistanceDifference"
            :currentCandleOHLC="currentCandleOHLC"
            :timeFrame="timeFrame ?? INITIAL_TIME_FRAME as StandardTimeFrames"
            v-model:datePosition="datePosition"
            v-model:candleWidth="candleWidth"
            v-model:candleDistance="candleDistance"
          />
          <CrossHair v-if="crosshair.show" :x="crosshair.x" :y="crosshair.y" />
          <q-btn
            v-if="offset < 0"
            round
            size="sm"
            class="go-to-start-button"
            :class="{ 'transparent-primary-background': !goToStartButtonHover }"
            @mouseover="goToStartButtonHover = true"
            @mouseleave="goToStartButtonHover = false"
            @click="offset = 0"
            color="primary"
            icon="arrow_forward"
          />
        </div>
        <div
          class="price-axis-wrapper"
          @mousedown="startPriceAxisDrag"
          @click="registerClickOnPriceAxis"
        >
          <PriceAxis
            v-if="afterMountUpdated"
            :currentCandleClose="currentCandleOHLC?.c"
            :h2l="candlesInChartH2L"
            :high="candlesInChartHigh"
            :low="candlesInChartLow"
            :height="chartHeight"
            :crossHairY="crosshair.y"
            :badgeShow="crosshair.show"
            @horizontalLine="addHorizontalLineToPriceLines"
          />
          <q-resize-observer :debounce="0" @resize="onPriceAxisResize" />
        </div>
      </div>
      <div class="date-row">
        <div class="timestamps" @mousedown="startXDrag">
          <DateAxis
            :width="chartWidth"
            :selectedCandleIndex="selectedCandleIndex"
            :datePosition="datePosition"
            :offset="offset"
            :candleWidth="candleWidth"
            :candleDistance="candleDistance"
            :candlesShow="candlesShow"
            :badgeShow="crosshair.show"
            @verticalLines="setVerticalLines"
          />
        </div>
        <div :style="`width: ${priceAxisWidth}px`">
          <ConfigBottomRight />
        </div>
      </div>
    </div>
    <q-resize-observer :debounce="0" @resize="onResize" />
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  nextTick,
  watch,
  reactive,
  onUnmounted,
  provide,
  onMounted,
} from 'vue';
import CandlestickChart from './child-components/candlestick-chart/candlestick-chart.vue';
import HeaderBar from './child-components/header-bar/header-bar.vue';
import PriceAxis from './child-components/price-axis.vue';
import ConfigBottomRight from './child-components/config-bottom-right.vue';
import DateAxis from './child-components/date-axis.vue';
import { generateData } from './helpers/fake-data-generator';
import { DatePosition, OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { useBrokerChartSizes } from 'src/pages/broker-charts/broker-charts.cp';
import { useChartData } from './chart-window.cp';
import CrossHair from './child-components/cross-hair.vue';
import {
  CANDLE_WICK_THICKNESS,
  DATA_TICKSIZE,
  INITIAL_TIME_FRAME,
  WANTED_PX_PER_CANDLE,
  INITIAL_LOOKBACK_PERIOD,
} from 'src/pages/broker-charts/consts';
import { findNearestIndex } from 'src/shared/utils/array-functions';
import { roundToTicksize } from './helpers/digits';
import { StandardTimeFrames, TimeFrameMode } from './chart-window.if';
import {
  allowedTimeFramesEnum,
  TimeFrame,
} from './child-components/header-bar/child-components/time-frame-dropdown.if';
import {
  LookbackPeriod,
  lookbackPeriodEnum,
} from './child-components/header-bar/child-components/lookback-dropdown.if';

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
  timeFrame: TimeFrame;
  lookbackPeriod: LookbackPeriod;
}>();

const emit = defineEmits<{
  (event: 'chartClick', id: string): void;
  (event: 'resizeDrag', xOnly: boolean, yOnly: boolean): void;
  (event: 'chartWidthHeightChange'): void;
  (event: 'lookbackChanged', lookbackPeriod: LookbackPeriod): void;
  (event: 'update:width', width: number): void;
  (event: 'update:height', height: number): void;
  (event: 'update:fullWidth', fullWidth: boolean): void;
  (event: 'update:fullHeight', fullHeight: boolean): void;
  (event: 'update:candlesShow', candles: number): void;
  (event: 'update:selected', selected: boolean): void;
  (event: 'update:offset', offset: number): void;
  (event: 'update:maxCandles', maxCandes: number): void;
  (event: 'update:timeFrame', timeFrame: TimeFrame): void;
  (event: 'update:lookbackPeriod', lookbackPeriod: LookbackPeriod): void;
}>();

const DATEROW_HEIGHT = 22;
const HEADER_BAR_HEIGHT = 23;

const data = ref<OHLC[]>([]);
const datePosition = ref<DatePosition>({
  standardDateFormat: 'HH:mm',
  entries: [],
});

const width = ref(props.width);
const height = ref(props.height);
const fullWidth = ref(props.fullWidth);
const fullHeight = ref(props.fullHeight);
const candlesShow = ref(props.candlesShow);
const selected = ref(props.selected);
const offset = ref(props.offset);
const maxCandles = ref(props.maxCandles);
const timeFrame = ref(props.timeFrame);
const lookbackPeriod = ref(props.lookbackPeriod);

const candleWidth = ref(0);
const candleDistance = ref(0);

const crosshair = reactive({
  x: 0,
  y: 0,
  show: false,
});

const selectedCandleIndex = ref(0);

const goToStartButtonHover = ref(false);

let lastChX = 0;
let lastChY = 0;
// @mousemove emit (.chart)
function updateMouseContainer(event: MouseEvent) {
  if (!chartRef.value) {
    return;
  }
  let newX = event.clientX - chartRef.value.getBoundingClientRect().left;
  let newY = event.clientY - chartRef.value.getBoundingClientRect().top;
  let newCandleMidpoint = findCandleMidpoint(newX);
  let newPriceMidpoint = findPriceMidpoint(newY);
  if (newCandleMidpoint) {
    crosshair.x = newCandleMidpoint;
  }
  if (newPriceMidpoint !== undefined) {
    crosshair.y = newPriceMidpoint;
  }
  if (crosshair.x !== 0) {
    crosshair.show = true;
  }
  if (crosshair.x < 0 || crosshair.y < 0) {
    crosshair.show = false;
  }
  lastChX = newX;
  lastChY = newY;
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

function findPriceMidpoint(y: number) {
  if (!chartHeight.value || !candlesInChartH2L.value) {
    return undefined;
  }
  const scale = DATA_TICKSIZE * (chartHeight.value / candlesInChartH2L.value);
  const newY = Math.round(y / scale) * scale;
  return newY === 0 ? 0.1 : newY; // 0.1 to show it on top
}

async function findCandleMidpointAfterZoom(x: number) {
  await nextTick();
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
  crosshair.x = 0;
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
  let newCandleMidpoint = await findCandleMidpointAfterZoom(lastChX);
  let newPriceMidPoint = findPriceMidpoint(lastChY);
  if (newCandleMidpoint) {
    crosshair.x = newCandleMidpoint;
  }
  if (newPriceMidPoint) {
    crosshair.y = newPriceMidPoint;
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
watch(timeFrame, () => {
  emit('update:timeFrame', timeFrame.value);
});
watch(
  () => props.timeFrame,
  () => {
    timeFrame.value = props.timeFrame;
  }
);
watch(lookbackPeriod, () => {
  emit('update:lookbackPeriod', lookbackPeriod.value);
});
watch(
  () => props.lookbackPeriod,
  () => {
    lookbackPeriod.value = props.lookbackPeriod;
  }
);

window.addEventListener('keydown', onKeyDown);

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

const timeFrameSetByKeyboard = ref<StandardTimeFrames>();
provide('timeFrameSetByKeyboard', timeFrameSetByKeyboard);

const lookbackSetByKeyboard = ref<LookbackPeriod>();
provide('lookbackSetByKeyboard', lookbackSetByKeyboard);

function onKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target.tagName === 'INPUT') {
    return;
  }
  if (event.key === 'x') {
    zoomOut();
  } else if (event.key === 'c') {
    zoomIn();
  } else if (event.key === '1') {
    lookbackSetByKeyboard.value = '1day';
    setLookbackPeriod('1day');
  } else if (event.key === '2') {
    lookbackSetByKeyboard.value = '1week';
    setLookbackPeriod('1week');
  } else if (event.key === '3') {
    lookbackSetByKeyboard.value = '1month';
    setLookbackPeriod('1month');
  } else if (event.key === '4') {
    lookbackSetByKeyboard.value = '1quarter';
    setLookbackPeriod('1quarter');
  } else if (event.key === '5') {
    lookbackSetByKeyboard.value = '1year';
    setLookbackPeriod('1year');
  } else if (event.key === '6') {
    lookbackSetByKeyboard.value = '5year';
    setLookbackPeriod('5year');
  } else if (event.shiftKey) {
    if (event.code === 'Digit1') {
      setTimeFrame('M1');
      timeFrameSetByKeyboard.value = 'M1';
    } else if (event.code === 'Digit2') {
      setTimeFrame('M5');
      timeFrameSetByKeyboard.value = 'M5';
    } else if (event.code === 'Digit3') {
      setTimeFrame('M30');
      timeFrameSetByKeyboard.value = 'M30';
    } else if (event.code === 'Digit4') {
      setTimeFrame('H4');
      timeFrameSetByKeyboard.value = 'H4';
    } else if (event.code === 'Digit5') {
      setTimeFrame('D1');
      timeFrameSetByKeyboard.value = 'D1';
    } else if (event.code === 'Digit6') {
      setTimeFrame('W1');
      timeFrameSetByKeyboard.value = 'W1';
    }
  }
}

const candlesInChartHighScale = ref(1);
const candlesInChartLowScale = ref(1);

const {
  increaseCandlesShow,
  decreaseCandlesShow,
  candlesInChartData,
  candlesInChartH2L,
  candlesInChartHigh,
  candlesInChartLow,
  dataDates,
  startingDistanceDifference,
} = useChartData(
  data,
  maxCandles,
  candlesShow,
  offset,
  candlesInChartHighScale,
  candlesInChartLowScale
);

const { maxChartHeight, maxChartWidth } = useBrokerChartSizes();

const chartWrapperShadow = ref(false);

const chartRef = ref<HTMLElement>();

const priceAxisWidth = ref(0);

const chartHeight = ref<number>();
const chartWidth = ref<number>();

const timeAxisDrag = ref(false);
const priceAxisDrag = ref(false);
const timeAxisDraggingStart = ref(0);
const priceAxisDraggingStart = ref(0);

// @mouseUp emit (.chart-wrapper)
function stopTimeAxisAndPriceAxisDrag() {
  timeAxisDrag.value = false;
  priceAxisDrag.value = false;
}

// @mousedown emit (.timestamps)
function startXDrag(event: MouseEvent) {
  timeAxisDrag.value = true;
  timeAxisDraggingStart.value = event.clientX;
}

// @mousedown emit (.price-axis-wrapper)
function startPriceAxisDrag(event: MouseEvent) {
  priceAxisDrag.value = true;
  priceAxisDraggingStart.value = event.clientY;
}

// @mouseleave emit (.chart-wrapper)
function onChartContainterLeave() {
  timeAxisDrag.value = false;
  chartWrapperShadow.value = false;
}

const clickCount = ref(0);
const timer = ref<NodeJS.Timeout>();

function registerClickOnPriceAxis() {
  clickCount.value++;
  if (clickCount.value === 1) {
    timer.value = setTimeout(() => {
      clickCount.value = 0;
    }, 300);
  } else if (clickCount.value === 2) {
    clearTimeout(timer.value);
    clickCount.value = 0;
    handleDoubleClickOnPriceAxis();
  }
}

function handleDoubleClickOnPriceAxis() {
  candlesInChartHighScale.value = 1;
  candlesInChartLowScale.value = 1;
}

const blockPriceAxisDownDrag = ref(false);
const blockPriceAxisUpDrag = ref(false);

function calcuLateNewScale(currentScale: number, scalePercentage: number) {
  if (!candlesInChartH2L.value || !candlesInChartLow.value) {
    return 1;
  }
  const newH2LRoundedToTicksize =
    candlesInChartLow.value +
    candlesInChartH2L.value * (currentScale + scalePercentage) -
    candlesInChartLow.value;
  return newH2LRoundedToTicksize / candlesInChartH2L.value;
}

// @mousemove emit (.chart-wrapper)
function onYDrag(event: MouseEvent) {
  const scalePercentIncrease = 0.005;
  if (timeAxisDrag.value) {
    let candlesToIncrease = Math.ceil(candlesShow.value / 30);
    if (event.x > timeAxisDraggingStart.value && candleWidth.value > 2) {
      increaseCandlesShow(candlesToIncrease);
    } else if (event.x < timeAxisDraggingStart.value) {
      decreaseCandlesShow(candlesToIncrease);
    }
    timeAxisDraggingStart.value = event.x;
  }
  if (priceAxisDrag.value) {
    if (event.y > priceAxisDraggingStart.value) {
      if (candlesInChartLowScale.value < 1) {
        candlesInChartLowScale.value = calcuLateNewScale(
          candlesInChartLowScale.value,
          scalePercentIncrease
        );
        blockPriceAxisUpDrag.value = true;
        timer.value = setTimeout(() => {
          blockPriceAxisUpDrag.value = false;
        }, 1_000);
      } else if (!blockPriceAxisUpDrag.value) {
        candlesInChartHighScale.value = calcuLateNewScale(
          candlesInChartHighScale.value,
          scalePercentIncrease
        );
      }
    } else if (event.y < priceAxisDraggingStart.value) {
      if (candlesInChartHighScale.value > 1) {
        candlesInChartHighScale.value = calcuLateNewScale(
          candlesInChartHighScale.value,
          -scalePercentIncrease
        );
        blockPriceAxisDownDrag.value = true;
        timer.value = setTimeout(() => {
          blockPriceAxisDownDrag.value = false;
        }, 1_000);
      } else if (!blockPriceAxisDownDrag.value) {
        candlesInChartLowScale.value = calcuLateNewScale(
          candlesInChartLowScale.value,
          -scalePercentIncrease
        );
      }
    }
    priceAxisDraggingStart.value = event.y;
  }
}

function updateChartHeightAndWidth() {
  chartWidth.value = chartRef.value?.clientWidth;
  chartHeight.value = chartRef.value?.clientHeight;
}

function candlesChangeDependantOnCandlesShow() {
  if (candlesShow.value < 15) {
    return 1;
  } else if (candlesShow.value > 70) {
    return 5;
  } else if (candlesShow.value > 100) {
    return 10;
  } else if (candlesShow.value > 150) {
    return 20;
  } else {
    return 2;
  }
}

// @wheel emit (.chart)
function onWheel(event: WheelEvent) {
  const angle = (Math.atan2(event.deltaY, event.deltaX) * 180) / Math.PI;
  const absAngle = angle < 0 ? 360 + angle : angle;

  if (
    (absAngle >= 45 && absAngle <= 135) ||
    (absAngle >= 225 && absAngle <= 315)
  ) {
    if (event.deltaY > 0 && candleWidth.value > 2) {
      increaseCandlesShow(candlesChangeDependantOnCandlesShow());
    } else if (event.deltaY < 0) {
      decreaseCandlesShow(candlesChangeDependantOnCandlesShow());
    }
  }
}

const touchStartY = ref(0);

// @touchstart event (.chart)
function handleChartTouchStart(event: TouchEvent) {
  touchStartY.value = event.touches[0].clientY;
}

// @touchmove event (.chart)
function handleChartTouchMove(event: TouchEvent) {
  const touchEnd = event.touches[0].clientY;
  const diff = touchStartY.value - touchEnd;
  if (diff > 0 && candleWidth.value > 2) {
    increaseCandlesShow(candlesChangeDependantOnCandlesShow());
  } else if (diff < 0) {
    decreaseCandlesShow(candlesChangeDependantOnCandlesShow());
  }
  touchStartY.value = touchEnd;
}

function onResize() {
  updateChartHeightAndWidth();
}

function onPriceAxisResize(size: { width: number }) {
  priceAxisWidth.value = size.width;
  if (size.width) {
    updateChartHeightAndWidth();
  }
}

/**
 * TODO: current candle stream should set data
 * here, not the simulation of course. Can keep
 * simulation for some feature in the future
 */
const currentCandleOHLC = ref<OHLC>();

// TODO: simulates the current candle stream changes, but has to be replaced by real stream
setInterval(() => {
  if (!candlesInChartH2L.value || !currentCandleOHLC.value) {
    return;
  }
  const upDown = Math.random() >= 0.5 ? true : false;
  const random = Math.random();
  const h2l10p = candlesInChartH2L.value / 10;
  currentCandleOHLC.value.c += roundToTicksize(
    upDown ? h2l10p * random : -h2l10p * random,
    DATA_TICKSIZE
  );
}, 1_000);

watch(
  currentCandleOHLC,
  () => {
    if (!currentCandleOHLC.value) {
      return;
    }
    if (currentCandleOHLC.value.c > currentCandleOHLC.value.h) {
      currentCandleOHLC.value.h = currentCandleOHLC.value.c;
      if (currentCandleOHLC.value.h > candlesInChartHigh.value) {
        if (offset.value === 0) {
          candlesInChartHigh.value = currentCandleOHLC.value.c;
        }
        currentCandleOHLC.value.h = currentCandleOHLC.value.c;
      }
    }
    if (currentCandleOHLC.value.c < currentCandleOHLC.value.l) {
      currentCandleOHLC.value.l = currentCandleOHLC.value.c;
      if (currentCandleOHLC.value.l < candlesInChartLow.value) {
        if (offset.value === 0) {
          candlesInChartLow.value = currentCandleOHLC.value.c;
        }
        currentCandleOHLC.value.l = currentCandleOHLC.value.c;
      }
    }
  },
  { deep: true }
);

// @setTimeFrame emit (.header-bar)
function setTimeFrame(tf: TimeFrame) {
  timeFrame.value = tf;
}

// @setLookbackPeriod emit (.header-bar)
function setLookbackPeriod(period: LookbackPeriod) {
  lookbackPeriod.value = period;
  if (data.value.length > 0) {
    emit('lookbackChanged', period);
  }
}

function setInitialTimeFrameAndCandlesShow() {
  const appropriateCandles = maxChartWidth.value / WANTED_PX_PER_CANDLE;
  const appropriatePeriodInMs =
    lookbackPeriodEnum[INITIAL_LOOKBACK_PERIOD] / appropriateCandles;
  const nearestAppropriatePeriodFromAllowedTimeFramesIndex = findNearestIndex(
    appropriatePeriodInMs,
    Object.values(allowedTimeFramesEnum)
  );
  const appropriateTimeFrame = Object.keys(allowedTimeFramesEnum)[
    nearestAppropriatePeriodFromAllowedTimeFramesIndex
  ];
  candlesShow.value = Math.round(appropriateCandles);
  timeFrame.value = appropriateTimeFrame as TimeFrame;
}

const afterMountUpdated = ref(false);
onMounted(async () => {
  setInitialTimeFrameAndCandlesShow();
  await generateChart();
  afterMountUpdated.value = true;
});

async function generateChart() {
  if (!timeFrame.value || !lookbackPeriod.value) {
    return;
  }
  // TODO: data have to come from graqphql query result
  const timeMode = timeFrame.value.charAt(0) as TimeFrameMode;
  const timeModeCount = Number(timeFrame.value.substring(1));
  data.value = generateData(timeMode, timeModeCount);
  if (data.value.length <= 0) {
    return;
  }
  const lastCandleOHLC = data.value.slice(-1)[0];

  // TODO: last Date has t o come from current candle + TimeFrame Minute/Hour etc.
  const lastDate = new Date(lastCandleOHLC.d);
  if (timeMode === 'M') {
    lastDate.setMinutes(lastDate.getMinutes() + timeModeCount);
  } else if (timeMode === 'H') {
    lastDate.setHours(lastDate.getHours() + timeModeCount);
  } else if (timeMode === 'D') {
    lastDate.setDate(lastDate.getDate() + timeModeCount);
  } else if (timeMode === 'W') {
    lastDate.setDate(lastDate.getDate() + timeModeCount * 7);
  }

  // TODO: this first mockdata has to be replaced with the current candle stream,
  // both have to be loaded first / then the chart can be displayed
  const lastCandleRawMock = {
    o: lastCandleOHLC.c,
    h: lastCandleOHLC.c,
    l: lastCandleOHLC.c,
    c: lastCandleOHLC.c,
    d: new Date(lastDate),
    v: 0,
  };
  currentCandleOHLC.value = lastCandleRawMock;
  data.value.push(currentCandleOHLC.value);

  await nextTick();
  if (data.value.length < maxCandles.value) {
    maxCandles.value = data.value.length;
  }
}

watch(timeFrame, async () => {
  await generateChart();
});

watch(
  [chartHeight, candlesShow, offset, candlesInChartHigh, candlesInChartLow],
  async () => {
    await nextTick();
    priceLines.value = [];
  }
);

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
  width.value = 500;
  height.value = 500;
  emit('chartWidthHeightChange');
}

// ZOOM_LEVELS[0] means zoomed in the most (ratio between width and how many candles are shown)
const ZOOM_LEVELS = [103, 21, 9, 4];

function getZoomLevel() {
  const currentZoomedlevel = props.width / candlesShow.value;
  return ZOOM_LEVELS[findNearestIndex(currentZoomedlevel, ZOOM_LEVELS)];
}

// @zoomIn emit
function zoomIn() {
  const currentZoomedlevelIndex = ZOOM_LEVELS.findIndex(
    (level) => level === getZoomLevel()
  );
  if (currentZoomedlevelIndex - 1 >= 0) {
    candlesShow.value = Math.round(
      props.width / ZOOM_LEVELS[currentZoomedlevelIndex - 1]
    );
  }
}

// @zoomOut emit
function zoomOut() {
  const currentZoomedlevelIndex = ZOOM_LEVELS.findIndex(
    (level) => level === getZoomLevel()
  );
  if (currentZoomedlevelIndex + 1 < ZOOM_LEVELS.length) {
    candlesShow.value = Math.round(
      props.width / ZOOM_LEVELS[currentZoomedlevelIndex + 1]
    );
  }
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

        .go-to-start-button {
          z-index: 20;
          position: absolute;
          bottom: 4px;
          right: 4px;
        }
      }

      .price-axis-wrapper {
        overflow: hidden;
        cursor: ns-resize;
      }
    }

    .date-row {
      height: v-bind("DATEROW_HEIGHT + 'px'");
      display: flex;

      .timestamps {
        flex: 1;
        overflow: hidden;
        position: relative;
        cursor: ew-resize;
      }
    }
  }
}
</style>
