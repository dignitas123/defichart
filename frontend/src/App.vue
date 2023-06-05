nnso
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useLanguageStore } from './stores/language';
import { useCoinGecko } from './stores/coin-gecko';
import { useUserSettings } from './stores/user-settings';
import { setupGraphQL } from './apollo/client';
import { useAtomicTimeStore } from './stores/atomic-time';

setupGraphQL();

const { setLanguage } = useLanguageStore();

const { setPricesVsCurrency } = useCoinGecko();

const { startAtomicClock } = useAtomicTimeStore();

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
  startAtomicClock();
  setInterval(async () => {
    await setPricesVsCurrency(
      tokensPricesToLoad,
      userSettings.getAccountCurrency
    );
  }, 1_000 * 15 * 60);
});

const languageCode = navigator.language.split('-')[0];

setLanguage(languageCode);
</script>
