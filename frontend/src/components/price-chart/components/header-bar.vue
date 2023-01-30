<template>
  <div class="header-bar">
    <q-bar dark dense>
      <div>BTCUSD</div>
      <q-space />
      <q-btn dense flat icon="crop_square" :ripple="false" @click="$emit('maximize')" />
      <q-btn dense flat icon="close" :ripple="false" @click="$emit('close')" />
    </q-bar>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  (event: 'maximize'): void;
  (event: 'close'): void;
}>();
</script>

<style lang="scss" scoped>
.header-bar {
  border-bottom: 1px solid var(--q-primary);
}
</style>
