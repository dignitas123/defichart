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
  it('has dataDatesCandlesInChart computed and every element in the array is of type date', () => {
    const { dataDatesCandlesInChart } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    function areAllDates(array: Date[]) {
      return array.every((element) => element instanceof Date);
    }
    const result = areAllDates(dataDatesCandlesInChart.value ?? []);

    expect(result).toBe(true);
  });
  it('computes chartHigh and chartLow new when candlesInChartData changes', () => {
    const { candlesInChartData, chartHigh, chartLow } = useChartData(
      data,
      candlesShow,
      offset,
      chartHighScale,
      chartLowScale,
      chartUpdateKey
    );
    const oldCandlesInChartData = candlesInChartData.value;
    const oldChartHigh = chartHigh.value;
    const oldChartLow = chartLow.value;
    // data changes and so should candlesInChartData
    data.value = generateData('M', 5); // generate new data
    const watcher = watch(candlesInChartData, () => {
      expect(candlesInChartData.value).not.toEqual(oldCandlesInChartData);
      expect(chartHigh.value).not.toEqual(oldChartHigh);
      expect(chartLow.value).not.toEqual(oldChartLow);
      watcher();
    });
  });
});
