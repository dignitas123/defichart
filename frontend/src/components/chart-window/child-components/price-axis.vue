<template>
  <div
    class="price-axis prevent-select q-mr-xs q-ml-sm"
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
    <span
      v-if="currentCandleClose"
      class="current-price-badge text-center absolute prevent-select"
      :class="{
        'arrow-top-32': currentPriceAtTop,
        'arrow-top-68': currentPriceAtBottom,
      }"
      :style="`top: ${currentPriceYPosition}px`"
      ref="priceHairBadgeRef"
    >
      {{ currentCandleClose.toFixed(digits) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, ref, onUnmounted } from 'vue';
import { DATA_TICKSIZE } from '../../../pages/broker-charts/consts';
import { roundToTicksize, getDigits } from '../helpers/digits';

const props = defineProps<{
  currentCandleClose?: number;
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
const priceHairBadgeRef = ref<HTMLElement>();

const digits = getDigits(DATA_TICKSIZE);

const badgeYposition = computed(() => {
  const crossHairBadgeHeight = crosshairBadgeRef.value?.offsetHeight;
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

const currentPriceAtTop = ref(false);
const currentPriceAtBottom = ref(false);

const priceBadgeHeight = computed(() => priceHairBadgeRef.value?.offsetHeight);

const currentPriceYPosition = ref(0);

const selectedPrice = computed(() => {
  if (!props.crossHairY || !props.h2l || !props.height || !props.high) {
    return 0;
  }
  return roundToTicksize(
    props.high - props.crossHairY * (props.h2l / props.height),
    DATA_TICKSIZE
  ).toFixed(digits);
});

watchEffect(() => {
  if (
    props.height &&
    props.h2l &&
    props.low &&
    priceBadgeHeight.value &&
    props.currentCandleClose
  ) {
    const pricePoint =
      (1 - (props.currentCandleClose - props.low) / props.h2l) * props.height;
    const newYPosition = pricePoint + priceBadgeHeight.value / 2;
    if (newYPosition < priceBadgeHeight.value) {
      currentPriceYPosition.value = priceBadgeHeight.value;
      currentPriceAtTop.value = true;
      return;
    } else if (currentPriceAtTop.value) {
      currentPriceAtTop.value = false;
    }
    if (newYPosition > props.height) {
      currentPriceYPosition.value = props.height;
      currentPriceAtBottom.value = true;
      return;
    } else if (currentPriceAtBottom.value) {
      currentPriceAtBottom.value = false;
    }
    currentPriceYPosition.value = newYPosition + 1;
  }
});

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

  let priceBeginningDistance = rowDistanceInPrice / 2;
  const priceStartRest = priceBeginningDistance % DATA_TICKSIZE;

  if (priceStartRest !== 0) {
    let newPriceStart = priceBeginningDistance + priceStartRest;
    const ticksizeMult = 1 / DATA_TICKSIZE;
    if (newPriceStart < props.high) {
      priceBeginningDistance = newPriceStart;
      marginTop = priceStartRest * onePriceInPixel * ticksizeMult;
    } else {
      priceBeginningDistance = DATA_TICKSIZE * onePriceInPixel * ticksizeMult;
    }
  }

  for (
    let price = props.high - priceBeginningDistance;
    price > props.low;
    price -= rowDistanceInPrice
  ) {
    priceArray.push(price.toFixed(digits));
  }

  drawHorizontalPriceLines();
});

function drawHorizontalPriceLines() {
  if (rowDistance) {
    let pricePoint = rowDistance / 2 + marginTop;
    if (priceArray && rowDistance) {
      for (let i = 0; i < priceArray.length; i++) {
        emit('horizontalLine', pricePoint);
        pricePoint += rowDistance;
      }
    }
  }
}

onUnmounted(() => {
  rowDistance = 0;
  priceArray = [];
  marginTop = 0;
});
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

.current-price-badge {
  background: black;
  opacity: 0.9;
  color: white;
  margin-top: 1px;
  margin-left: -5px;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -4px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-right: 5px solid black;
    border-bottom: 5px solid transparent;
  }

  &.arrow-top-32 {
    &::before {
      top: 32%;
    }
  }

  &.arrow-top-68 {
    &::before {
      top: 68%;
    }
  }
}
</style>
