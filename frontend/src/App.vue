<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLanguageStore } from './stores/language';

const { setLanguage } = useLanguageStore();

const languageCode = navigator.language.split('-')[0];

setLanguage(languageCode);
</script>
