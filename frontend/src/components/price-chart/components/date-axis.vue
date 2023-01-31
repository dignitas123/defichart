<template>
  <span class="date-axis-text" v-for="(text, i) in dateTextArray" :key="i">{{
    text
  }}</span>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { format as dateFormat } from 'date-fns';
import { PriceSeries, usePriceChartData } from '../price-chart.model';
import { MAX_CANDLES_SHOW } from '../consts';

const props = withDefaults(
  defineProps<{
    data: PriceSeries[];
    width?: number;
  }>(),
  {
    data: () => [],
  }
);

const emit = defineEmits<{
  (event: 'verticalLine', price: number): void;
}>();

const { dataDates } = usePriceChartData(props.data);

const MIN_CELL_DISTANCE = 40;

const dateStampCount = computed(() => {
  if (!props.width) {
    return 0;
  }
  return Math.round(props.width / MIN_CELL_DISTANCE);
});

const datesDistance = computed(() => {
  if(MAX_CANDLES_SHOW <= 0 || !dateStampCount.value && dateStampCount.value > 0) {
    return undefined;
  }
  return Math.round(MAX_CANDLES_SHOW / dateStampCount.value);
});

const dateTextArray = computed(() => {
  if(!datesDistance.value || !dataDates.value) return [];
  let returnArray: string[] = [];
  let candleX = Math.round(datesDistance.value / 2);
  for (let i = 0; i < dateStampCount.value; i++) {
    if(candleX < dataDates.value.length) {
      returnArray.push(calculateTimeForX(candleX));
      candleX += datesDistance.value;
    }
  }
  return returnArray;
});

function calculateTimeForX(x: number) {
  console.log("time for", x)
  if (!dataDates.value) return '';
  // Get the difference between the current date and the next date
  let diff = 0;
  if (x < dataDates.value.length - 1) {
    diff = dataDates.value[x + 1].getTime() - dataDates.value[x].getTime();
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

  // x: 20 + i * 20
  console.log("dataDates.value[x]", dataDates.value[x])
  return(dateFormat(dataDates.value[x], format));
}

function drawDateStamps() {
  if(!datesDistance.value) return;

  let xCandleScaledPixelPoint = datesDistance.value / 2; // start point on left bottom
  if (dateTextArray.value && datesDistance.value) {
    for (let i = 0; i < dateTextArray.value.length; i++) {
      // emit('verticalLine', pricePoint);
      xCandleScaledPixelPoint += datesDistance.value;
    }
  }
}

watchEffect(() => {
  if (!props.width) {
    return;
  }
  drawDateStamps();
});
</script>

<style lang="scss" scoped>
.date-axis-text {
  margin-right: 40px;
}
</style>
