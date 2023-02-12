<template>
  <div v-if="x || y">
    <div class="crosshair-x" :style="`top: ${y}px;`" />
    <div class="crosshair-y" :style="`left: ${x}px`" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  x: number;
  y: number;
}>();
</script>

<style lang="scss" scoped>
.crosshair-x {
  position: absolute;
  width: 100%;
  border: none;
  border-top: 1px dashed rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.crosshair-y {
  position: absolute;
  height: 100%;
  border: none;
  border-left: 1px dashed rgba(0, 0, 0, 0.4);
  z-index: 10;
}
</style>
