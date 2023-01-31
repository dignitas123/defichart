import { computed, ref } from 'vue';
import { DATA_TICKSIZE, MAX_CANDLES_SHOW } from './consts';
import { getBeforeComma, getDigits } from './helpers/digits';

export interface PriceSeries {
  d: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function usePriceChartData(data: PriceSeries[]) {
  const data_max_candles_show = ref(data.slice(-MAX_CANDLES_SHOW));

  const starting_distance_difference = MAX_CANDLES_SHOW - data.length;

  const dataDates = computed(() => {
    if (!data_max_candles_show.value.length) {
      return undefined;
    }
    return data_max_candles_show.value.map((ohlc) => ohlc.d);
  });

  const maxCandleHigh = computed(() => {
    if (data_max_candles_show.value.length) {
      return Math.max(
        ...data_max_candles_show.value.map((ohlc) => Number(ohlc.h))
      );
    }
    return Infinity;
  });

  const minCandleLow = computed(() => {
    if (data_max_candles_show.value.length) {
      return Math.min(
        ...data_max_candles_show.value.map((ohlc) => Number(ohlc.l))
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
    data_max_candles_show,
    starting_distance_difference,
    dataDates,
    maxCandleHigh,
    minCandleLow,
    candleH2L,
    priceAxisWidth,
  };
}
