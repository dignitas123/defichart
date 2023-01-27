<template>
  <q-layout
    view="lHh lpr lFf"
    container
    :style="`height: ${
      _fullScreen
        ? $q.screen.height - HEADER_HEIGHT - INDEX_PAGE_PADDING + 'px'
        : _height + 'px'
    }; width: ${_fullScreen ? '100%' : _width + 'px'}`"
    class="chart-wrapper"
  >
    <q-header elevated>
      <q-bar>
        <div>BTCUSD</div>

        <q-space />

        <q-btn dense flat :ripple="false" icon="minimize" />
        <q-btn
          dense
          flat
          :ripple="false"
          icon="crop_square"
          @click="maximize"
        />
        <q-btn dense flat :ripple="false" icon="close" @click="close" />
      </q-bar>
    </q-header>
    <q-page-container style="height: 100%">
      <slot :key="updateKey" />
    </q-page-container>
    <q-resize-observer :onResize="onResize" />
  </q-layout>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, ref, withDefaults } from 'vue';

interface ChartWrapperProps {
  height?: number;
  width?: number;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<ChartWrapperProps>(), {
  height: 600,
  width: 700,
  fullScreen: true,
});

const HEADER_HEIGHT = 32;
const INDEX_PAGE_PADDING = 8;

const _height = ref(props.height);
const _width = ref(props.width);

const $q = useQuasar();

const _fullScreen = ref(false);

onMounted(() => {
  _fullScreen.value = props.fullScreen;
});

const updateKey = ref(0);

function onResize() {
  updateKey.value++;
}

function maximize() {
  _fullScreen.value = true;
  updateKey.value++;
}

function close() {
  _width.value = 700;
  _fullScreen.value = false;
  updateKey.value++;
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
