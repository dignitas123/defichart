<template>
  <div>
    <div
    class="crosshair-x"
    :style="`top: ${y}px;`"
    ref="crosshairXLine"
    />
    <div
    class="crosshair-y"
    :style="`left: ${x}px`"
    ref="crosshairYLine"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  x: number;
  y: number;
}>();

const crosshairXLine = ref<HTMLElement | null>(null);
const crosshairYLine = ref<HTMLElement | null>(null);

onMounted(() => {
  if(!crosshairXLine.value || !crosshairYLine.value) {
    return;
  }
})
</script>

<style lang="scss" scoped>
.crosshair-x {
  position: absolute;
  width: 100%;
  border: none;
  border-top: 1px dashed rgba(0, 0, 0, 0.4);
}

.crosshair-y {
  position: absolute;
  height: 100%;
  border: none;
  border-left: 1px dashed rgba(0, 0, 0, 0.4);
}
</style>
