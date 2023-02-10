import { useQuasar } from 'quasar';
import { computed } from 'vue';
import { HEADER_HEIGHT, PAGE_PADDING } from './consts';

export function useBrokerChartSizes() {
  const $q = useQuasar();

  const maxChartHeight = computed(() => {
    return $q.screen.height - HEADER_HEIGHT - PAGE_PADDING * 2;
  });

  const maxChartWidth = computed(() => {
    return $q.screen.width - PAGE_PADDING * 2;
  });

  return {
    maxChartHeight,
    maxChartWidth,
  };
}
