<template>
  <price-chart :data="priceSeriesData" />
</template>

<script setup lang="ts">
import { PriceSeries } from 'src/components/price-chart.model';
import PriceChart from 'src/components/price-chart/PriceChart.vue';

const priceSeriesData: PriceSeries[] = generateData();

function generateData() {
  const data = [];
  let o = 100;
  let currentDate = new Date();
  for (let i = 0; i < 60; i++) {
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    const d = new Date(currentDate);
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
