<template>
  <div
    ref="xBarRef"
    class="prevent-select q-ml-xs"
    :style="`width: ${width}px; height: ${priceAxisHeight}px;`"
  >
    <div class="items-center price" v-for="(price, i) in priceArray" :key="i">
      <span>{{ String(price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, watchEffect, ref, computed, withDefaults } from 'vue';
import { roundToTicksize } from '../helpers/digits';

export interface PriceAxisProps {
  update: boolean;
  paddingTop?: number; // padding top needs to be subtracted
  highestPrice?: number;
  width?: number;
  height?: number;
  scale?: string;
  maxScale?: number;
  tickSize?: number;
}

const props = withDefaults(defineProps<PriceAxisProps>(), {
  maxScale: 13,
  tickSize: 0.1,
  paddingTop: 32,
});

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const priceArray = computed(() => {
  if (props.scale && props.highestPrice) {
    const scaleValue = parseFloat(props.scale);
    let returnArray: string[] = [];
    let price = props.highestPrice - scaleValue / 2;
    for (let i = 0; i < props.maxScale - 1; i++) {
      returnArray.push(roundToTicksize(price, props.tickSize));
      price -= scaleValue;
    }
    return returnArray;
  } else {
    return undefined;
  }
});

const priceAxisHeight = computed(() => {
  if (props.height) {
    return props.height - props.paddingTop;
  } else {
    return undefined;
  }
});

const rowDistance = computed(() => {
  if (props.height) {
    return props.height / props.maxScale;
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

const xBarRef = ref<HTMLCanvasElement | null>(null);

watch(
  () => props.update,
  async () => {
    if (rowDistance.value) {
      await calculatePriceAxis(rowDistance.value);
    }
  }
);

watchEffect(() => {
  if (rowDistance.value) {
    calculatePriceAxis(rowDistance.value);
  }
});

function calculatePriceAxis(rowDistance: number) {
  let pricePoint = rowDistance / 2; // start point on top
  if (priceArray.value && rowDistance) {
    for (let i = 0; i < priceArray.value.length; i++) {
      emit('horizontalLine', pricePoint);
      pricePoint += rowDistance;
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
