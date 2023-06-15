<template>
  <g>
    <rect
      :x="candle.wX"
      :y="candle.uwY"
      :width="CANDLE_WICK_THICKNESS"
      :height="candle.uwHeight"
      :style="`fill: ${candle.wickFillColor}`"
      shape-rendering="crispEdges"
    />
    <rect
      :x="candle.wX"
      :y="candle.lwY - 2"
      :width="CANDLE_WICK_THICKNESS"
      :height="candle.lwHeight + 2"
      :style="`fill: ${candle.wickFillColor}`"
      shape-rendering="crispEdges"
    />
  </g>
  <g>
    <rect
      :x="candle.x"
      :y="candle.y"
      :width="candleWidth"
      :height="candle.height"
      :style="`fill: ${candle.fillColor}`"
      :stroke="CANDLE_BORDER && candle.height !== 1 ? CANDLE_BORDER_COLOR : ''"
      shape-rendering="crispEdges"
    />
  </g>
</template>

<script setup lang="ts">
import {
  CANDLE_WICK_THICKNESS,
  CANDLE_BORDER,
  CANDLE_BORDER_COLOR,
} from 'src/pages/broker-charts/consts';
import { Candle } from '../candlestick-chart.if';

defineProps<{
  candle: Candle;
  candleWidth: number;
}>();
</script>
