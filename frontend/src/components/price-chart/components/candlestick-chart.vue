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
      :stroke="`rgb(0, 0, 0, ${PRICE_LINES_TRANSPARENCY})`"
    />
  </svg>
  <svg
    :width="width"
    :height="height"
    class="d-block absolute"
    style="z-index: 2"
  >
    <g v-for="(candle, i) in candles" :key="i">
      <rect
        :x="candle.wX"
        :y="candle.uwY"
        :width="candleWickWidth"
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
        :width="candleWickWidth"
        :height="candle.lwHeight"
        :style="`fill: ${candle.fillColor}`"
      />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { DATE_BOX_WIDTH, PRICE_LINES_TRANSPARENCY } from '../consts';
import { PriceSeries } from '../price-chart.model';
import { usePriceChartData } from '../price-chart.model';
import { format as dateFormat } from 'date-fns';
import {
  Candle,
  TimeDisplayProperties,
  TimeMode,
  TimeModePeriod,
} from './candlestick-chart.interface';

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: number;
    priceLines?: number[];
  }>(),
  {
    priceLines: () => [],
  }
);

const {
  dataMaxCandlesShow,
  maxCandlesShow,
  candleH2L,
  maxCandleHigh,
  minCandleLow,
  startingDistanceDifference,
  dataDates,
  addToDatePositionEntries,
  resetDatePositionEntries,
} = usePriceChartData();

const CANDLE_WICK_THICKNESS = 0.15; // in percent

const CANDLE_BULL_COLOR = 'green';
const CANDLE_BEAR_COLOR = 'red';
const CANDLE_BORDER = false;
// const CANDLE_BORDER_COLOR = 'black';
const MIN = 1000 * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

const candles = ref<Candle[]>([]);

const candleWidth = ref(0);
const candleWickWidth = ref(0);

function getCandleWickWidth(cW: number) {
  return cW * CANDLE_WICK_THICKNESS;
}

// x-distance between candles
function calcCandleDistance(cW: number) {
  if (cW) {
    if (cW > 40) {
      return 5;
    } else if (cW > 16) {
      return 4;
    } else if (cW > 20) {
      return 3;
    } else if (cW > 6.6) {
      return 2;
    } else if (cW > 4) {
      return 1;
    } else {
      return 0;
    }
  }
  return 3;
}

function drawChart(onlyHeightChange = false) {
  let makeDateCalculation = !onlyHeightChange;
  if (!props.width || !props.height || !dataDates.value) {
    return;
  }
  candles.value = [];

  if (makeDateCalculation) {
    resetDatePositionEntries();
  }
  const candleWidthWithoutCandleDistance = props.width / maxCandlesShow.value;
  const cD = calcCandleDistance(candleWidthWithoutCandleDistance);
  candleWidth.value =
    candleWidthWithoutCandleDistance - cD - cD / maxCandlesShow.value;
  candleWickWidth.value = getCandleWickWidth(candleWidth.value);

  let xPositionCandlestick =
    (startingDistanceDifference.value > 0
      ? startingDistanceDifference.value
      : 0) *
      (candleWidth.value + cD) +
    cD;

  const overCandles = maxCandlesShow.value - dataDates.value.length;
  const candleSumWidthPx =
    (candleWidth.value + cD) * (maxCandlesShow.value - overCandles);
  const timeDisplayProps: TimeDisplayProperties =
    timeDisplayProperties(candleSumWidthPx);

  dataMaxCandlesShow.value.forEach((ohlc) => {
    drawCandle(xPositionCandlestick, ohlc);
    if (makeDateCalculation) {
      addDate(ohlc.d);
    }
    xPositionCandlestick += candleWidth.value + cD;
  });

  function addDate(date: Date) {
    let formattedDate = '';
    let bold = false;

    if (timeDisplayProps.period === TimeModePeriod.Minute) {
      const MINutes = date.getMinutes();
      if (MINutes % timeDisplayProps.timeDifferential === 0) {
        if (timeDisplayProps.mode === TimeMode.M5 && MINutes % 15 === 0) {
          bold = true;
        } else if (
          timeDisplayProps.mode === TimeMode.M10 &&
          MINutes % 30 === 0
        ) {
          bold = true;
        } else if (timeDisplayProps.mode === TimeMode.M15 && MINutes === 0) {
          bold = true;
        } else if (
          timeDisplayProps.mode === TimeMode.M30 &&
          date.getHours() % 2 === 0 &&
          MINutes === 0
        ) {
          bold = true;
        }
        formattedDate = dateFormat(date, 'hh:mm');
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Hour) {
      const HOURs = date.getHours();
      const MINutes = date.getMinutes();
      if (MINutes % 60 === 0) {
        let _format = 'hh:mm';
        if (HOURs % 0) {
          _format = 'dd'; // TODO: maybe add MONTH but must be local (dd/mm, dd:mm etc.)
          bold = true;
        }
        if (timeDisplayProps.mode === TimeMode.H1) {
          if (HOURs % 4 === 0) {
            bold = true;
          }
          formattedDate = dateFormat(date, _format);
        } else if (timeDisplayProps.mode === TimeMode.H3) {
          if (HOURs % 9 === 0) {
            bold = true;
          }
          if (HOURs % 3 === 0) {
            formattedDate = dateFormat(date, _format);
          }
        } else if (timeDisplayProps.mode === TimeMode.H6) {
          if (HOURs % 12 === 0) {
            bold = true;
          }
          if (HOURs % 6 === 0) {
            formattedDate = dateFormat(date, _format);
          }
        }
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Day) {
      const DAYs = date.getDate();
      if (DAYs % timeDisplayProps.timeDifferential === 0) {
        if (timeDisplayProps.mode === TimeMode.W2) {
          if (DAYs % 15 === 0 && DAYs !== 30) {
            formattedDate = dateFormat(date, 'dd');
          }
        } else {
          formattedDate = dateFormat(date, 'dd');
        }
        if (DAYs === 1) {
          formattedDate = dateFormat(date, 'MM');
        }
        if (date.getMonth() === 1) {
          formattedDate = dateFormat(date, 'YYYY');
          bold = true;
        }
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Month) {
      const MONTH = date.getMonth();
      let _format = 'MM';
      if (MONTH % timeDisplayProps.timeDifferential === 0) {
        if (MONTH === 1) {
          bold = true;
          _format = 'YYYY';
        }
        formattedDate = dateFormat(date, _format);
      }
    } else if (timeDisplayProps.period === TimeModePeriod.Year) {
      if (date.getFullYear() % 10 === 0) {
        bold = true;
      }
      formattedDate = dateFormat(date, 'YYYY');
    }

    if (!formattedDate) {
      return;
    }

    const xPosition =
      xPositionCandlestick - DATE_BOX_WIDTH / 2 + candleWidth.value / 2;

    if (!props.width || xPosition < 0 || xPosition > props.width) {
      return;
    }

    addToDatePositionEntries({
      x: xPosition,
      date: formattedDate,
      bold: bold,
    });
  }

  function drawCandle(
    x: number,
    ohlc: PriceSeries,
    bull_color: string = CANDLE_BULL_COLOR,
    bear_color: string = CANDLE_BEAR_COLOR,
    candle_border: boolean = CANDLE_BORDER
    // candle_border_color: string = CANDLE_BORDER_COLOR
  ) {
    if (
      !candleH2L.value ||
      !maxCandleHigh.value ||
      !minCandleLow.value ||
      !props.height ||
      !props.width
    ) {
      return;
    }
    const candle: Candle = {} as Candle;

    candle.x = x;
    const xStartingPoint = x + candleWidth.value / 2;
    const candleWickDistance = candleWickWidth.value / 2;
    const xWickPoint = xStartingPoint - candleWickDistance;

    candle.wX = xWickPoint;

    const convert_to_scale = (val: number) => {
      if (props.height && maxCandleHigh.value && candleH2L.value)
        return props.height * ((maxCandleHigh.value - val) / candleH2L.value);
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

function timeDisplayProperties(candleSumWidthPx: number) {
  let mode = TimeMode.Y1;
  let period = TimeModePeriod.Year;
  let timeDifferential = 1;
  if (!props.width || !dataDates.value) {
    return {
      mode: mode,
      period: period,
      timeDifferential: timeDifferential,
    };
  }

  const diff =
    dataDates.value[dataDates.value.length - 1].getTime() -
    dataDates.value[0].getTime();

  // This is the time difference, that fits in one time display
  const tDifDB = diff * (DATE_BOX_WIDTH / candleSumWidthPx);

  if (tDifDB < 3 * MIN) {
    mode = TimeMode.M1;
    timeDifferential = 1;
  } else if (tDifDB < 7 * MIN) {
    mode = TimeMode.M5;
    timeDifferential = 5;
  } else if (tDifDB < 12 * MIN) {
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

let lastWidth = 0;
let lastMaxCandlesShow = 0;
watchEffect(() => {
  if (!props.width || !props.height) {
    return;
  }
  drawChart(
    props.width === lastWidth && lastMaxCandlesShow === maxCandlesShow.value
  );
  lastWidth = props.width;
  lastMaxCandlesShow = maxCandlesShow.value;
});
</script>
