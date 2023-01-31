<template>
  <span class="date-axis-text" v-for="(text, i) in dateTexts" :key="i">{{
    text
  }}</span>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { format as dateFormat } from 'date-fns';
import { PriceSeries, usePriceChartData } from '../price-chart.model';

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

const dateTexts = ref<string[]>([]);

const priceArray = computed(() => {
  if (!priceDistance.value || !maxCandleHigh.value || !priceLinesCount.value) {
    return undefined;
  }
  const scaleValue = parseFloat(priceDistance.value);
  let returnArray: string[] = [];
  let price = maxCandleHigh.value - scaleValue / 2;
  for (let i = 0; i < priceLinesCount.value; i++) {
    returnArray.push(roundToTicksize(price, DATA_TICKSIZE));
    price -= scaleValue;
  }
  return returnArray;
});

function drawDateStamps() {
  if (!dataDates.value) return;
  // Loop through the date array
  for (let i = 0; i < dataDates.value.length; i += 8) {
    // Get the difference between the current date and the next date
    let diff = 0;
    if (i < dataDates.value.length - 1) {
      diff = dataDates.value[i + 1].getTime() - dataDates.value[i].getTime();
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
    dateTexts.value.push(dateFormat(dataDates.value[i], format));
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
