import { computed, ref } from 'vue';
import { DATA_TICKSIZE } from './consts';
import { getBeforeComma, getDigits } from './helpers/digits';

export interface PriceSeries {
  d: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

const max_candles_show = ref(30);
const data = ref<PriceSeries[]>([]);

export function usePriceChartData() {
  // Setter
  function setData(d: PriceSeries[]) {
    data.value = d;
  }
  function setMaxCandlesShow(x: number) {
    max_candles_show.value = x;
  }
  function decreaseMaxCandleShow() {
    max_candles_show.value--;
  }
  function inceaseMaxCandleShow() {
    max_candles_show.value++;
  }
  // Getter
  const maxCandlesShow = computed(() => {
    return max_candles_show.value;
  });

  const dataMaxCandlesShow = computed(() => {
    return data.value.slice(-max_candles_show.value);
  });

  const startingDistanceDifference = computed(() => {
    return max_candles_show.value - data.value.length;
  });

  const dataDates = computed(() => {
    if (!dataMaxCandlesShow.value.length) {
      return undefined;
    }
    return dataMaxCandlesShow.value.map((ohlc) => ohlc.d);
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
    if (maxCandleHigh.value && DATA_TICKSIZE) {
      const digits = getDigits(DATA_TICKSIZE);
      const beforeComma =
        minCandleLow.value > 0
          ? getBeforeComma(maxCandleHigh.value)
          : getBeforeComma(minCandleLow.value);
      const width_per_letter = 10.3;
      const widthPixelsSum = (digits + beforeComma) * width_per_letter;
      const maxPriceAxisWidth = 100;
      if (widthPixelsSum > maxPriceAxisWidth) {
        return maxPriceAxisWidth;
      } else {
        return widthPixelsSum;
      }
    }
    return 0;
  });

  return {
    setData,
    setMaxCandlesShow,
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
