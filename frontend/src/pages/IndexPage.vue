<template>
  <price-chart :data="priceSeriesData" />
</template>

<script setup lang="ts">
import PriceChart from 'src/components/PriceChart.vue';

const priceSeriesData = [
  {
    t: new Date('2023-01-17'),
    o: 21175.83,
    h: 21438.66,
    l: 20978.53,
    c: 21161.52,
  },
  {
    t: new Date('2022-01-02'),
    o: 12,
    h: 25,
    l: 8,
    c: 18,
  },
];
</script>
