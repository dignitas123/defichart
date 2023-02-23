<template>
  <div class="header-bar">
    <q-bar dark dense>
      <div class="q-mr-xs">BTCUSD</div>
      <q-btn
        dense
        flat
        class="items-center"
        :icon="zoomedOut ? 'zoom_in' : 'zoom_out'"
        size="sm"
        :ripple="false"
        @click="zoomedOut ? $emit('zoomIn') : $emit('zoomOut')"
      >
        <q-tooltip :delay="1000" transitionDuration="0" transitionShow="fade">
          {{ zoomedOut ? 'Zoom in' : 'Zoom out' }}
          <q-badge transparent> Z </q-badge>
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
withDefaults(
  defineProps<{
    zoomedOut?: boolean;
  }>(),
  {
    zoomedOut: false,
  }
);

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
