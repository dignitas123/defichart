<template>
  <div ref="xBarRef" class="column prevent-select" id="priceAxis" :style="`width: ${width}px; height: ${height}px;`">
    <div class="col" v-for="(price, i) in priceArray" :key="i" :style="`height: ${rowDistance}px;`">
      {{ String(price) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, watchEffect, ref, computed, withDefaults } from 'vue';
import { roundToTicksize } from '../helpers/digits';

export interface PriceAxisProps {
  highestPrice?: number;
  width?: number;
  height?: number;
  scale?: string;
  maxScale?: number;
  tickSize?: number;
  update: boolean;
}

const props = withDefaults(defineProps<PriceAxisProps>(), {
  maxScale: 13,
  tickSize: 0.1,
});

const emit = defineEmits<{
  (event: 'horizontalLine', price: number): void;
}>();

const priceArray = computed(() => {
  if (props.scale && props.highestPrice) {
    const scaleValue = parseFloat(props.scale);
    let returnArray: string[] = [];
    let price = props.highestPrice - scaleValue / 2;
    for (let i = 0; i < props.maxScale; i++) {
      returnArray.push(roundToTicksize(price, props.tickSize));
      price -= scaleValue;
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

const rowDistanceInPixel = computed(() => {
  if(rowDistance.value) {
    console.log(rowDistance.value)
    return (rowDistance.value / 3) + 'px';
  } else {
    return undefined;
  }
})

const xBarRef = ref<HTMLCanvasElement | null>(null);

watch(() => props.update, async () => {
  if(rowDistance.value) {
    await calculatePriceAxis(rowDistance.value);
  }
})

watchEffect(async () => {
  if (rowDistance.value) {
    await calculatePriceAxis(rowDistance.value);
  }
});

async function calculatePriceAxis(rowDistance: number){
  let pricePoint = rowDistance / 2; // start point on top
    if (priceArray.value && rowDistance) {
      for (let i = 0; i < priceArray.value.length; i++) {
        emit('horizontalLine', pricePoint);
        pricePoint += rowDistance;
      }
    }
}
</script>

<style lang="scss" scoped>
#priceAxis {
  padding-top: v-bind(rowDistanceInPixel);
  // margin-bottom: v-bind(rowDistanceInPixel);
}
</style>
