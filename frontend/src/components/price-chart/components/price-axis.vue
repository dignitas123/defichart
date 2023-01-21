<template>
  <canvas ref="xBarRef" id="XBarCanvas" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { nextTick, watchEffect, ref, computed } from 'vue';
import { roundToTicksize } from '../helpers/digits';

export interface PricAxisProps {
  width?: number;
  height?: number;
  scale?: string;
  maxScale?: number;
  tickSize?: number;
}

const props = withDefaults(defineProps<PricAxisProps>(), {
  maxScale: 13,
  tickSize: 0.1,
});

const priceArray = computed(() => {
  if (props.scale) {
    let returnArray: string[] = [];
    let price = parseFloat(props.scale);
    for (let i = 0; i < props.maxScale; i++) {
      returnArray.unshift(roundToTicksize(price, props.tickSize));
      price += parseFloat(props.scale);
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
  if (xBarRef.value && props.height && props.width && rowDistance.value) {
    let pricePoint: number = rowDistance.value;
    const ctx = xBarRef.value?.getContext('2d');
    if (ctx && priceArray.value && rowDistance.value) {
      await nextTick();
      ctx.font = '12px verdana';

      for (var i = 0; i < priceArray.value.length; i++) {
        ctx.fillText(String(priceArray.value[i]), 0, pricePoint);
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
