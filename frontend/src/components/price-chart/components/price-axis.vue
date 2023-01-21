<template>
  <canvas ref="xBarRef" id="XBarCanvas" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { nextTick, watchEffect, ref, computed, withDefaults } from 'vue';
import { roundToTicksize } from '../helpers/digits';

export interface PriceAxisProps {
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
});

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const priceArray = computed(() => {
  if (props.scale && props.highestPrice) {
    const scaleValue = parseFloat(props.scale);
    let returnArray: string[] = [];
    let price = props.highestPrice - scaleValue / 2;
    for (let i = 0; i < props.maxScale; i++) {
      returnArray.push(roundToTicksize(price, props.tickSize));
      price -= scaleValue;
    }
    return returnArray;
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

const xBarRef = ref<HTMLCanvasElement | null>(null);

watchEffect(async () => {
  if (
    xBarRef.value &&
    props.height &&
    props.width &&
    rowDistance.value &&
    props.scale &&
    props.highestPrice
  ) {
    const FONTSIZE = 14;
    let pricePoint = rowDistance.value / 2;
    const ctx = xBarRef.value?.getContext('2d');
    if (ctx && priceArray.value && rowDistance.value) {
      await nextTick();
      ctx.font = `${FONTSIZE}px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif`;
      for (let i = 0; i < priceArray.value.length; i++) {
        const text = String(priceArray.value[i]);
        ctx.fillText(text, 2, pricePoint + FONTSIZE / 3);
        emit('horizontalLine', pricePoint);
        pricePoint += rowDistance.value;
      }
    }
  }
});
</script>

<style lang="scss" scoped>
#XBarCanvas {
  height: 100%;
  width: 100%;
}
</style>
