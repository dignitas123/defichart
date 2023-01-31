<template>
  <div
    class="prevent-select q-ml-xs"
    :style="`width: ${priceAxisWidth}px; height: ${props.height}px;`"
  >
    <div class="items-center price" v-for="(price, i) in priceArray" :key="i">
      <span>{{ String(price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATA_TICKSIZE } from '../consts';
import {
  getBeforeComma,
  getDigits,
  roundToTicksize,
} from '../helpers/digits';
import { computed, watchEffect, withDefaults } from 'vue';
import { PriceSeries, usePriceChartData } from '../price-chart.model';

const props = withDefaults(
  defineProps<{
    data: PriceSeries[];
    height?: number;
  }>(),
  {
    data: () => [],
  }
);

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const { candleH2L, maxCandleHigh } = usePriceChartData(props.data);

const MIN_ROW_DISTANCE = 40; // in px

const priceLinesCount = computed(() => {
  if (!props.height) {
    return undefined;
  }
  return Math.round(props.height / MIN_ROW_DISTANCE);
});

const priceDistance = computed(() => {
  if (candleH2L.value && priceLinesCount.value) {
    const distance = candleH2L.value / priceLinesCount.value;
    return roundToTicksize(distance, DATA_TICKSIZE);
  } else {
    return undefined;
  }
});

const priceArray = computed(() => {
  if (!priceDistance.value || !maxCandleHigh.value || !priceLinesCount.value) {
    return undefined;
  }
  const scaleValue = parseFloat(priceDistance.value);
  let returnArray: string[] = [];
  let price = maxCandleHigh.value - scaleValue / 2;
  for (let i = 0; i < priceLinesCount.value; i++) {
    returnArray.push(roundToTicksize(price, DATA_TICKSIZE));
    price -= scaleValue;
  }
  return returnArray;
});

const rowDistance = computed(() => {
  if (!props.height || !priceLinesCount.value) {
    return undefined;
  }
  return props.height / priceLinesCount.value;
});

const rowDistanceInPixel = computed(() => {
  if (rowDistance.value) {
    return `${rowDistance.value}px`;
  } else {
    return undefined;
  }
});

const priceAxisWidth = computed(() => {
  if (maxCandleHigh.value && DATA_TICKSIZE) {
    const digits = getDigits(DATA_TICKSIZE);
    const beforeComma = getBeforeComma(maxCandleHigh.value);
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

function drawPrices() {
  if (rowDistance.value) {
    let pricePoint = rowDistance.value / 2; // start point on top
    if (priceArray.value && rowDistance) {
      for (let i = 0; i < priceArray.value.length; i++) {
        emit('horizontalLine', pricePoint);
        pricePoint += rowDistance.value;
      }
    }
  }
}

watchEffect(() => {
  if (!props.height) {
    return;
  }
  drawPrices();
});
</script>

<style lang="scss" scoped>
.price {
  display: flex;
  height: v-bind(rowDistanceInPixel);
}
</style>
