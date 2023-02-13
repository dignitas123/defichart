<template>
  <span
    class="date-axis-text text-center absolute prevent-select"
    v-for="(entry, i) in dateEntriesShow"
    :key="i"
    :style="`left: ${entry?.x}px`"
    :class="{ 'text-weight-bold': entry?.bold }"
    >{{ entry?.date }}</span
  >
  <span
    v-if="badgeShow"
    class="crosshair-badge text-center absolute prevent-select"
    :style="`left: ${candleWickX}px`"
  >
    {{ candleDate }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { DatePositionEntry } from 'src/pages/broker-charts/broker-charts.if';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';

const props = defineProps<{
  entries: DatePositionEntry[];
  width?: number;
  selectedCandleIndex: number;
  candleWidth: number;
  candleDistance: number;
  candlesShow: number;
  datesCount?: number;
  badgeShow: boolean;
}>();

const emit = defineEmits<{
  (event: 'verticalLine', price: number): void;
}>();

const candleData = computed(() => {
  return props.entries[props.selectedCandleIndex];
});

const overCandles = computed(() => {
  if (!props.datesCount) {
    return undefined;
  }
  return props.candlesShow - props.datesCount;
});

const candleDate = computed(() => {
  if (!candleData.value) {
    return undefined;
  }
  return candleData.value.date;
});

const PADDING_ON_CROSSHAIR_BADGE = 8;

const dateBadgeShiftWithPadding = computed(() => {
  return (DATE_BOX_WIDTH - PADDING_ON_CROSSHAIR_BADGE) / 4;
});

const candleWickX = computed(() => {
  if (!candleData.value) {
    return undefined;
  }
  let width = candleData.value.x + dateBadgeShiftWithPadding.value;
  if (width < 0) {
    width = 0;
  }
  if (overCandles.value) {
    console.log('jo', overCandles.value);
    width -= overCandles.value * props.candleWidth;
  }
  return width;
});

const dateEntriesShow = computed(() => {
  return props.entries.map((entry) => {
    if (entry.show) {
      return entry;
    }
  });
});
</script>

<style lang="scss" scoped>
.date-axis-text {
  width: v-bind("DATE_BOX_WIDTH + 'px'");
}

.crosshair-badge {
  background: var(--q-dark-page);
  opacity: 0.9;
  color: white;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;
}
</style>
