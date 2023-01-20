<template>
  <canvas ref="xBarRef" id="XBarCanvas" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { nextTick, watchEffect, ref } from 'vue';

export interface PricAxisProps {
  width?: number;
  height?: number;
}

const props = defineProps<PricAxisProps>();

var textArray = [0.302131, 0.302131, 0.302131, 0.302131, 0.302131, 0.302131, 0.302131, 0.302131];
var x = 30; // distance between rows
var y = 30; // starting y position

const xBarRef = ref<HTMLCanvasElement | null>(null);

watchEffect(async () => {
  if (xBarRef.value && props.height && props.width) {
    const ctx = xBarRef.value?.getContext('2d');
    console.log(props);
    if (ctx) {
      await nextTick();
      console.log('ctx ');
      ctx.font = '12px verdana';

      for (var i = 0; i < textArray.length; i++) {
        ctx.fillText(String(textArray[i]), 0, y);
        y += x;
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
