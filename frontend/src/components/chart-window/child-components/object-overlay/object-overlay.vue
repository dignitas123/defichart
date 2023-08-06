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
      :height="drawHeight"
      :left="drawLeft"
      :width="drawWidth"
    />
  </div>
</template>

<script setup lang="ts">
// TODO: this object overlay component should be the parent of all objects on the chart,
// the rectangle zone is one of them and there should be a config object containing all the components
// the <RectangleZone> should be a dynamic component in future
import { ref, watch } from 'vue';
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
  candlesShow: number;
  offset?: number;
  chartHighScaleFactor: number;
  chartLowScaleFactor: number;
}>();

const isDrawing = ref(false);
const startX = ref(0);
const startY = ref(0);

watch(
  () => props.offset,
  (now, before) => {
    const change = Number(now) - Number(before);
    drawLeft.value -= change * (props.candleWidth + props.candleDistance);
  }
);

watch(
  () => props.chartHighScaleFactor,
  () => {
    if (!props.height || !drawHeight.value) {
      return;
    }
    drawTop.value = findNextPricepoint(
      props.height *
        (props.chartHighScaleFactor +
          drawPriceTopH2LRatio.value * (1 - props.chartHighScaleFactor))
    );
  }
);

watch(
  () => props.candleWidth,
  () => {
    drawLeft.value =
      (props.candlesShow - drawCandleLeftIndex.value + 1) *
        (props.candleWidth + props.candleDistance) -
      props.candleWidth / 2;
    const drawLeftPoint =
      (props.candlesShow - drawCandleRightIndex.value + 1) *
        (props.candleWidth + props.candleDistance) -
      props.candleWidth / 2;
    drawWidth.value = drawLeftPoint - drawLeft.value;
  }
);

watch(
  () => props.height,
  () => {
    if (!props.height) {
      return;
    }
    drawTop.value = findNextPricepoint(
      props.height * drawPriceTopH2LRatio.value
    );
    const drawBottomPrice = findNextPricepoint(
      props.height * drawPriceBottomH2LRatio.value
    );
    drawHeight.value = drawTop.value - drawBottomPrice;
  }
);

const objectOverlayRef = ref<HTMLElement>();

function startDrawing(event: MouseEvent) {
  isDrawing.value = true;
  startX.value =
    event.clientX -
    Number(objectOverlayRef.value?.getBoundingClientRect().left);
  startY.value =
    event.clientY - Number(objectOverlayRef.value?.getBoundingClientRect().top);
}

const initialDrawTop = ref(0);

function stopDrawing() {
  if (!props.height) {
    return;
  }
  isDrawing.value = false;

  const { midPoint: leftMidPoint, index: leftIndex } = findCandleMidpoint(
    drawLeft.value
  );
  drawLeft.value = leftMidPoint;
  drawCandleLeftIndex.value = props.candlesShow - leftIndex;
  let candleAmount = drawWidth.value / props.candleWidth;
  if (candleAmount < 0.5) {
    candleAmount = 1;
  }
  const { midPoint: rightMidpoint, index: rightIndex } = findCandleMidpoint(
    drawLeft.value + props.candleWidth * candleAmount
  );
  drawWidth.value = rightMidpoint - drawLeft.value;
  drawCandleRightIndex.value = props.candlesShow - rightIndex;
  initialDrawTop.value = drawTop.value;

  drawTop.value = findNextPricepoint(drawTop.value);
  drawPriceTopH2LRatio.value = drawTop.value / props.height;

  const newHeightDifference = initialDrawTop.value - drawTop.value;

  const drawObjectBottomPriceInPx =
    drawTop.value - drawHeight.value - newHeightDifference;
  const newHeightStartPoint = findNextPricepoint(drawObjectBottomPriceInPx);
  drawHeight.value = drawTop.value - newHeightStartPoint;
  drawPriceBottomH2LRatio.value = drawObjectBottomPriceInPx / props.height;
}

function findCandleMidpoint(x: number) {
  let cD = props.candleDistance;
  let cW = props.candleWidth;
  let dist = cW + cD;
  let index = Math.floor(x / dist);
  let start = index * dist + cD;
  const midPoint = start + cW / 2 - CANDLE_WICK_THICKNESS / 2;
  return {
    midPoint,
    index,
  };
}

function getTickSizePriceDistanceInPx() {
  if (!props.h2l || !props.height) {
    return 0;
  }
  const pricesAmount = props.h2l / DATA_TICKSIZE;
  return props.height / pricesAmount;
}

function findNextPricepoint(y: number) {
  const tickSizePriceDistanceInPx = getTickSizePriceDistanceInPx();

  return Math.round(y / tickSizePriceDistanceInPx) * tickSizePriceDistanceInPx;
}

const drawWidth = ref(0);
const drawHeight = ref(0);
const drawLeft = ref(0);
const drawTop = ref(0);
const drawCandleLeftIndex = ref(0);
const drawCandleRightIndex = ref(0);
const drawPriceTopH2LRatio = ref(0);
const drawPriceBottomH2LRatio = ref(0);

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
