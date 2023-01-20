<template>
  <canvas ref="xBarRef" id="XBarCanvas" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

var textArray = ['Row 1', 'Row 2', 'Row 3'];
var x = 10; // distance between rows
var y = 10; // starting y position

const xBarRef = ref<HTMLCanvasElement | null>(null);
const ctx = xBarRef.value?.getContext('2d');

onMounted(() => {
  if (ctx) {
    for (var i = 0; i < textArray.length; i++) {
      ctx.fillText(textArray[i], 10, y);
      y += x;
    }
  }
});
</script>

<style lang="scss" scoped>
#XBarCanvas {
  height: 100%;
}
</style>
