<template>
  <span
    class="date-axis-text text-center absolute prevent-select"
    v-for="(entry, i) in allDatePositionEntries"
    :key="i"
    :style="`left: ${entry.x}px`"
    :class="{ 'text-weight-bold': entry.bold }"
    >{{ entry.date }}</span
  >
</template>

<script lang="ts" setup>
import { DATE_BOX_WIDTH } from '../consts';
import { usePriceChartData } from '../price-chart.model';

const props = defineProps<{
  width?: number;
}>();

const emit = defineEmits<{
  (event: 'verticalLine', price: number): void;
}>();

const { allDatePositionEntries } = usePriceChartData();
</script>

<style lang="scss" scoped>
.date-axis-text {
  width: v-bind("DATE_BOX_WIDTH + 'px'");
}
</style>
