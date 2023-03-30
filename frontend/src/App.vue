nnso
<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLanguageStore } from './stores/language';
import { useCoinGecko } from './stores/coin-gecko';
import { onMounted } from 'vue';

const { setLanguage } = useLanguageStore();

const { setPricesVsUsd } = useCoinGecko();

onMounted(async () => {
  await setPricesVsUsd();
  setInterval(async () => {
    await setPricesVsUsd();
  }, 1_000 * 15 * 60);
});

const languageCode = navigator.language.split('-')[0];

setLanguage(languageCode);
</script>
