<template>
  <price-chart :data="priceSeriesData" />
</template>

<script setup lang="ts">
import { PriceSeries } from 'src/components/price-chart.model';
import PriceChart from 'src/components/PriceChart.vue';

const priceSeriesData: PriceSeries[] = generateData();

function generateData() {
  const data = [];
  let o = 100;
  for (let i = 0; i < 30; i++) {
    const d = new Date(`${i + 1}-01-2021`);
    const h = o + Math.random() * 5;
    const l = o - Math.random() * 5;
    const c = o + Math.random() * 5 - Math.random() * 5;
    const v = Math.random();
    data.push({ d, o, h, l, c, v });
    o = c;
  }
  return data;
}
</script>
