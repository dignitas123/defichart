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
    :style="`left: ${badgeXposition}px`"
    ref="crosshairBadgeRef"
  >
    {{ candleDate }}
  </span>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { DatePositionEntry } from 'src/pages/broker-charts/broker-charts.if';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';

const props = defineProps<{
  entries: DatePositionEntry[];
  width?: number;
  datesCount?: number;
  selectedCandleIndex: number;
  candleWidth: number;
  candleDistance: number;
  candlesShow: number;
  badgeShow: boolean;
}>();

const emit = defineEmits<{
  (event: 'verticalLine', price: number): void;
}>();

const crosshairBadgeRef = ref<HTMLElement>();

const overCandles = computed(() => {
  if (!props.datesCount) {
    return undefined;
  }
  return props.candlesShow - props.datesCount;
});

const datePositionEntry = computed(() => {
  if (overCandles.value) {
    return props.entries[props.selectedCandleIndex - overCandles.value];
  }
  return props.entries[props.selectedCandleIndex];
});

const candleDate = computed(() => {
  if (!datePositionEntry.value) {
    return undefined;
  }
  return datePositionEntry.value.date;
});

const PADDING_ON_CROSSHAIR_BADGE = 8;

const dateBadgeShiftWithPadding = computed(() => {
  return (DATE_BOX_WIDTH - PADDING_ON_CROSSHAIR_BADGE) / 4;
});

const badgeXposition = computed(() => {
  if (!datePositionEntry.value || !props.width) {
    return undefined;
  }
  let xPos = datePositionEntry.value.x + dateBadgeShiftWithPadding.value;
  if (badgeXposition.value === undefined) {
    xPos = -999;
  } else if (xPos < 0) {
    xPos = 0;
  } else if (
    crosshairBadgeRef.value &&
    xPos + crosshairBadgeRef.value?.offsetWidth > props.width
  ) {
    xPos = props.width - crosshairBadgeRef.value?.offsetWidth;
  }
  return xPos;
});

const dateEntriesShow = computed(() => {
  return props.entries.filter((entry) => entry.show);
});
</script>

<style lang="scss" scoped>
.date-axis-text {
  width: 80px; // DATE_BOX_WIDTH
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
