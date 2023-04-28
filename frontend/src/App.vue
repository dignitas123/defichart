nnso
<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLanguageStore } from './stores/language';
import { useCoinGecko } from './stores/coin-gecko';
import { useUserSettings } from './stores/user-settings';
import { onMounted } from 'vue';
import { setupGraphQL } from './apollo/client';

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
</script>
