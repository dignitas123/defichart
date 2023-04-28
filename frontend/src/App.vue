nnso
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useLanguageStore } from './stores/language';
import { useCoinGecko } from './stores/coin-gecko';
import { useUserSettings } from './stores/user-settings';
import { setupGraphQL } from './apollo/client';
import { useQuery } from '@vue/apollo-composable';
import { getTimeFrameQuery } from './apollo/timeFrame.query';

setupGraphQL();

const { setLanguage } = useLanguageStore();

const { setPricesVsCurrency } = useCoinGecko();

const { setDisplaySettingsFromLocalStorage } = useUserSettings();

const userSettings = useUserSettings();

// TODO: load all account balance tokens that are relevant for the perpetual broker
const tokensPricesToLoad = ['ethereum'];

onMounted(async () => {
  setDisplaySettingsFromLocalStorage();
  await setPricesVsCurrency(
    tokensPricesToLoad,
    userSettings.getAccountCurrency
  );
  setInterval(async () => {
    await setPricesVsCurrency(
      tokensPricesToLoad,
      userSettings.getAccountCurrency
    );
  }, 1_000 * 15 * 60);
});

const languageCode = navigator.language.split('-')[0];

setLanguage(languageCode);

const { result: ohlcv } = useQuery(getTimeFrameQuery, {
  symbol: 'btcusd-perp',
  timeFrame: 'W1',
  binAmount: 1,
});

watch(ohlcv, () => {
  console.log('ohlcv', ohlcv.value);
});
</script>
