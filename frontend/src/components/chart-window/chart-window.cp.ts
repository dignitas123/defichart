import { computed, ref, Ref, watch } from 'vue';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import {
  DATA_TICKSIZE,
  DAY,
  HOUR,
  MIN,
  WEEK,
} from 'src/pages/broker-charts/consts';
import { roundToTicksize } from './helpers/digits';
import { TimeFrame } from './child-components/header-bar/child-components/time-frame-dropdown.if';

export function useChartData(
  data: Ref<OHLC[]>,
  maxCandles: Ref<number>,
  candlesShow: Ref<number>,
  offset: Ref<number>,
  chartHighScale: Ref<number>,
  chartLowScale: Ref<number>
) {
  function decreaseCandlesShow(n = 1) {
    if (candlesShow.value - n > 1) {
      candlesShow.value -= n;
    } else {
      candlesShow.value = 1;
    }
  }

  function increaseCandlesShow(n = 1) {
    candlesShow.value += n;
  }

  const maxData = computed(() => {
    return data.value.slice(-maxCandles.value);
  });

  const candlesInChartData = computed(() => {
    const dataLength = maxData.value.length;
    let startSlice = dataLength - candlesShow.value + offset.value;
    if (startSlice < 0) {
      startSlice = 0;
    }
    return maxData.value.slice(startSlice, dataLength + offset.value);
  });

  const startingDistanceDifference = computed(() => {
    const showDifference = candlesShow.value - maxData.value.length;
    return showDifference - offset.value;
  });

  const dataDatesCandlesInChart = computed(() => {
    if (!candlesInChartData.value.length) {
      return undefined;
    }
    return candlesInChartData.value.map((ohlc) => ohlc.d);
  });

  const dataDates = computed(() => {
    if (!data.value.length) {
      return undefined;
    }
    return data.value.map((ohlc) => ohlc.d);
  });

  const high = computed(() => {
    return Math.max(...candlesInChartData.value.map((ohlc) => Number(ohlc.h)));
  });

  const low = computed(() => {
    return Math.min(...candlesInChartData.value.map((ohlc) => Number(ohlc.l)));
  });

  const h2l = computed(() => {
    return high.value - low.value;
  });

  const chartHigh = ref(0);
  const chartLow = ref(0);

  watch(candlesInChartData, () => {
    chartHigh.value = roundToTicksize(
      high.value + h2l.value * chartHighScale.value,
      DATA_TICKSIZE
    );
    chartLow.value = roundToTicksize(
      low.value - h2l.value * chartLowScale.value,
      DATA_TICKSIZE
    );
  });

  watch(chartHighScale, () => {
    chartHigh.value = roundToTicksize(
      high.value + h2l.value * chartHighScale.value,
      DATA_TICKSIZE
    );
  });

  watch(chartLowScale, () => {
    chartLow.value = roundToTicksize(
      low.value - h2l.value * chartLowScale.value,
      DATA_TICKSIZE
    );
  });

  const chartH2L = computed(() => {
    if (!chartHigh.value || !chartLow.value) {
      return undefined;
    }
    return chartHigh.value - chartLow.value;
  });

  return {
    candlesInChartData,
    chartHigh,
    chartLow,
    chartH2L,
    decreaseCandlesShow,
    increaseCandlesShow,
    dataDates,
    dataDatesCandlesInChart,
    startingDistanceDifference,
  };
}

export function useTimeFrame() {
  function getTimeFrameInMs(timeFrame: TimeFrame) {
    switch (timeFrame) {
      case 'M1':
        return MIN;
      case 'M2':
        return MIN * 2;
      case 'M3':
        return MIN * 3;
      case 'M4':
        return MIN * 4;
      case 'M5':
        return MIN * 5;
      case 'M10':
        return MIN * 10;
      case 'M15':
        return MIN * 15;
      case 'M20':
        return MIN * 20;
      case 'M30':
        return MIN * 30;
      case 'H1':
        return HOUR;
      case 'H2':
        return HOUR * 2;
      case 'H3':
        return HOUR * 3;
      case 'H4':
        return HOUR * 4;
      case 'H6':
        return HOUR * 6;
      case 'H8':
        return HOUR * 8;
      case 'H12':
        return HOUR * 12;
      case 'D1':
        return DAY;
      case 'D2':
        return DAY * 2;
      case 'D3':
        return DAY * 3;
      case 'D4':
        return DAY * 4;
      case 'W1':
        return WEEK;
      case 'W2':
        return WEEK * 2;
      case 'W3':
        return WEEK * 3;
      case 'W4':
        return WEEK * 4;
    }
  }

  return {
    getTimeFrameInMs,
  };
}
