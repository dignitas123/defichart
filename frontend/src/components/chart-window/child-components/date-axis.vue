<template>
  <span
    class="date-axis-text text-center absolute prevent-select"
    v-for="(entry, i) in dateEntriesShow"
    :key="i"
    :style="`left: ${substractDateBoxWidthHalf(entry.x)}px`"
    :class="{ 'text-weight-bold': entry.bold }"
    >{{ entry.date }}</span
  >
  <span
    v-if="badgeShow"
    class="crosshair-badge text-center absolute prevent-select"
    :style="`left: ${badgeXposition}px`"
  >
    {{ candleDate }}
  </span>
</template>

<script lang="ts" setup>
/**
 * Renders the 'date-axis-text' and the 'crosshaird-badge' / dateBadge which is the badge
 * shown over the date-axis when the crosshair is at a certain x position.
 */
import { computed, watch, nextTick } from 'vue';
import { DatePositionEntry } from 'src/pages/broker-charts/broker-charts.if';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';

const props = defineProps<{
  width?: number;
  entries: DatePositionEntry[];
  selectedCandleIndex: number;
  candleWidth: number;
  candleDistance: number;
  candlesShow: number;
  offset: number;
  badgeShow: boolean;
}>();

const emit = defineEmits<{
  (event: 'verticalLines', lines: number[]): void;
}>();

const DATE_BADGE_WIDTH = 50;

const overCandles = computed(() => {
  if (!props.entries.length) {
    return undefined;
  }
  return props.candlesShow - props.entries.length;
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

function substractDateBoxWidthHalf(x: number) {
  return x - DATE_BOX_WIDTH / 2;
}

const badgeXposition = computed(() => {
  if (
    !datePositionEntry.value ||
    !props.width ||
    overCandles.value === undefined
  ) {
    return undefined;
  }
  let badgeMidPoint = DATE_BADGE_WIDTH / 2;
  if (datePositionEntry.value.x < badgeMidPoint) {
    return 0;
  } else if (datePositionEntry.value.x + badgeMidPoint > props.width) {
    return props.width - DATE_BADGE_WIDTH;
  }
  return datePositionEntry.value.x - badgeMidPoint;
});

const dateEntriesShow = computed(() => {
  return props.entries.filter((entry) => entry.show);
});

watch(
  [() => props.width, () => props.candlesShow, () => props.offset],
  async () => {
    await nextTick();
    emit(
      'verticalLines',
      dateEntriesShow.value.map(
        (entry) => substractDateBoxWidthHalf(entry.x) + DATE_BOX_WIDTH / 2
      )
    );
  }
);
</script>

<style lang="scss" scoped>
.date-axis-text {
  width: 80px; // DATE_BOX_WIDTH
}

.crosshair-badge {
  width: 50px; // DATE_BADGE_WIDTH
  background: var(--q-dark-page);
  opacity: 0.9;
  color: white;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;
}
</style>
