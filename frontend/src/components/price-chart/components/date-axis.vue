<template>
  <canvas id="YBarCanvas" ref="yBarRef" :width="width" :height="height" />
</template>

<script lang="ts" setup>
import { ref, watchEffect, computed, nextTick } from 'vue';
import { format as dateFormat } from 'date-fns';

interface DateAxisProps {
  dates?: Date[];
  width?: number;
  height?: number;
}

const props = defineProps<DateAxisProps>();

const yBarRef = ref<HTMLCanvasElement | null>(null);

const ctxYBar = computed(() => {
  if (yBarRef.value) {
    return yBarRef.value.getContext('2d');
  } else {
    return undefined;
  }
});

watchEffect(async () => {
  if (ctxYBar.value && props.dates?.length) {
    await nextTick();

    const FONTSIZE = 14;

    ctxYBar.value.font = `${FONTSIZE}px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif`;
    // Loop through the date array
    for (let i = 0; i < props.dates?.length; i += 8) {
      // Get the difference between the current date and the next date
      let diff = 0;
      if (i < props.dates.length - 1) {
        diff = props.dates[i + 1].getTime() - props.dates[i].getTime();
      }

      // Determine the format to display the date in based on the difference
      let format;
      if (diff < 1000 * 60 * 60 * 24) {
        format = 'hh:mm:ss';
      } else if (diff < 1000 * 60 * 60 * 24 * 30) {
        format = 'dd';
      } else if (diff < 1000 * 60 * 60 * 24 * 30 * 12) {
        format = 'MM';
      } else {
        format = 'yyyy';
      }
      // Draw the date on the canvas
      ctxYBar.value.fillText(
        dateFormat(props.dates[i], format),
        20 + i * 20,
        20
      );
    }
  }
});
</script>

<style lang="scss" scoped>
#YBarCanvas {
  height: 100%;
  width: 100%;
}
</style>
