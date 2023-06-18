import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { useAtomicTimeStore } from 'src/stores/atomic-time';
import { Ref, watch } from 'vue';
import { TimeFrame } from './child-components/header-bar/child-components/time-frame-dropdown.if';

export function useCandleStream(
  data: Ref<OHLC[] | undefined>,
  timeFrame: Ref<TimeFrame>
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
        case 'M2':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 2 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'M3':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 3 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'M4':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 4 === 0
          ) {
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
        case 'M10':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 10 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'M15':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 15 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'M20':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 20 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'M30':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() % 30 === 0
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
        case 'H2':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() % 2 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'H3':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() % 3 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'H4':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() % 4 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'H6':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() % 6 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'H8':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() % 8 === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'D1':
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0
          ) {
            pushNewCandle = true;
          }
          break;
        case 'D2':
          const currentCandleD2 = data.value.slice(-1)[0];
          const currentCandleDateD2 = currentCandleD2.d;
          currentCandleDateD2.setDate(currentCandleDateD2.getDate() + 2);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateD2
          ) {
            pushNewCandle = true;
          }
          break;
        case 'D3':
          const currentCandleD3 = data.value.slice(-1)[0];
          const currentCandleDateD3 = currentCandleD3.d;
          currentCandleDateD3.setDate(currentCandleDateD3.getDate() + 3);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateD3
          ) {
            pushNewCandle = true;
          }
          break;
        case 'D4':
          const currentCandleD4 = data.value.slice(-1)[0];
          const currentCandleDateD4 = currentCandleD4.d;
          currentCandleDateD4.setDate(currentCandleDateD4.getDate() + 4);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateD4
          ) {
            pushNewCandle = true;
          }
          break;
        case 'W1':
          const currentCandleW1 = data.value.slice(-1)[0];
          const currentCandleDateW1 = currentCandleW1.d;
          currentCandleDateW1.setDate(currentCandleDateW1.getDate() + 7);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateW1
          ) {
            pushNewCandle = true;
          }
          break;
        case 'W2':
          const currentCandleW2 = data.value.slice(-1)[0];
          const currentCandleDateW2 = currentCandleW2.d;
          currentCandleDateW2.setDate(currentCandleDateW2.getDate() + 7 * 2);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateW2
          ) {
            pushNewCandle = true;
          }
          break;
        case 'W3':
          const currentCandleW3 = data.value.slice(-1)[0];
          const currentCandleDateW3 = currentCandleW3.d;
          currentCandleDateW3.setDate(currentCandleDateW3.getDate() + 7 * 3);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateW3
          ) {
            pushNewCandle = true;
          }
          break;
        case 'W4':
          const currentCandleW4 = data.value.slice(-1)[0];
          const currentCandleDateW4 = currentCandleW4.d;
          currentCandleDateW4.setDate(currentCandleDateW4.getDate() + 7 * 4);
          if (
            atomicTime.time.getSeconds() % 60 === 0 &&
            atomicTime.time.getMinutes() === 0 &&
            atomicTime.time.getHours() === 0 &&
            atomicTime.time === currentCandleDateW4
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
      }
    }
  );
}
