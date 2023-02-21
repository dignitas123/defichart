<template>
  <svg
    :width="width"
    :height="height"
    class="d-block absolute"
    style="z-index: 1"
  >
    <line
      v-for="(price, i) in priceLines"
      :key="i"
      :x1="0"
      :y1="price"
      :x2="width"
      :y2="price"
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
    :viewBox="`${viewBoxXStart} 0 ${width} ${height}`"
    class="d-block absolute"
    style="z-index: 2"
    ref="candlesticksRef"
  >
    <g v-for="(candle, i) in candles" :key="i">
      <rect
        :x="candle.wX"
        :y="candle.uwY"
        :width="CANDLE_WICK_THICKNESS"
        :height="candle.uwHeight"
        :style="`fill: ${candle.fillColor}`"
      />
      <rect
        :x="candle.x"
        :y="candle.y"
        :width="candleWidth"
        :height="candle.height"
        :style="`fill: ${candle.fillColor}`"
      />
      <rect
        :x="candle.wX"
        :y="candle.lwY"
        :width="CANDLE_WICK_THICKNESS"
        :height="candle.lwHeight"
        :style="`fill: ${candle.fillColor}`"
      />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue';
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
import {
  CANDLE_WICK_THICKNESS,
  DATE_BOX_WIDTH,
  GRID_LINES_TRANSPARENCY,
} from 'src/pages/broker-charts/consts';
import { useLanguageStore } from 'src/stores/language';

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
    candlesticksSVGWidth: number;
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
  (event: 'update:candlesticksSVGWidth', width: number): void;
}>();

const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
// const CANDLE_BORDER_COLOR = 'black';
const MIN = 1000 * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

const candlesticksRef = ref<SVGSVGElement>();

const viewBoxXStart = computed(() => {
  if (!candlesticksSVGWidth.value || !props.width) {
    return 0;
  }
  const ret =
    candlesticksSVGWidth.value - props.width + candleDistance.value * 2;
  if (ret >= 0) {
    return ret;
  } else {
    return 0;
  }
});

const datePositionEntries = ref(props.datePositionEntries);
const candleWidth = ref(props.candleWidth);
const candleDistance = ref(props.candleDistance);
const candlesticksSVGWidth = ref(props.candlesticksSVGWidth);

watch(datePositionEntries, () => {
  emit('update:datePositionEntries', datePositionEntries.value);
});

watch(candleWidth, () => {
  emit('update:candleWidth', candleWidth.value);
});

watch(candleDistance, () => {
  emit('update:candleDistance', candleDistance.value);
});

watch(candlesticksSVGWidth, () => {
  emit('update:candlesticksSVGWidth', candlesticksSVGWidth.value);
});

const candles = ref<Candle[]>([]);

function calcCandleXDistance(cW: number) {
  if (cW > 80) {
    return 20;
  } else if (cW > 40) {
    return 5;
  } else if (cW > 20) {
    return 4;
  } else if (cW > 16) {
    return 3;
  } else if (cW > 3.4) {
    return 1;
  } else {
    return 0;
  }
}

const languageStore = useLanguageStore();

function drawChart(onlyHeightChange = false) {
  let makeDateCalculation = !onlyHeightChange;
  if (!props.width || !props.height || !props.dates) {
    return;
  }
  candles.value = [];

  if (makeDateCalculation) {
    datePositionEntries.value = [];
  }
  const candleWidthWithoutCandleDistance = props.width / props.candleCount;
  candleDistance.value = calcCandleXDistance(candleWidthWithoutCandleDistance);
  candleWidth.value =
    candleWidthWithoutCandleDistance -
    candleDistance.value -
    candleDistance.value / props.candleCount;

  let xPositionCandlestick =
    (props.startingDistanceDifference > 0
      ? props.startingDistanceDifference
      : 0) *
      (candleWidth.value + candleDistance.value) +
    candleDistance.value;

  const overCandles = props.candleCount - props.dates.length;

  const candleSumWidthPx =
    (candleWidth.value + candleDistance.value) *
    (props.candleCount - overCandles);

  const timeDisplayProps: TimeDisplayProperties =
    timeDisplayProperties(candleSumWidthPx);

  props.data.forEach((ohlc, index) => {
    drawCandle(xPositionCandlestick, ohlc);
    if (makeDateCalculation) {
      addDate(ohlc.d, index);
    }
    xPositionCandlestick += candleWidth.value + candleDistance.value;
  });

  function addDate(date: Date, index: number) {
    let formattedDate = '';
    let bold = false;
    let format = '';

    const minutes = date.getMinutes();
    const hours = date.getHours();

    if (timeDisplayProps.period === TimeModePeriod.Minute) {
      format = 'HH:mm';
      if (minutes === 0 && hours === 0) {
        format = 'dd.MM';
      }
      if (minutes % timeDisplayProps.timeDifferential === 0) {
        if (timeDisplayProps.mode === TimeMode.M5 && minutes % 15 === 0) {
          bold = true;
        } else if (
          timeDisplayProps.mode === TimeMode.M10 &&
          minutes % 30 === 0
        ) {
          bold = true;
        } else if (timeDisplayProps.mode === TimeMode.M15 && minutes === 0) {
          bold = true;
        } else if (
          timeDisplayProps.mode === TimeMode.M30 &&
          date.getHours() % 2 === 0 &&
          minutes === 0
        ) {
          bold = true;
        }
        formattedDate = formatDate(date, format);
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Hour) {
      format = 'HH:mm';
      if (minutes % 60 === 0) {
        if (hours === 0) {
          format = 'dd.MM';
          bold = true;
        }
        if (timeDisplayProps.mode === TimeMode.H1) {
          if (hours % 4 === 0) {
            bold = true;
          }
          formattedDate = formatDate(date, format);
        } else if (timeDisplayProps.mode === TimeMode.H3) {
          if (hours % 9 === 0) {
            bold = true;
          }
          if (hours % 3 === 0) {
            formattedDate = formatDate(date, format);
          }
        } else if (timeDisplayProps.mode === TimeMode.H6) {
          if (hours % 12 === 0) {
            bold = true;
          }
          if (hours % 6 === 0) {
            formattedDate = formatDate(date, format);
          }
        }
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Day) {
      const days = date.getDate();
      format = 'dd.MM';
      if (days % timeDisplayProps.timeDifferential === 0) {
        if (timeDisplayProps.mode === TimeMode.W2) {
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
    } else if (timeDisplayProps.period === TimeModePeriod.Month) {
      const month = date.getMonth();
      format = 'MM';
      if (month % timeDisplayProps.timeDifferential === 0) {
        if (month === 1) {
          bold = true;
          format = 'YYYY';
        }
        formattedDate = formatDate(date, format);
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Year) {
      format = 'YYYY';
      if (date.getFullYear() % 10 === 0) {
        bold = true;
      }
      formattedDate = formatDate(date, format);
    }

    const xPosition =
      xPositionCandlestick + candleWidth.value / 2 - candleDistance.value * 2;

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
    candle_border: boolean = CANDLE_BORDER
    // candle_border_color: string = CANDLE_BORDER_COLOR
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
      if (props.height && props.high && props.h2l)
        return props.height * ((props.high - val) / props.h2l);
    };

    const o = convert_to_scale(ohlc.c) ?? 0;
    const h = convert_to_scale(ohlc.l) ?? 0;
    const l = convert_to_scale(ohlc.h) ?? 0;
    const c = convert_to_scale(ohlc.o) ?? 0;

    candle.height = Math.abs(o - c);

    candle.uwY = l;
    if (c > o) {
      candle.y = o;
      candle.fillColor = bull_color;
      candle.uwHeight = o - l + 1;
      candle.lwY = c - 1;
      candle.lwHeight = h - c + 1;
    } else {
      candle.y = c;
      candle.fillColor = bear_color;
      candle.uwHeight = c - l + 1;
      candle.lwY = o - 1;
      candle.lwHeight = h - o + 1;
    }
    candles.value?.push(candle);

    if (candle_border) {
      // TODO: introduce candle_border
    }
  }
}

function formatDate(date: Date, format: string) {
  return dateFormat(date, format, { locale: languageStore.language });
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

async function drawChartAndUpdateSVGWidth() {
  drawChart();
  await nextTick();
  candlesticksSVGWidth.value = candlesticksRef.value?.getBBox().width ?? 0;
}

onMounted(async () => {
  drawChartAndUpdateSVGWidth();
});

watch(
  () => props.candleCount,
  async () => {
    drawChartAndUpdateSVGWidth();
  }
);
</script>
