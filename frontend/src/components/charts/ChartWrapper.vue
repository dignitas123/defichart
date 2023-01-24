<template>
  <q-layout
    view="lHh lpr lFf"
    container
    :style="`height: ${_height}px; width: ${_width}px`"
    class="chart-wrapper"
  >
    <q-header elevated>
      <q-bar>
        <q-icon name="laptop_chromebook" />
        <div>Chart</div>

        <q-space />

        <q-btn dense flat icon="minimize" />
        <q-btn dense flat icon="crop_square" @click="maximize" />
        <q-btn dense flat icon="close" @click="close" />
      </q-bar>
    </q-header>
    <q-page-container style="height: 100%">
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, withDefaults } from 'vue';

interface ChartWrapperProps {
  height?: number;
  width?: number;
}

const props = withDefaults(defineProps<ChartWrapperProps>(), {
  height: 600,
  width: 700,
});

const $q = useQuasar();

const _height = ref(props.height);
const _width = ref(props.width);

function maximize() {
  _width.value = $q.screen.width - 8;
}

function close() {
  _width.value = 700;
}
</script>

<style lang="scss">
.chart-wrapper {
  .q-layout {
    position: absolute;
    height: 100%;
  }
}
</style>

<style lang="scss" scoped>
.chart-wrapper {
  border: 1px solid var(--q-primary);
}
</style>
