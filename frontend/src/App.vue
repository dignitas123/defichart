nnso
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLanguageStore } from './stores/language';
import { useCoinGecko } from './stores/coin-gecko';
import { useUserSettings } from './stores/user-settings';
import { setupGraphQL } from './apollo/client';
import { useAtomicTimeStore } from './stores/atomic-time';

setupGraphQL();

const { setLanguage } = useLanguageStore();

const { setPricesVsCurrency } = useCoinGecko();

const { startAtomicClock } = useAtomicTimeStore();

const atomicTime = useAtomicTimeStore();

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

// Check for browser compatibility
if (typeof document.hidden !== 'undefined') {
  // Add the event listener for visibility change
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

const lastTimestampBeforeTabSwitch = ref(new Date());

// Function to handle visibility change
function handleVisibilityChange() {
  if (document.hidden) {
    // User has switched to a different tab or minimized the window
    lastTimestampBeforeTabSwitch.value = new Date(atomicTime.time);
  } else {
    // User has come back to the tab
    startAtomicClock();
    atomicTime.switchTabTimeDifference =
      atomicTime.time.getTime() - lastTimestampBeforeTabSwitch.value.getTime();
  }
}
</script>
