import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { DATA_TICKSIZE } from 'src/pages/broker-charts/consts';
import { computed, Ref } from 'vue';
import { roundToTicksize } from './helpers/digits';

export function useChartData(
  data: Ref<OHLC[]>,
  maxCandles: Ref<number>,
  candlesShow: Ref<number>,
  offset: Ref<number>,
  candlesInChartHighScale: Ref<number>,
  candlesInChartLowScale: Ref<number>
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

  const candlesInChartHigh = computed(() => {
    if (candlesInChartData.value.length) {
      return roundToTicksize(
        Math.max(...candlesInChartData.value.map((ohlc) => Number(ohlc.h))) *
          candlesInChartHighScale.value,
        DATA_TICKSIZE
      );
    }
    return 999999999;
  });

  const candlesInChartLow = computed(() => {
    if (candlesInChartData.value.length) {
      return (
        Math.min(...candlesInChartData.value.map((ohlc) => Number(ohlc.l))) *
        candlesInChartLowScale.value
      );
    }
    return 0;
  });

  const candlesInChartH2L = computed(() => {
    if (!candlesInChartHigh.value || !candlesInChartLow.value) {
      return undefined;
    }
    return candlesInChartHigh.value - candlesInChartLow.value;
  });

  return {
    candlesInChartData,
    candlesInChartHigh,
    candlesInChartLow,
    candlesInChartH2L,
    decreaseCandlesShow,
    increaseCandlesShow,
    dataDates,
    dataDatesCandlesInChart,
    startingDistanceDifference,
  };
}
