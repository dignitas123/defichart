import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { computed, Ref } from 'vue';
import { DATA_TICKSIZE } from '../../pages/broker-charts/consts';
import { getBeforeComma, getDigits } from './helpers/digits';

export function useChartData(
  data: Ref<OHLC[]>,
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

  const candlesInChartData = computed(() => {
    const dataLength = data.value.length;
    return data.value.slice(
      dataLength - candlesShow.value + offset.value,
      dataLength + offset.value
    );
  });

  const startingDistanceDifference = computed(() => {
    return candlesShow.value - data.value.length;
  });

  const dataDates = computed(() => {
    if (!candlesInChartData.value.length) {
      return undefined;
    }
    return candlesInChartData.value.map((ohlc) => ohlc.d);
  });

  const allCandlesHigh = computed(() => {
    if (data.value.length) {
      return Math.max(...data.value.map((ohlc) => Number(ohlc.h)));
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
