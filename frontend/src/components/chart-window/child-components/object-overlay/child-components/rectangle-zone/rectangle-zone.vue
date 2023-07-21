<template>
  <div class="rectangle" :style="rectangleStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  left: number;
  top: number;
  width: number;
  height: number;
}>();

const rectangleStyle = computed(() => {
  return {
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${props.width}px`,
    height: `${props.height}px`,
  };
});
</script>

<style scoped lang="scss">
.rectangle {
  position: absolute;
  background: rgba(255, 100, 100, 0.5); // TODO: set color by user
}
</style>
