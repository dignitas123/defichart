<template>
  <div
    class="object-overlay fit"
    ref="objectOverlayRef"
    style="z-index: 11"
    @mousedown="startDrawing"
    @mousemove="draw"
    @mouseup="stopDrawing"
  >
    <!-- TODO: make this thing right -->
    <RectangleZone
      v-if="true"
      :top="drawTop"
      :left="drawLeft"
      :width="drawWidth"
      :height="drawHeight"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import RectangleZone from './child-components/rectangle-zone/rectangle-zone.vue';
import {
  CANDLE_WICK_THICKNESS,
  DATA_TICKSIZE,
} from 'src/pages/broker-charts/consts';

const props = defineProps<{
  candleWidth: number;
  candleDistance: number;
  h2l?: number;
  height?: number;
}>();

const isDrawing = ref(false);
const startX = ref(0);
const startY = ref(0);

// chart is zoomed or the height, width is changed
watch([() => props.candleWidth, () => props.height], () => {
  console.log('have to change the position of object');
});

const objectOverlayRef = ref<HTMLElement>();

function startDrawing(event: MouseEvent) {
  isDrawing.value = true;
  startX.value =
    event.clientX -
    Number(objectOverlayRef.value?.getBoundingClientRect().left);
  startY.value =
    event.clientY - Number(objectOverlayRef.value?.getBoundingClientRect().top);
}

function stopDrawing() {
  isDrawing.value = false;

  drawLeft.value = findCandleMidpoint(drawLeft.value);
  let candleAmount = drawWidth.value / props.candleWidth;
  if (candleAmount < 0.5) {
    candleAmount = 1;
  }
  0;
  const newWidthStartPoint = findCandleMidpoint(
    drawLeft.value + props.candleWidth * candleAmount
  );
  drawWidth.value = newWidthStartPoint - drawLeft.value;

  const oldTop = ref(drawTop.value);
  drawTop.value = findNextPricepoint(drawTop.value);
  const newHeightDifference = oldTop.value - drawTop.value;
  const newHeightStartPoint = findNextPricepoint(
    drawTop.value - drawHeight.value - newHeightDifference
  );
  drawHeight.value = drawTop.value - newHeightStartPoint;
}

function findCandleMidpoint(x: number) {
  let cD = props.candleDistance;
  let cW = props.candleWidth;
  let dist = cW + cD;
  let candleIndex = Math.floor(x / dist);
  let start = candleIndex * dist + cD;
  return start + cW / 2 - CANDLE_WICK_THICKNESS / 2;
}

const tickSizePriceDistanceInPx = computed(() => {
  if (!props.h2l || !props.height) {
    return;
  }
  const numberOfPrices = props.h2l / DATA_TICKSIZE;
  return props.height / numberOfPrices;
});

function findNextPricepoint(y: number) {
  if (!tickSizePriceDistanceInPx.value) {
    return 0;
  }
  return (
    Math.round(y / tickSizePriceDistanceInPx.value) *
    tickSizePriceDistanceInPx.value
  );
}

const drawWidth = ref(0);
const drawHeight = ref(0);
const drawLeft = ref(0);
const drawTop = ref(0);

function draw(event: MouseEvent) {
  if (!isDrawing.value) {
    return;
  }
  const currentX =
    event.clientX -
    Number(objectOverlayRef.value?.getBoundingClientRect().left);
  const currentY =
    event.clientY - Number(objectOverlayRef.value?.getBoundingClientRect().top);
  drawWidth.value = Math.abs(currentX - startX.value);
  drawHeight.value = Math.abs(currentY - startY.value);
  drawLeft.value = Math.min(startX.value, currentX);
  drawTop.value = Math.min(startY.value, currentY);
}
</script>

<style lang="scss" scoped>
.object-overlay {
  position: relative;
}
</style>
