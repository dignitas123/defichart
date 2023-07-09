import { ref, watch } from 'vue';
import { useChartData } from '../chart-data';
import { describe, expect, it, beforeEach } from 'vitest';
import { OHLC } from 'src/pages/broker-charts/broker-charts.if';
import { generateData } from '../../helpers/fake-data-generator';

describe('useChartData', () => {
  const data = ref<OHLC[] | undefined>(generateData('M', 5));
  const candlesShow = ref(60);
  const offset = ref(0);
  const chartHighScale = ref(1);
  const chartLowScale = ref(1);
  const chartUpdateKey = ref(0);

  beforeEach(() => {
    // reset refs
    // data value does not have to be resetted
    candlesShow.value = 60;
    offset.value = 0;
    chartHighScale.value = 1;
    chartLowScale.value = 1;
    chartUpdateKey.value = 0;
  });

  it('decreases and increases candles show by n', () => {
    const { decreaseCandlesShow, increaseCandlesShow } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    const n = 2;
    decreaseCandlesShow(n);
    expect(candlesShow.value).toBe(58);

    increaseCandlesShow(n);
    expect(candlesShow.value).toBe(60);
  });
  it('slices candlesInChartData with less data when chartUpdatKey triggers and offset is different', () => {
    const { candlesInChartData } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    expect(candlesInChartData.value?.length).toBe(60);
    offset.value++;
    chartUpdateKey.value++;
    const watcher = watch(candlesInChartData, () => {
      expect(candlesInChartData.value?.length).toBe(59);
      watcher();
    });
  });
  it('changes startingDistanceDifference when offset or candlesShow is changed correct', () => {
    const { startingDistanceDifference } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    expect(startingDistanceDifference.value).toBe(-240);
    candlesShow.value++;
    // it should show one more candle, and therefore be one less starting dist difference
    expect(startingDistanceDifference.value).toBe(-239);
    offset.value++;
    // it should have an offset of one more and therefore increase the starting dist difference by 1
    expect(startingDistanceDifference.value).toBe(-240);
  });
  it('changes startingDistanceDifference when offset or candlesShow is changed correct', () => {
    const { startingDistanceDifference } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    expect(startingDistanceDifference.value).toBe(-240);
    candlesShow.value++;
    // it should show one more candle, and therefore be one less starting dist difference
    expect(startingDistanceDifference.value).toBe(-239);
    offset.value++;
    // it should have an offset of one more and therefore increase the starting dist difference by 1
    expect(startingDistanceDifference.value).toBe(-240);
  });
});
