<template>
  <div
    class="chart-wrapper"
    :style="`height: ${
      _fullScreen
        ? $q.screen.height - HEADER_HEIGHT - INDEX_PAGE_PADDING + 'px'
        : _height + 'px'
    }; width: ${_fullScreen ? '100%' : _width + 'px'}`"
  >
    <!-- TODO: loading spinner when loading chart data -->
    <div v-if="false" class="spinner-bar-wrapper">
      <q-spinner-ios color="primary" size="xl" />
    </div>
    <div class="container">
      <div class="header-bar">
        <HeaderBar @maximize="maximize" @close="close" />
      </div>
      <div class="price-row">
        <div class="chart" ref="chartRef">
          <CandlestickChart
            :data="priceSeriesData"
            :height="chartHeight"
            :width="chartWidth"
            :priceLines="priceLines"
          />
        </div>
        <div>
          <PriceAxis
            :data="priceSeriesData"
            :height="chartHeight"
            @horizontalLine="addHorizontalLineToPriceLines"
          />
        </div>
      </div>
      <div class="date-row">
        <div class="timestamps">
          <DateAxis :data="priceSeriesData" :width="chartWidth" />
        </div>
        <div class="config-corner">
          <ConfigBottomRight />
        </div>
      </div>
    </div>
    <q-resize-observer :debounce="0" :onResize="onResize" />
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, withDefaults, nextTick, watch } from 'vue';
import CandlestickChart from './components/candlestick-chart.vue';
import HeaderBar from './components/header-bar.vue';
import { PriceSeries } from 'src/components/price-chart/price-chart.model';
import PriceAxis from './components/price-axis.vue';
import ConfigBottomRight from './components/config-bottom-right.vue';
import DateAxis from './components/date-axis.vue';

const priceSeriesData: PriceSeries[] = generateData();

interface ChartWrapperProps {
  height?: number;
  width?: number;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<ChartWrapperProps>(), {
  height: 600,
  width: 700,
  fullScreen: true,
});

const HEADER_HEIGHT = 32;
const INDEX_PAGE_PADDING = 2 * 4;

const chartRef = ref<HTMLCanvasElement | null>(null);

const _height = ref(props.height);
const _width = ref(props.width);

const $q = useQuasar();

const _fullScreen = ref(true);

const chartHeight = ref<undefined | number>(undefined);
const chartWidth = ref<undefined | number>(undefined);

function updateChartHeightAndWidth() {
  chartHeight.value = chartRef.value?.clientHeight;
  chartWidth.value = chartRef.value?.clientWidth;
}

function generateData() {
  const data = [];
  let o = 100;
  let currentDate = new Date();
  for (let i = 0; i < 400; i++) {
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    const d = new Date(currentDate);
    const h = o + Math.random() * 5;
    let l = o - Math.random() * 5;
    let c = o + Math.random() * 5 - Math.random() * 5;
    const v = Math.random();
    if (l > c) {
      l = c;
    }
    if (c > h) {
      c = h;
    }
    data.push({ d, o, h, l, c, v });
    o = c;
  }
  return data;
}

async function onResize() {
  updateChartHeightAndWidth();
  await nextTick();
  priceLines.value = [];
}

function maximize() {
  _fullScreen.value = true;
}

function close() {
  _width.value = 700;
  _fullScreen.value = false;
}

const priceLines = ref<number[]>([]);

// @horizontalLine emit
function addHorizontalLineToPriceLines(price: number) {
  priceLines.value.push(price);
}
</script>

<style lang="scss">
.chart-wrapper {
  .q-layout {
    position: absolute;
    height: 100%;
  }
}
</style>

<style lang="scss" scoped>
.chart-wrapper {
  border: 1px solid var(--q-primary);
  border-radius: 3px;

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .header-bar {
      display: flex;
      height: 22px;
      flex-direction: column;
    }

    .price-row {
      flex: 1;
      display: flex;
      height: 0;

      .chart {
        flex: 1;
        height: 100%;
        width: calc(100% - 80px);
      }
    }

    .date-row {
      height: 22px;
      display: flex;

      .timestamps {
        flex: 1;
      }

      .config-corner {
        width: 80px;
      }
    }
  }
}
</style>
