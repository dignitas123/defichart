<template>
  <svg
    :width="width"
    :height="height"
    class="d-block absolute"
    style="z-index: 1"
  >
    <line
      v-for="(priceY, i) in priceLines"
      :key="i"
      :x1="0"
      :y1="priceY"
      :x2="width"
      :y2="priceY"
      :stroke="`rgb(0, 0, 0, ${GRID_LINES_TRANSPARENCY})`"
    />
    <line
      v-for="(dateX, i) in dateLines"
      :key="i"
      :x1="dateX"
      :y1="0"
      :x2="dateX"
      :y2="height"
      :stroke="`rgb(0, 0, 0, ${GRID_LINES_TRANSPARENCY})`"
    />
  </svg>
  <svg
    :width="width"
    :height="height"
    class="d-block absolute"
    style="z-index: 2"
    ref="candlesticksRef"
  >
    <CandleStick
      v-for="(candle, i) in candles"
      :key="i"
      :candle="candle"
      :candleWidth="candleWidth"
    />
  </svg>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { format as dateFormat } from 'date-fns';
import {
  Candle,
  TimeDisplayProperties,
  TimeMode,
  TimeModePeriod,
} from './candlestick-chart.if';
import {
  DatePositionEntry,
  OHLC,
} from 'src/pages/broker-charts/broker-charts.if';
import { useLanguageStore } from 'src/stores/language';
import {
  CANDLE_BEAR_COLOR,
  CANDLE_BORDER,
  CANDLE_BORDER_COLOR,
  CANDLE_BULL_COLOR,
  CANDLE_WICK_THICKNESS,
  DATE_BOX_WIDTH,
  GRID_LINES_TRANSPARENCY,
} from 'src/pages/broker-charts/consts';
import CandleStick from './child-components/candle-stick.vue';

const props = withDefaults(
  defineProps<{
    data: OHLC[];
    dates?: Date[];
    candleCount: number;
    h2l?: number;
    high: number;
    low: number;
    height?: number;
    width?: number;
    priceLines?: number[];
    dateLines?: number[];
    datePositionEntries: DatePositionEntry[];
    startingDistanceDifference: number;
    candleWidth: number;
    candleDistance: number;
    offset: number;
  }>(),
  {
    priceLines: () => [],
    dateLines: () => [],
  }
);

const emit = defineEmits<{
  (event: 'update:datePositionEntries', entries: DatePositionEntry[]): void;
  (event: 'update:candleWidth', width: number): void;
  (event: 'update:candleDistance', distance: number): void;
}>();

const MIN = 1000 * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

const candlesticksRef = ref<SVGSVGElement>();

const datePositionEntries = ref(props.datePositionEntries);
const candleWidth = ref(props.candleWidth);
const candleDistance = ref(props.candleDistance);

watch(datePositionEntries, () => {
  emit('update:datePositionEntries', datePositionEntries.value);
});

watch(candleWidth, () => {
  emit('update:candleWidth', candleWidth.value);
});

watch(candleDistance, () => {
  emit('update:candleDistance', candleDistance.value);
});

const candles = ref<Candle[]>([]);

const languageStore = useLanguageStore();

function formatDate(date: Date, format: string) {
  return dateFormat(date, format, { locale: languageStore.language });
}

function calcCandleXDistance(cW: number) {
  const increase = CANDLE_BORDER ? 1 : 0;
  if (cW > 80) {
    return 20 + increase;
  } else if (cW > 40) {
    return 5 + increase;
  } else if (cW > 20) {
    return 4 + increase;
  } else if (cW > 16) {
    return 3 + increase;
  } else if (cW > 6.6) {
    return 2 + increase;
  } else if (cW > 3.8) {
    return 1 + increase;
  } else if (cW > 2.5) {
    return 0 + increase;
  }
  return 0;
}

const lastXPositionCandlestick = ref(0);
const xPositionCandlestick = ref(0);

/**
 * TODO: current candle stream should set data
 * here, not the simulation of course. Can keep
 * simulation for some feature in the future
 */
const currentCandleData = computed(() => {
  return props.data.slice(-1)[0];
})

setInterval(() => {
  if (!props.h2l) {
    return;
  }
  const upDown = Math.random() >= 0.5 ? true : false;
  const random = Math.random();
  const h2l10p = props.h2l / 10;
  currentCandleData.value.c += upDown ? h2l10p * random : -h2l10p * random;
}, 1_000);

watch(currentCandleData, () => {
  if (currentCandleData.value.c > currentCandleData.value.h) {
    currentCandleData.value.h = currentCandleData.value.c;
    if(currentCandleData.value.h > props.high) {
      drawChart();
    }
  }
  if (currentCandleData.value.c < currentCandleData.value.l) {
    currentCandleData.value.l = currentCandleData.value.c;
    if(currentCandleData.value.l < props.low) {
      drawChart();
    }
  }
  const currentCandle = drawCandle(lastXPositionCandlestick.value, currentCandleData.value)
  if(currentCandle) {
    candles.value[candles.value.length - 1] = currentCandle;
  }
}, {deep: true});

const timeDisplayProps = ref<TimeDisplayProperties>();

function drawChart() {
  if (!props.width || !props.height || !props.dates) {
    return;
  }
  candles.value = [];
  datePositionEntries.value = [];

  const candleWidthWithoutCandleDistance = props.width / props.candleCount;
  candleDistance.value = calcCandleXDistance(candleWidthWithoutCandleDistance);
  candleWidth.value =
    candleWidthWithoutCandleDistance -
    candleDistance.value -
    candleDistance.value / props.candleCount;

  const overCandles = props.candleCount - props.dates.length;

  const candleSumWidthPx =
    (candleWidth.value + candleDistance.value) *
    (props.candleCount - overCandles);

  timeDisplayProps.value = timeDisplayProperties(candleSumWidthPx);

  xPositionCandlestick.value =
    (props.startingDistanceDifference > 0
      ? props.startingDistanceDifference
      : 0) *
      (candleWidth.value + candleDistance.value) +
    candleDistance.value;

  props.data.forEach((ohlc, index) => {
    const candle = drawCandle(xPositionCandlestick.value, ohlc);
    if (candle) {
      candles.value.push(candle);
    }
    addDateToDatePositionEntries(ohlc.d, index);
    lastXPositionCandlestick.value = xPositionCandlestick.value;
    xPositionCandlestick.value += candleWidth.value + candleDistance.value;
  });

function addDateToDatePositionEntries(date: Date, index: number) {
  if (!timeDisplayProps.value) {
    return;
  }
  let formattedDate = '';
  let bold = false;
  let format = '';

  const minutes = date.getMinutes();
  const hours = date.getHours();

  if (timeDisplayProps.value.period === TimeModePeriod.Minute) {
    format = 'HH:mm';
    if (minutes === 0 && hours === 0) {
      format = 'dd.MM';
    }
    if (minutes % timeDisplayProps.value.timeDifferential === 0) {
      if (timeDisplayProps.value.mode === TimeMode.M5 && minutes % 15 === 0) {
        bold = true;
      } else if (
        timeDisplayProps.value.mode === TimeMode.M10 &&
        minutes % 30 === 0
      ) {
        bold = true;
      } else if (
        timeDisplayProps.value.mode === TimeMode.M15 &&
        minutes === 0
      ) {
        bold = true;
      } else if (
        timeDisplayProps.value.mode === TimeMode.M30 &&
        date.getHours() % 2 === 0 &&
        minutes === 0
      ) {
        bold = true;
      }
      formattedDate = formatDate(date, format);
    }
  } else if (timeDisplayProps.value.period === TimeModePeriod.Hour) {
    format = 'HH:mm';
    if (minutes % 60 === 0) {
      if (hours === 0) {
        format = 'dd.MM';
        bold = true;
      }
      if (timeDisplayProps.value.mode === TimeMode.H1) {
        if (hours % 4 === 0) {
          bold = true;
        }
        formattedDate = formatDate(date, format);
      } else if (timeDisplayProps.value.mode === TimeMode.H3) {
        if (hours % 9 === 0) {
          bold = true;
        }
        if (hours % 3 === 0) {
          formattedDate = formatDate(date, format);
        }
      } else if (timeDisplayProps.value.mode === TimeMode.H6) {
        if (hours % 12 === 0) {
          bold = true;
        }
        if (hours % 6 === 0) {
          formattedDate = formatDate(date, format);
        }
      }
    }
  } else if (timeDisplayProps.value.period === TimeModePeriod.Day) {
    const days = date.getDate();
    format = 'dd.MM';
    if (days % timeDisplayProps.value.timeDifferential === 0) {
      if (timeDisplayProps.value.mode === TimeMode.W2) {
        if (days % 15 === 0 && days !== 30) {
          formattedDate = formatDate(date, format);
        }
      } else {
        formattedDate = formatDate(date, format);
      }
      if (days === 1) {
        format = 'MM';
        formattedDate = formatDate(date, format);
      }
      if (date.getMonth() === 1) {
        format = 'YYYY';
        formattedDate = formatDate(date, format);
        bold = true;
      }
    }
  } else if (timeDisplayProps.value.period === TimeModePeriod.Month) {
    const month = date.getMonth();
    format = 'MM';
    if (month % timeDisplayProps.value.timeDifferential === 0) {
      if (month === 1) {
        bold = true;
        format = 'YYYY';
      }
      formattedDate = formatDate(date, format);
    }
  } else if (timeDisplayProps.value.period === TimeModePeriod.Year) {
    format = 'YYYY';
    if (date.getFullYear() % 10 === 0) {
      bold = true;
    }
    formattedDate = formatDate(date, format);
  }

  const xPosition = xPositionCandlestick.value + candleWidth.value / 2;
  if (!formattedDate) {
    datePositionEntries.value.push({
      index: index,
      x: xPosition,
      date: formatDate(date, format),
      bold: bold,
      show: false,
    });
    return;
  }

  datePositionEntries.value.push({
    index: index,
    x: xPosition,
    date: formattedDate,
    bold: bold,
    show: true,
  });
}

function drawCandle(
  x: number,
  ohlc: OHLC,
  bull_color: string = CANDLE_BULL_COLOR,
  bear_color: string = CANDLE_BEAR_COLOR,
  candle_border: boolean = CANDLE_BORDER,
  candle_border_color: string = CANDLE_BORDER_COLOR
) {
  if (
    !props.h2l ||
    !props.high ||
    !props.low ||
    !props.height ||
    !props.width
  ) {
    return;
  }
  const candle: Candle = {} as Candle;

  candle.x = x;
  const xStartingPoint = x + candleWidth.value / 2;
  const candleWickDistance = CANDLE_WICK_THICKNESS / 2;
  const xWickPoint = xStartingPoint - candleWickDistance;

  candle.wX = xWickPoint;

  const convert_to_scale = (val: number) => {
    if (!props.height || !props.high || !props.h2l) {
      return 0;
    }
    return props.height * ((props.high - val) / props.h2l);
  };

  const o = convert_to_scale(ohlc.c);
  const h = convert_to_scale(ohlc.l);
  const l = convert_to_scale(ohlc.h);
  const c = convert_to_scale(ohlc.o);

  candle.height = Math.abs(o - c);

  candle.uwY = l;

  if (c > o) {
    candle.fillColor = bull_color;
    candle.wickFillColor = candle_border ? candle_border_color : bull_color;
    candle.y = o;
    candle.uwHeight = o - l;
    candle.lwY = c;
    candle.lwHeight = h - c;
  } else {
    candle.fillColor = bear_color;
    candle.wickFillColor = candle_border ? candle_border_color : bear_color;
    candle.y = c;
    candle.uwHeight = c - l;
    candle.lwY = o;
    candle.lwHeight = h - o;
  }
  if (c === o) {
    candle.height = 1;
    if (candle_border) {
      candle.fillColor = candle_border_color;
    }
  }
  return candle;
}

function timeDisplayProperties(candleSumWidthPx: number) {
  let mode = TimeMode.Y1;
  let period = TimeModePeriod.Year;
  let timeDifferential = 1;
  if (!props.width || !props.dates) {
    return {
      mode: mode,
      period: period,
      timeDifferential: timeDifferential,
    };
  }

  const diff =
    props.dates[props.dates.length - 1].getTime() - props.dates[0].getTime();

  // This is the time difference, that fits in one time display
  const tDifDB = diff * (DATE_BOX_WIDTH / candleSumWidthPx);

  if (tDifDB < 3 * MIN) {
    mode = TimeMode.M1;
    timeDifferential = 1;
  } else if (tDifDB < 6 * MIN) {
    mode = TimeMode.M5;
    timeDifferential = 5;
  } else if (tDifDB < 10 * MIN) {
    mode = TimeMode.M10;
    timeDifferential = 10;
  } else if (tDifDB < 16 * MIN) {
    mode = TimeMode.M15;
    timeDifferential = 15;
  } else if (tDifDB < 20 * MIN) {
    mode = TimeMode.M30;
    timeDifferential = 30;
  } else if (tDifDB < 66 * MIN) {
    mode = TimeMode.H1;
    timeDifferential = 1;
  } else if (tDifDB < 190 * MIN) {
    mode = TimeMode.H3;
    timeDifferential = 2;
  } else if (tDifDB < 6 * HOUR) {
    mode = TimeMode.H6;
    timeDifferential = 6;
  } else if (tDifDB < 12 * HOUR) {
    mode = TimeMode.H12;
    timeDifferential = 12;
  } else if (tDifDB < 3 * DAY) {
    mode = TimeMode.D1;
    timeDifferential = 1;
  } else if (tDifDB < 8 * DAY) {
    mode = TimeMode.W1;
    timeDifferential = 7;
  } else if (tDifDB < 13 * DAY) {
    mode = TimeMode.W2;
    timeDifferential = 15;
  } else if (tDifDB < 15 * WEEK) {
    mode = TimeMode.MN1;
    timeDifferential = 1;
  } else if (tDifDB < 5 * MONTH) {
    mode = TimeMode.MN6;
    timeDifferential = 6;
  }

  if (
    [
      TimeMode.M1,
      TimeMode.M5,
      TimeMode.M10,
      TimeMode.M15,
      TimeMode.M30,
    ].includes(mode)
  ) {
    period = TimeModePeriod.Minute;
  } else if (
    [TimeMode.H1, TimeMode.H3, TimeMode.H6, TimeMode.H12].includes(mode)
  ) {
    period = TimeModePeriod.Hour;
  } else if ([TimeMode.D1, TimeMode.W1, TimeMode.W2].includes(mode)) {
    period = TimeModePeriod.Day;
  } else if ([TimeMode.MN1, TimeMode.MN6].includes(mode)) {
    period = TimeModePeriod.Month;
  }

  return {
    mode: mode,
    period: period,
    timeDifferential: timeDifferential,
  };
}

onMounted(async () => {
  drawChart();
});

watch(
  [
    () => props.candleCount,
    () => props.width,
    () => props.height,
    () => props.offset,
    () => props.high,
    () => props.low,
  ],
  async () => {
    drawChart();
  }
);
</script>