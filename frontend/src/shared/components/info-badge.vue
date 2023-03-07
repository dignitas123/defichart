<template>
  <div class="info-badge-wrapper">
    <q-badge
      :transparent="transparent"
      :outline="outline"
      :color="color"
      class="info-badge"
      ><slot
    /></q-badge>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    outline?: boolean;
    transparent?: boolean;
    color?: string;
  }>(),
  {
    outline: true,
    transparent: true,
    color: 'primary',
  }
);
</script>

<style lang="scss" scoped>
.info-badge-wrapper {
  display: flex;
  align-items: center;
  .info-badge {
    height: 18px;
  }
}
</style>
