import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { computed, Ref } from 'vue';
import { DATA_TICKSIZE } from '../../pages/broker-charts/consts';
import { getBeforeComma, getDigits } from './helpers/digits';

export function useChartData(
  data: Ref<OHLC[]>,
  maxCandles: Ref<number>,
  candlesShow: Ref<number>,
  offset: Ref<number>
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
    return data.value.slice(-maxCandles);
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

  const dataDates = computed(() => {
    if (!candlesInChartData.value.length) {
      return undefined;
    }
    return candlesInChartData.value.map((ohlc) => ohlc.d);
  });

  const allCandlesHigh = computed(() => {
    if (maxData.value.length) {
      return Math.max(...maxData.value.map((ohlc) => Number(ohlc.h)));
    }
    return Infinity;
  });

  const candlesInChartHigh = computed(() => {
    if (candlesInChartData.value.length) {
      return Math.max(
        ...candlesInChartData.value.map((ohlc) => Number(ohlc.h))
      );
    }
    return Infinity;
  });

  const candlesInChartLow = computed(() => {
    if (candlesInChartData.value.length) {
      return Math.min(
        ...candlesInChartData.value.map((ohlc) => Number(ohlc.l))
      );
    } else {
      return 0;
    }
  });

  const candlesInChartH2L = computed(() => {
    if (!candlesInChartHigh.value || !candlesInChartLow.value) {
      return undefined;
    }
    return candlesInChartHigh.value - candlesInChartLow.value;
  });

  const priceAxisWidth = computed(() => {
    if (!allCandlesHigh.value || !DATA_TICKSIZE) {
      return 70;
    }
    const digits = getDigits(DATA_TICKSIZE);
    let beforeComma = 0;
    if (
      String(allCandlesHigh.value).length >=
      String(candlesInChartLow.value).length
    ) {
      beforeComma = getBeforeComma(allCandlesHigh.value);
    } else {
      beforeComma = getBeforeComma(candlesInChartLow.value);
    }
    const width_per_letter = 10.35;
    const widthPixelsSum = (digits + beforeComma) * width_per_letter;
    const maxPriceAxisWidth = 100;
    if (widthPixelsSum > maxPriceAxisWidth) {
      return maxPriceAxisWidth;
    } else {
      return widthPixelsSum;
    }
  });

  return {
    candlesInChartData,
    candlesInChartHigh,
    candlesInChartLow,
    candlesInChartH2L,
    decreaseCandlesShow,
    increaseCandlesShow,
    dataDates,
    priceAxisWidth,
    startingDistanceDifference,
  };
}
