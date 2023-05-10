import { computed, ref, Ref, watch } from 'vue';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import {
  DATA_TICKSIZE,
  MAX_CANDLES_LOAD,
} from 'src/pages/broker-charts/consts';
import { roundToTicksize } from './helpers/digits';

export function useChartData(
  data: Ref<OHLC[] | undefined>,
  candlesShow: Ref<number>,
  offset: Ref<number>,
  chartHighScale: Ref<number>,
  chartLowScale: Ref<number>,
  chartUpdateKey: Ref<number>
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

  const maxData = ref<OHLC[]>();

  watch([data, chartUpdateKey], () => {
    if (!data.value) {
      return undefined;
    }
    maxData.value = data.value.slice(-MAX_CANDLES_LOAD);
  });

  const candlesInChartData = computed(() => {
    if (!maxData.value) {
      return undefined;
    }
    const dataLength = maxData.value.length;
    let startSlice = dataLength - candlesShow.value + offset.value;
    if (startSlice < 0) {
      startSlice = 0;
    }
    return maxData.value.slice(startSlice, dataLength + offset.value);
  });

  const startingDistanceDifference = computed(() => {
    if (!maxData.value) {
      return undefined;
    }
    const showDifference = candlesShow.value - maxData.value.length;
    return showDifference - offset.value;
  });

  const dataDatesCandlesInChart = computed(() => {
    if (!candlesInChartData.value || !candlesInChartData.value.length) {
      return undefined;
    }
    return candlesInChartData.value.map((ohlc) => ohlc.d);
  });

  const dataDates = computed(() => {
    if (!data.value || !data.value.length) {
      return undefined;
    }
    return data.value.map((ohlc) => ohlc.d);
  });

  const high = computed(() => {
    if (!candlesInChartData.value) {
      return undefined;
    }
    return Math.max(...candlesInChartData.value.map((ohlc) => Number(ohlc.h)));
  });

  const low = computed(() => {
    if (!candlesInChartData.value) {
      return undefined;
    }
    return Math.min(...candlesInChartData.value.map((ohlc) => Number(ohlc.l)));
  });

  const h2l = computed(() => {
    if (!high.value || !low.value) {
      return undefined;
    }
    return high.value - low.value;
  });

  const chartHigh = ref(0);
  const chartLow = ref(0);

  watch(candlesInChartData, () => {
    if (!high.value || !low.value || !h2l.value) {
      return;
    }
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
    if (!high.value || !h2l.value) {
      return;
    }
    chartHigh.value = roundToTicksize(
      high.value + h2l.value * chartHighScale.value,
      DATA_TICKSIZE
    );
  });

  watch(chartLowScale, () => {
    if (!low.value || !h2l.value) {
      return;
    }
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
