<template>
  <div
    class="price-axis prevent-select q-mx-xs"
    :style="`height: ${props.height}px; margin-top: ${marginTop}px`"
  >
    <div
      class="price items-center"
      v-for="(price, i) in priceArray"
      :key="i"
      :style="`height: ${rowDistance}px`"
    >
      <span>{{ String(price) }}</span>
    </div>
    <span
      v-if="badgeShow && crossHairY"
      class="crosshair-badge text-center absolute prevent-select"
      :style="`top: ${badgeYposition}px`"
      ref="crosshairBadgeRef"
    >
      {{ selectedPrice }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, ref } from 'vue';
import { DATA_TICKSIZE } from '../../../pages/broker-charts/consts';
import { roundToTicksize, getDigits } from '../helpers/digits';

const props = defineProps<{
  h2l?: number;
  high?: number;
  low?: number;
  height?: number;
  crossHairY?: number;
  badgeShow?: boolean;
}>();

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const MIN_ROW_DISTANCE = 40; // in px

const crosshairBadgeRef = ref<HTMLElement>();

const badgeYposition = computed(() => {
  let crossHairBadgeHeight = crosshairBadgeRef.value?.offsetHeight;
  if (!props.height || !crossHairBadgeHeight || !props.crossHairY) {
    return 0;
  }
  const newYPosition = props.crossHairY + crossHairBadgeHeight / 2;
  if (newYPosition < crossHairBadgeHeight) {
    return crossHairBadgeHeight;
  } else if (newYPosition > props.height) {
    return props.height;
  }
  return newYPosition;
});

const selectedPrice = computed(() => {
  if (!props.crossHairY || !props.h2l || !props.height || !props.high) {
    return 0;
  }
  return roundToTicksize(
    props.high - props.crossHairY * (props.h2l / props.height),
    DATA_TICKSIZE
  );
});

const digits = getDigits(DATA_TICKSIZE);

let rowDistance = 0;
let priceArray: string[] = [];
let marginTop = 0;
watchEffect(() => {
  if (!props.height || !props.low || !props.high || !props.h2l) {
    return;
  }
  marginTop = 0;
  priceArray = [];

  const numberOfPrices = props.h2l / DATA_TICKSIZE;
  const onePriceInPixel = props.height / numberOfPrices;

  let row = onePriceInPixel;
  while (row < MIN_ROW_DISTANCE) {
    row += onePriceInPixel;
  }

  rowDistance = row;
  const rowDistanceInPrice = (rowDistance / onePriceInPixel) * DATA_TICKSIZE;

  let priceBeginningDistance = rowDistanceInPrice / 2; // * DATA_TICKSIZE;
  const priceStartRest = priceBeginningDistance % DATA_TICKSIZE;

  if (priceStartRest !== 0) {
    let newPriceStart = priceBeginningDistance + priceStartRest; // * DATA_TICKSIZE;
    if (newPriceStart < props.high) {
      priceBeginningDistance = newPriceStart;
      marginTop = priceStartRest * onePriceInPixel * (1 / DATA_TICKSIZE);
    } else {
      priceBeginningDistance = DATA_TICKSIZE;
    }
  }

  for (
    let price = props.high - priceBeginningDistance;
    price > props.low;
    price -= rowDistanceInPrice
  ) {
    priceArray.push(price.toFixed(digits));
  }

  drawPrices();
});

function drawPrices() {
  if (rowDistance) {
    let pricePoint = rowDistance / 2 + marginTop; // start point on top
    if (priceArray && rowDistance) {
      for (let i = 0; i < priceArray.length; i++) {
        emit('horizontalLine', pricePoint);
        pricePoint += rowDistance;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.price {
  display: flex;
}

.crosshair-badge {
  background: var(--q-dark-page);
  opacity: 0.9;
  color: white;
  margin-top: 1px;
  margin-left: -5px;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;
}
</style>
