<template>
  <span
    class="date-axis-text text-center absolute prevent-select"
    v-for="(entry, i) in dateEntriesShow"
    :key="i"
    :style="`left: ${substractDateBoxWidthHalf(entry.x)}px`"
    :class="{ 'text-weight-bold': entry.bold }"
    >{{ dateFormat(entry.date, entry.dateFormat) }}</span
  >
  <span
    v-if="badgeShow"
    class="crosshair-badge text-center absolute prevent-select"
    :style="`left: ${badgeXposition}px`"
  >
    {{ candleDate }}
    <q-resize-observer :debounce="0" @resize="onDateBadgeResize" />
  </span>
</template>

<script lang="ts" setup>
/**
 * Renders the 'date-axis-text' and the 'crosshaird-badge' / dateBadge which is the badge
 * shown over the date-axis when the crosshair is at a certain x position.
 */
import { computed, watch, nextTick, ref } from 'vue';
import { DatePosition } from 'src/pages/broker-charts/broker-charts.if';
import { DATE_BOX_WIDTH } from 'src/pages/broker-charts/consts';
import { useLanguageStore } from 'src/stores/language';
import { format as dateFormat } from 'date-fns';

const props = defineProps<{
  width?: number;
  datePosition?: DatePosition;
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

const dateBadgeWidth = ref(0);

function onDateBadgeResize(size: { width: number }) {
  dateBadgeWidth.value = size.width;
}

const languageStore = useLanguageStore();

function formatDate(date: Date, format: string) {
  return dateFormat(date, format, { locale: languageStore.language });
}

const overCandles = computed(() => {
  if (!props.datePosition?.entries.length) {
    return undefined;
  }
  return props.candlesShow - props.datePosition.entries.length;
});

const datePositionEntry = computed(() => {
  if (overCandles.value && props.datePosition) {
    return props.datePosition.entries[
      props.selectedCandleIndex - overCandles.value
    ];
  }
  return props.datePosition?.entries[props.selectedCandleIndex];
});

const candleDate = computed(() => {
  if (!datePositionEntry.value || !props.datePosition) {
    return undefined;
  }
  return formatDate(
    datePositionEntry.value.date,
    props.datePosition.standardDateFormat
  );
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
  let badgeMidPoint = dateBadgeWidth.value / 2;
  if (datePositionEntry.value.x < badgeMidPoint) {
    return 0;
  } else if (datePositionEntry.value.x + badgeMidPoint > props.width) {
    return props.width - dateBadgeWidth.value;
  }
  return datePositionEntry.value.x - badgeMidPoint;
});

const dateEntriesShow = computed(() => {
  return props.datePosition?.entries.filter((entry) => entry.dateFormat);
});

watch(
  [
    () => props.width,
    () => props.candlesShow,
    () => props.offset,
    () => props.datePosition,
  ],
  async () => {
    if (!dateEntriesShow.value) {
      return;
    }
    await nextTick();
    emit(
      'verticalLines',
      dateEntriesShow.value.map(
        (entry) => substractDateBoxWidthHalf(entry.x) + DATE_BOX_WIDTH / 2
      )
    );
  },
  { deep: true }
);
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
  width: max-content;
}
</style>
