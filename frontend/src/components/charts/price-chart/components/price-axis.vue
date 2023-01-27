<template>
  <div
    class="prevent-select q-ml-xs"
    :style="`width: ${width}px; height: ${priceAxisHeight}px;`"
  >
    <div class="items-center price" v-for="(price, i) in priceArray" :key="i">
      <span>{{ String(price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, withDefaults } from 'vue';
import { DATA_TICKSIZE } from '../consts';
import { roundToTicksize } from '../helpers/digits';

export interface PriceAxisProps {
  update: boolean;
  h2l?: number;
  paddingTop?: number; // padding top needs to be subtracted
  highestPrice?: number;
  width?: number;
  height?: number;
  tickSize?: number;
}

const props = withDefaults(defineProps<PriceAxisProps>(), {
  tickSize: 0.1,
  paddingTop: 32,
});

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const MIN_ROW_DISTANCE = 40; // in px

const priceLinesCount = computed(() => {
  if (priceAxisHeight.value) {
    return Math.round(priceAxisHeight.value / MIN_ROW_DISTANCE);
  } else {
    return undefined;
  }
});

const priceDistance = computed(() => {
  if (props.h2l && priceLinesCount.value) {
    const distance = props.h2l / priceLinesCount.value;
    return roundToTicksize(distance, DATA_TICKSIZE);
  } else {
    return undefined;
  }
});

const priceArray = computed(() => {
  // TODO: does the calcualation 3x on mounted - why
  if (priceDistance.value && props.highestPrice && priceLinesCount.value) {
    const scaleValue = parseFloat(priceDistance.value);
    let returnArray: string[] = [];
    let price = props.highestPrice - scaleValue / 2;
    for (let i = 0; i < priceLinesCount.value - 1; i++) {
      returnArray.push(roundToTicksize(price, props.tickSize));
      price -= scaleValue;
    }
    return returnArray;
  } else {
    return undefined;
  }
});

// is the same height like the chart height
const priceAxisHeight = computed(() => {
  if (props.height) {
    return props.height - props.paddingTop;
  } else {
    return undefined;
  }
});

const rowDistance = computed(() => {
  if (props.height && priceLinesCount.value) {
    return props.height / priceLinesCount.value;
  } else {
    return undefined;
  }
});

const rowDistanceInPixel = computed(() => {
  if (rowDistance.value) {
    return `${rowDistance.value}px`;
  } else {
    return undefined;
  }
});

watch(
  () => props.update,
  () => {
    calculatePriceAxis();
  }
);

function calculatePriceAxis() {
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
</script>

<style lang="scss" scoped>
.price {
  display: flex;
  height: v-bind(rowDistanceInPixel);
}
</style>
