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
      <div
        v-if="!data && ohlcvLoading"
        class="price-row flex items-center justify-center"
        ref="chartRef"
      >
        <q-spinner-facebook color="secondary" size="xl" />
      </div>
      <div
        class="price-row flex items-center justify-center"
        ref="chartRef"
        v-else-if="ohlcvError || !data"
      >
        <div class="column items-center q-px-lg">
          <div class="col">Backend not reachable. Try again later.</div>
        </div>
      </div>
      <div v-else class="price-row">
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
            :data="candlesInChartData"
            :dates="dataDatesCandlesInChart"
            :candleCount="candlesShow"
            :h2l="chartH2L"
            :high="chartHigh"
            :low="chartLow"
            :height="chartHeight"
            :width="chartWidth"
            :priceLines="priceLines"
            :dateLines="dateLines"
            :offset="offset"
            :startingDistanceDifference="startingDistanceDifference"
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
            :currentCandleClose="currentCandleClose"
            :h2l="chartH2L"
            :high="chartHigh"
            :low="chartLow"
            :height="chartHeight"
            :crossHairY="crosshair.y"
            :badgeShow="crosshair.show"
            @horizontalLine="addHorizontalLineToPriceLines"
          />
          <q-resize-observer :debounce="0" @resize="onPriceAxisResize" />
        </div>
      </div>
      <div v-if="!ohlcvError && data" class="date-row">
        <div
          class="timestamps"
          @mousedown="startXDrag"
          @click="registerClickOnDateAxis"
        >
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
      <div v-else class="date-row">
        <div class="timestamps">
          <span style="width: 80px" />
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
  computed,
  onMounted,
} from 'vue';
import CandlestickChart from './child-components/candlestick-chart/candlestick-chart.vue';
import HeaderBar from './child-components/header-bar/header-bar.vue';
import PriceAxis from './child-components/price-axis.vue';
import ConfigBottomRight from './child-components/config-bottom-right.vue';
import DateAxis from './child-components/date-axis.vue';
// import { generateData } from './helpers/fake-data-generator'; TODO: use in playground to test chart related things
import {
  DatePosition,
  OHLC,
  AssetPair,
  Broker,
} from 'src/pages/broker-charts/broker-charts.if';
import { useBrokerChartSizes } from 'src/pages/broker-charts/broker-charts.cp';
import { useChartData } from './chart-window.cp';
import CrossHair from './child-components/cross-hair.vue';
import {
  CANDLE_WICK_THICKNESS,
  DATA_TICKSIZE,
  INITIAL_TIME_FRAME,
  WANTED_PX_PER_CANDLE,
  INITIAL_LOOKBACK_PERIOD,
  DAY,
  MIN,
  HOUR,
  WEEK,
  MONTH,
  YEAR,
  MAX_CANDLES_LOAD,
} from 'src/pages/broker-charts/consts';
import { findNearestIndex } from 'src/shared/utils/array-functions';
import { StandardTimeFrames, TimeFrameMode } from './chart-window.if';
import {
  allowedTimeFramesEnum,
  TimeFrame,
} from './child-components/header-bar/child-components/time-frame-dropdown.if';
import {
  LookbackPeriod,
  lookbackPeriodEnum,
  LookbackPeriodString,
} from './child-components/header-bar/child-components/lookback-dropdown.if';
import { useLazyQuery } from '@vue/apollo-composable';
import { getTimeFrameQuery } from 'src/apollo/timeFrame.query';
import { GetTimeFrameQuery } from 'src/generated/graphql';
import { timeFrameAggregate } from './helpers/timeframe-aggregate';
import { getTimeFrameInMs } from './time-frame-fns';

const props = defineProps<{
  id: string;
  symbol: AssetPair;
  broker: Broker;
  width: number;
  height: number;
  fullWidth: boolean;
  fullHeight: boolean;
  candlesShow: number;
  selected: boolean;
  offset: number;
  timeFrame: TimeFrame;
  lookbackPeriod: LookbackPeriodString;
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
  (event: 'update:timeFrame', timeFrame: TimeFrame): void;
  (event: 'update:lookbackPeriod', lookbackPeriod: LookbackPeriodString): void;
}>();

const DATEROW_HEIGHT = 22;
const HEADER_BAR_HEIGHT = 23;

const data = ref<OHLC[] | undefined>();
const dataRecordsAmount = ref(0);

const datePosition = ref<DatePosition>({
  standardDateFormat: 'HH:mm',
  entries: [],
});

const {
  loading: ohlcvLoading,
  error: ohlcvError,
  result: ohlcvResult,
  load: loadOhlcvQuery,
} = useLazyQuery<GetTimeFrameQuery>(getTimeFrameQuery);

const previousTimeFrame = ref<TimeFrame>();
const startShift = ref(0);
function executeTimeFrameQuery(_startShift = 0) {
  startShift.value = _startShift;
  let timeFrameForQuery = timeFrame.value;
  if (timeFrame.value !== 'M5') {
    timeFrameForQuery = `${timeFrameMode.value}1`;
  }
  if (timeFrameMode.value === 'M' && timeModeCount.value > 5) {
    timeFrameForQuery = 'M5';
    if (previousTimeFrame.value === 'M5') {
      setCandleDataValuesAndMergeWithOldDate();
    }
  }
  const ohlcvQueryVariables = {
    symbol: `${props.symbol}-${props.broker}`,
    timeFrame: timeFrameForQuery,
    binAmount: MAX_CANDLES_LOAD,
    ...(_startShift && { startShift: startShift }),
  };
  loadOhlcvQuery(getTimeFrameQuery, ohlcvQueryVariables);

  previousTimeFrame.value = timeFrame.value;
}

onMounted(async () => {
  // INFO: if no candlesShow in user settings
  if (candlesShow.value === 0 && chartWidth.value) {
    candlesShow.value = calculateAppropriateCandlesBasedOnChartWidth(
      chartWidth.value
    );
  }
  executeTimeFrameQuery();
});

watch(ohlcvResult, async () => {
  setCandleDataValuesAndMergeWithOldDate();
});

function setCandleDataValuesAndMergeWithOldDate() {
  if (ohlcvResult.value) {
    setCandleDataValues(startShift.value, data.value && [...data.value]);
  }
}

const currentCandleClose = computed(() => {
  return data.value?.length ? data.value[data.value.length - 1].c : 0;
});

async function setCandleDataValues(
  startShift = 0,
  oldOHLCData: OHLC[] | undefined
) {
  if (!ohlcvResult.value) {
    return;
  }
  const timeFrameRecords = ohlcvResult.value.timeFrameRecords
    ? [...ohlcvResult.value.timeFrameRecords]
    : undefined;
  const reversedRecords = timeFrameRecords?.reverse();
  const oldOHLCDataOldestRecord = oldOHLCData && oldOHLCData[0];
  if (timeModeCount.value > 1 && timeFrame.value !== 'M5') {
    if (startShift > 0) {
      const newAggregatedRecords = timeFrameAggregate(
        reversedRecords,
        timeFrameMode.value,
        timeModeCount.value,
        dataRecordsAmount.value,
        oldOHLCDataOldestRecord
      );
      if (!oldOHLCData || !newAggregatedRecords) {
        return;
      }
      data.value = [...newAggregatedRecords, ...oldOHLCData];
      dataRecordsAmount.value += reversedRecords?.length ?? 0;
    } else {
      const timeFrameAggregateRecords = timeFrameAggregate(
        reversedRecords,
        timeFrameMode.value,
        timeModeCount.value,
        dataRecordsAmount.value,
        oldOHLCDataOldestRecord
      );
      data.value = timeFrameAggregateRecords;
      dataRecordsAmount.value += reversedRecords?.length ?? 0;
    }
  } else {
    const ohlcData: OHLC[] = [];
    if (reversedRecords) {
      const oldestRecord =
        reversedRecords[reversedRecords.length - 1]?.timestamp ?? 0;
      const newestRecord = reversedRecords[0]?.timestamp ?? 0;
      const timeStep = getTimeFrameInMs(timeFrame.value) ?? MIN;
      let candleTimeStamp = newestRecord + timeStep;

      const newestRecordTimestamp =
        oldOHLCDataOldestRecord && dataRecordsAmount.value
          ? oldOHLCDataOldestRecord.d.getTime()
          : oldestRecord;

      ohlcData.push({
        o: reversedRecords[0]?.open ?? 0,
        h: reversedRecords[0]?.high ?? 0,
        l: reversedRecords[0]?.low ?? 0,
        c: reversedRecords[0]?.close ?? 0,
        v: reversedRecords[0]?.volume ?? 0,
        d: new Date(reversedRecords[0]?.timestamp ?? 0),
      });

      let j = 1;
      while (candleTimeStamp <= newestRecordTimestamp) {
        if (reversedRecords[j]?.timestamp === candleTimeStamp) {
          ohlcData.push({
            o: reversedRecords[j]?.open ?? 0,
            h: reversedRecords[j]?.high ?? 0,
            l: reversedRecords[j]?.low ?? 0,
            c: reversedRecords[j]?.close ?? 0,
            v: reversedRecords[j]?.volume ?? 0,
            d: new Date(reversedRecords[j]?.timestamp ?? 0),
          });
          j++;
        } else if (ohlcData.length > 0) {
          const previousCandle = ohlcData[ohlcData.length - 1];
          ohlcData.push({
            o: previousCandle.c,
            h: previousCandle.c,
            l: previousCandle.c,
            c: previousCandle.c,
            v: 0,
            d: new Date(candleTimeStamp),
          });
        }
        candleTimeStamp += timeStep;
      }
    }
    if (startShift > 0) {
      if (!oldOHLCData) {
        return;
      }
      data.value = [...ohlcData, ...oldOHLCData];
      dataRecordsAmount.value += reversedRecords?.length ?? 0;
    } else {
      data.value = ohlcData;
      dataRecordsAmount.value += reversedRecords?.length ?? 0;
    }
  }
  // data.value = generateData('W', 1); // TODO: activate fake Generation in dev mode playgound
  await nextTick();
  if (!data.value || !data.value.length) {
    return;
  }
  calculateAndSetlookbackNumber();
  startCurrentCandleStream();
}

const width = ref(props.width);
const height = ref(props.height);
const fullWidth = ref(props.fullWidth);
const fullHeight = ref(props.fullHeight);
const candlesShow = ref(props.candlesShow);
const selected = ref(props.selected);
const offset = ref(props.offset);
const timeFrame = ref(props.timeFrame);
const lookbackPeriod = ref(props.lookbackPeriod);

const initialCandlesShow = ref(0);

const timeFrameMode = computed(() => {
  return timeFrame.value.charAt(0) as TimeFrameMode;
});
const timeModeCount = computed(() => {
  return Number(timeFrame.value.substring(1));
});

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
  if (!chartHeight.value || !chartH2L.value) {
    return undefined;
  }
  const scale = DATA_TICKSIZE * (chartHeight.value / chartH2L.value);
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
  calculateAndSetlookbackNumber();
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
watch(timeFrame, async () => {
  emit('update:timeFrame', timeFrame.value);
  dataRecordsAmount.value = 0;
  executeTimeFrameQuery();
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

const timeFrameSetByUser = ref<StandardTimeFrames>();
provide('timeFrameSetByUser', timeFrameSetByUser);

const lookbackSetByUser = ref<LookbackPeriod>();
provide('lookbackSetByUser', lookbackSetByUser);

const lookbackNumber = ref(1);
provide('lookbackNumber', lookbackNumber);
const lookbackPeriodString = ref<LookbackPeriodString>(INITIAL_LOOKBACK_PERIOD);
provide('lookbackPeriodString', lookbackPeriodString);

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
    lookbackSetByUser.value = '1day';
    setLookbackPeriod('1day');
  } else if (event.key === '2') {
    lookbackSetByUser.value = '1week';
    setLookbackPeriod('1week');
  } else if (event.key === '3') {
    lookbackSetByUser.value = '1month';
    setLookbackPeriod('1month');
  } else if (event.key === '4') {
    lookbackSetByUser.value = '1quarter';
    setLookbackPeriod('1quarter');
  } else if (event.key === '5') {
    lookbackSetByUser.value = '1year';
    setLookbackPeriod('1year');
  } else if (event.key === '6') {
    lookbackSetByUser.value = '5year';
    setLookbackPeriod('5year');
  } else if (event.shiftKey) {
    if (event.code === 'Digit1') {
      setTimeFrame('M1');
      timeFrameSetByUser.value = 'M1';
    } else if (event.code === 'Digit2') {
      setTimeFrame('M5');
      timeFrameSetByUser.value = 'M5';
    } else if (event.code === 'Digit3') {
      setTimeFrame('H1');
      timeFrameSetByUser.value = 'H1';
    } else if (event.code === 'Digit4') {
      setTimeFrame('D1');
      timeFrameSetByUser.value = 'D1';
    } else if (event.code === 'Digit5') {
      setTimeFrame('W1');
      timeFrameSetByUser.value = 'W1';
    }
  }
}

const chartHighScale = ref(0);
const chartLowScale = ref(0);

const {
  increaseCandlesShow,
  decreaseCandlesShow,
  candlesInChartData,
  chartH2L,
  chartHigh,
  chartLow,
  dataDatesCandlesInChart,
  startingDistanceDifference,
} = useChartData(data, candlesShow, offset, chartHighScale, chartLowScale);

watch(startingDistanceDifference, () => {
  if (
    startingDistanceDifference.value &&
    startingDistanceDifference.value > 0
  ) {
    executeTimeFrameQuery(dataRecordsAmount.value);
  }
});

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

function registerClickOnDateAxis() {
  clickCount.value++;
  if (clickCount.value === 1) {
    timer.value = setTimeout(() => {
      clickCount.value = 0;
    }, 300);
  } else if (clickCount.value === 2) {
    clearTimeout(timer.value);
    clickCount.value = 0;
    handleDoubleClickOnDateAxis();
  }
}

function handleDoubleClickOnPriceAxis() {
  chartHighScale.value = 0;
  chartLowScale.value = 0;
}
function handleDoubleClickOnDateAxis() {
  handleDoubleClickOnPriceAxis();
  offset.value = 0;
  candlesShow.value = initialCandlesShow.value;
}

const blockPriceAxisDownDrag = ref(false);
const blockPriceAxisUpDrag = ref(false);

function calcuLateNewScale(currentScale: number, scalePercentage: number) {
  if (!chartH2L.value || !chartLow.value) {
    return 1;
  }
  const newH2L = chartH2L.value * (currentScale + scalePercentage);
  return newH2L / chartH2L.value;
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
      if (chartLowScale.value > 0) {
        chartLowScale.value = calcuLateNewScale(
          chartLowScale.value,
          -scalePercentIncrease
        );
        blockPriceAxisUpDrag.value = true;
        timer.value = setTimeout(() => {
          blockPriceAxisUpDrag.value = false;
        }, 1_000);
      } else if (!blockPriceAxisUpDrag.value) {
        chartHighScale.value = calcuLateNewScale(
          chartHighScale.value,
          scalePercentIncrease
        );
      }
    } else if (event.y < priceAxisDraggingStart.value) {
      if (chartHighScale.value > 0) {
        chartHighScale.value = calcuLateNewScale(
          chartHighScale.value,
          -scalePercentIncrease
        );
        blockPriceAxisDownDrag.value = true;
        timer.value = setTimeout(() => {
          blockPriceAxisDownDrag.value = false;
        }, 1_000);
      } else if (!blockPriceAxisDownDrag.value) {
        chartLowScale.value = calcuLateNewScale(
          chartLowScale.value,
          scalePercentIncrease
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
    return 2;
  } else if (candlesShow.value > 70) {
    return 10;
  } else if (candlesShow.value > 100) {
    return 20;
  } else if (candlesShow.value > 150) {
    return 40;
  } else {
    return 4;
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

// @setTimeFrame emit (.header-bar)
async function setTimeFrame(tf: TimeFrame) {
  if (timeFrame.value === tf) {
    return;
  }
  timeFrame.value = tf;
  setTimeout(() => {
    calculateAndSetlookbackNumber();
  }, 500);
}

// @setLookbackPeriod emit (.header-bar)
async function setLookbackPeriod(period: LookbackPeriodString) {
  lookbackPeriod.value = period;
  fitTimeFrameAndCandlesShowToLookbackPeriodString(lookbackPeriod.value);
}

function calculateAdditionalCandles(candlesDiffInMs: number) {
  const lookBackTimeInMs = lookbackPeriodEnum[lookbackPeriod.value];
  const additionalTimeNeeded = lookBackTimeInMs - candlesDiffInMs;
  if (timeFrameMode.value === 'M') {
    return additionalTimeNeeded / MIN / timeModeCount.value;
  } else if (timeFrameMode.value === 'H') {
    return additionalTimeNeeded / HOUR / timeModeCount.value;
  } else if (timeFrameMode.value === 'D') {
    return additionalTimeNeeded / DAY / timeModeCount.value;
  } else if (timeFrameMode.value === 'W') {
    return additionalTimeNeeded / WEEK / timeModeCount.value;
  }
}

function fitTimeFrameAndCandlesShowToLookbackPeriodString(
  lookBackPeriod: LookbackPeriodString
) {
  if (!chartWidth.value || !candlesShow.value) {
    return;
  }
  const appropriatePeriodInMs =
    lookbackPeriodEnum[lookBackPeriod] / candlesShow.value;
  const nearestAppropriatePeriodFromAllowedTimeFramesIndex = findNearestIndex(
    appropriatePeriodInMs,
    Object.values(allowedTimeFramesEnum)
  );
  const appropriateTimeFrame = Object.keys(allowedTimeFramesEnum)[
    nearestAppropriatePeriodFromAllowedTimeFramesIndex
  ];
  timeFrame.value = appropriateTimeFrame as TimeFrame;
  if (!data.value) {
    return;
  }

  const additionalCandles = calculateAdditionalCandles(
    data.value[data.value.length - 1].d.getTime() -
      data.value[data.value.length - candlesShow.value].d.getTime()
  );
  if (!additionalCandles) {
    return;
  }
  candlesShow.value = Math.round(candlesShow.value + additionalCandles);
  initialCandlesShow.value = candlesShow.value;
  if (lookbackPeriod.value === '5year') {
    lookbackNumber.value = 5;
  } else {
    lookbackNumber.value = 1;
  }
}

function calculateAppropriateCandlesBasedOnChartWidth(_chartWidth: number) {
  if (!_chartWidth) {
    return 10; // INFO: should never happen, but in case it's a value fit for even small width charts
  }
  const chartsWidthWithoutPriceAxisWidth = _chartWidth;
  const assumedPriceAxisAverageWidth = 50;
  const actualTemporaryChartWidth =
    chartsWidthWithoutPriceAxisWidth - assumedPriceAxisAverageWidth;
  return Math.round(actualTemporaryChartWidth / WANTED_PX_PER_CANDLE);
}

function startCurrentCandleStream() {
  // TODO: current candle stream start graphql subscription
}

function calculateAndSetlookbackNumber() {
  if (!candlesInChartData.value || !candlesInChartData.value.length) {
    return;
  }
  const timeDiffInMs =
    candlesInChartData.value[candlesInChartData.value.length - 1].d.getTime() -
    candlesInChartData.value[0].d.getTime();
  if (timeDiffInMs < HOUR) {
    lookbackPeriodString.value = '1minute';
    lookbackNumber.value = Math.round((timeDiffInMs / MIN) * 10) / 10;
  } else if (timeDiffInMs < DAY) {
    lookbackPeriodString.value = '1hour';
    lookbackNumber.value = Math.round((timeDiffInMs / HOUR) * 10) / 10;
  } else if (timeDiffInMs < WEEK) {
    lookbackPeriodString.value = '1day';
    lookbackNumber.value = Math.round((timeDiffInMs / DAY) * 10) / 10;
  } else if (timeDiffInMs < MONTH) {
    lookbackPeriodString.value = '1week';
    lookbackNumber.value = Math.round((timeDiffInMs / WEEK) * 10) / 10;
  } else if (timeDiffInMs < MONTH * 3) {
    lookbackPeriodString.value = '1month';
    lookbackNumber.value = Math.round((timeDiffInMs / MONTH) * 10) / 10;
  } else if (timeDiffInMs < YEAR) {
    lookbackPeriodString.value = '1quarter';
    lookbackNumber.value = Math.round((timeDiffInMs / MONTH / 3) * 10) / 10;
  } else {
    lookbackPeriodString.value = '1year';
    lookbackNumber.value = Math.round((timeDiffInMs / YEAR) * 10) / 10;
  }
}

watch(timeFrameSetByUser, async () => {
  if (
    !timeFrameSetByUser.value ||
    timeFrame.value === timeFrameSetByUser.value
  ) {
    return;
  }
  dataRecordsAmount.value = 0;
  timeFrame.value = timeFrameSetByUser.value;
  calculateAndSetlookbackNumber();
});

watch([chartHeight, candlesShow, offset, chartHigh, chartLow], async () => {
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
