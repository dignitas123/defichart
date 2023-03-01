<template>
  <div class="header-bar">
    <q-bar dark dense>
      <div class="q-mr-xs">BTCUSD</div>
      <q-btn
        dense
        flat
        class="items-center"
        icon="zoom_in"
        size="sm"
        :ripple="false"
        @click="$emit('zoomIn')"
      >
        <q-tooltip :delay="1000" transitionDuration="0" transitionShow="fade">
          {{ 'Zoom in' }}
          <q-badge transparent> Z </q-badge>
        </q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        class="items-center"
        icon="zoom_out"
        size="sm"
        :ripple="false"
        @click="$emit('zoomOut')"
      >
        <q-tooltip :delay="1000" transitionDuration="0" transitionShow="fade">
          {{ 'Zoom out' }}
          <q-badge transparent> X </q-badge>
        </q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
        dense
        flat
        icon="crop_square"
        :ripple="false"
        @click="$emit('maximize')"
      />
      <q-btn dense flat icon="close" :ripple="false" @click="$emit('close')" />
    </q-bar>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  (event: 'maximize'): void;
  (event: 'close'): void;
  (event: 'zoomIn'): void;
  (event: 'zoomOut'): void;
}>();
</script>

<style lang="scss" scoped>
.header-bar {
  border-bottom: 1px solid var(--q-primary);
}
</style>
