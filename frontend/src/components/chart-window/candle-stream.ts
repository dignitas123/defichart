import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { useAtomicTimeStore } from 'src/stores/atomic-time';
import { Ref, watch } from 'vue';
import { TimeFrame } from './child-components/header-bar/child-components/time-frame-dropdown.if';

export function useCandleStream(
  data: Ref<OHLC[] | undefined>,
  timeFrame: Ref<TimeFrame>,
  chartUpdateKey: Ref<number>
) {
  const atomicTime = useAtomicTimeStore();

  watch(
    () => atomicTime.formattedTime,
    () => {
      if (!data.value) {
        return;
      }
      let pushNewCandle = false;
      switch (timeFrame.value) {
        case 'M1':
          if (atomicTime.time.getSeconds() % 60 === 0) {
            pushNewCandle = true;
          }
          break;
        case 'M5':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 5 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'H1':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0
          ) {
            pushNewCandle = true;
          }
        case 'D1':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'W1':
          const currentCandleW1 = { ...data.value.slice(-1)[0] };
          const currentCandleDateW1 = new Date(currentCandleW1.d);
          currentCandleDateW1.setDate(currentCandleDateW1.getDate() + 7);
          currentCandleW1.d = currentCandleDateW1;
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateW1
          ) {
            pushNewCandle = true;
          }
          break;
      }
      if (pushNewCandle) {
        const currentCandle = data.value[data.value.length - 1];
        data.value?.push({
          o: currentCandle.c,
          h: currentCandle.c,
          l: currentCandle.c,
          c: currentCandle.c,
          v: 0,
          d: new Date(),
        });
        chartUpdateKey.value++;
      }
    }
  );
}
