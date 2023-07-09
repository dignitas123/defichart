import { ref, watch } from 'vue';
import { useCandleStream } from '../candle-stream';
import { describe, expect, it, beforeEach } from 'vitest';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { TimeFrame } from '../../child-components/header-bar/child-components/time-frame-dropdown.if';
import { setActivePinia, createPinia } from 'pinia';
import { useAtomicTimeStore } from 'src/stores/atomic-time';

describe('useCandleStream', () => {
  const data = ref<OHLC[] | undefined>([
    {
      o: 1500,
      h: 1505,
      l: 1495,
      c: 1501,
      v: 101,
      d: new Date(),
    },
  ]);
  const timeFrame = ref<TimeFrame>('M1');
  const chartUpdateKey = ref(0);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('pushes a new candle when the conditions are met', () => {
    const atomicTime = useAtomicTimeStore();

    // Set up atomicTimeStore to match the condition for 'M1' time frame
    atomicTime.time.setSeconds(0);

    // Call the useCandleStream function
    useCandleStream(data, timeFrame, chartUpdateKey);

    // data value is not incremented before watch trigger
    expect(data.value?.length).toBe(1);

    // formatted time triggers watch
    atomicTime.formattedTime = new Date()
      .toISOString()
      .split('T')[1]
      .slice(0, 8);

    watch(chartUpdateKey, () => {
      // Check that chartUpdateKey is incremented
      expect(chartUpdateKey.value).toBe(1);
    });
  });
});
