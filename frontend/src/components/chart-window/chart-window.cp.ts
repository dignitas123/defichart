import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { computed, Ref } from 'vue';
import { DATA_TICKSIZE } from '../../pages/broker-charts/consts';
import { getBeforeComma, getDigits } from './helpers/digits';

export function usePriceChartData(
  data: Ref<OHLC[]>,
  maxCandlesShow: Ref<number>
) {
  function decreaseMaxCandleShow(n = 1) {
    if (maxCandlesShow.value - n > 1) {
      maxCandlesShow.value -= n;
    } else {
      maxCandlesShow.value = 1;
    }
  }

  function inceaseMaxCandleShow(n = 1) {
    maxCandlesShow.value += n;
  }

  const dataMaxCandlesShow = computed(() => {
    return data.value.slice(-maxCandlesShow.value);
  });

  const startingDistanceDifference = computed(() => {
    return maxCandlesShow.value - data.value.length;
  });

  const dataDates = computed(() => {
    if (!dataMaxCandlesShow.value.length) {
      return undefined;
    }
    return dataMaxCandlesShow.value.map((ohlc) => ohlc.d);
  });

  const maxCandleHighAll = computed(() => {
    if (data.value.length) {
      return Math.max(...data.value.map((ohlc) => Number(ohlc.h)));
    }
    return Infinity;
  });

  const maxCandleHigh = computed(() => {
    if (dataMaxCandlesShow.value.length) {
      return Math.max(
        ...dataMaxCandlesShow.value.map((ohlc) => Number(ohlc.h))
      );
    }
    return Infinity;
  });

  const minCandleLow = computed(() => {
    if (dataMaxCandlesShow.value.length) {
      return Math.min(
        ...dataMaxCandlesShow.value.map((ohlc) => Number(ohlc.l))
      );
    } else {
      return 0;
    }
  });

  const candleH2L = computed(() => {
    if (!maxCandleHigh.value || !minCandleLow.value) {
      return undefined;
    }
    return maxCandleHigh.value - minCandleLow.value;
  });

  const priceAxisWidth = computed(() => {
    if (!maxCandleHighAll.value || !DATA_TICKSIZE) {
      return 70;
    }
    const digits = getDigits(DATA_TICKSIZE);
    let beforeComma = 0;
    if (
      String(maxCandleHighAll.value).length >= String(minCandleLow.value).length
    ) {
      beforeComma = getBeforeComma(maxCandleHighAll.value);
    } else {
      beforeComma = getBeforeComma(minCandleLow.value);
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
    maxCandlesShow,
    decreaseMaxCandleShow,
    inceaseMaxCandleShow,
    dataMaxCandlesShow,
    startingDistanceDifference,
    dataDates,
    maxCandleHigh,
    minCandleLow,
    candleH2L,
    priceAxisWidth,
  };
}
