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
    ref="crosshairBadgeRef"
  >
    {{ candleDate }}
  </span>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue';
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
  candlesticksSVGWidth: number;
}>();

const emit = defineEmits<{
  (event: 'verticalLines', lines: number[]): void;
}>();

const PADDING_ON_CROSSHAIR_BADGE = 4;

const crosshairBadgeRef = ref<HTMLElement>();

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
  let crossHairBadgeWidth = crosshairBadgeRef.value?.offsetWidth;
  if (!crossHairBadgeWidth) {
    crossHairBadgeWidth = 0;
  }
  let xPos =
    overCandles.value > 0
      ? datePositionEntry.value.x
      : props.width - (props.width - datePositionEntry.value.x);
  if (badgeXposition.value === undefined) {
    return xPos - DATE_BOX_WIDTH / 4 - PADDING_ON_CROSSHAIR_BADGE;
  } else if (xPos < crossHairBadgeWidth / 2) {
    return 0;
  } else if (xPos + crossHairBadgeWidth / 2 > props.width) {
    return props.width - crossHairBadgeWidth;
  }
  return xPos - crossHairBadgeWidth / 2;
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
  background: var(--q-dark-page);
  opacity: 0.9;
  color: white;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;
}
</style>
