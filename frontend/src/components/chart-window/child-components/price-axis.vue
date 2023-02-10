<template>
  <div
    class="prevent-select q-ml-xs"
    :style="`width: ${width}px; height: ${props.height}px;`"
  >
    <div class="items-center price" v-for="(price, i) in priceArray" :key="i">
      <span>{{ String(price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATA_TICKSIZE } from '../../../pages/broker-charts/consts';
import { roundToTicksize } from '../helpers/digits';
import { computed, watchEffect } from 'vue';

const props = defineProps<{
  h2l?: number;
  high?: number;
  height?: number;
  width?: number;
}>();

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const MIN_ROW_DISTANCE = 40; // in px

const priceLinesCount = computed(() => {
  if (!props.height) {
    return undefined;
  }
  return Math.round(props.height / MIN_ROW_DISTANCE);
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
  if (!priceDistance.value || !props.high || !priceLinesCount.value) {
    return undefined;
  }
  const scaleValue = parseFloat(priceDistance.value);
  let returnArray: string[] = [];
  let price = props.high - scaleValue / 2;
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
