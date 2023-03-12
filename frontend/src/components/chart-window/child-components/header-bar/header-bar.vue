<template>
  <div class="header-bar">
    <q-bar dark dense>
      <div class="q-mr-xs">BTCUSD</div>
      <q-btn
        dense
        flat
        square
        class="items-center"
        icon="zoom_out"
        size="sm"
        :ripple="false"
        @click="$emit('zoomOut')"
      >
        <InfoTooltip
          >Zoom out<InfoBadge class="q-ml-xs" color="white"
            >x</InfoBadge
          ></InfoTooltip
        >
      </q-btn>
      <q-btn
        dense
        flat
        square
        class="items-center"
        icon="zoom_in"
        size="sm"
        :ripple="false"
        @click="$emit('zoomIn')"
      >
        <InfoTooltip
          >Zoom in<InfoBadge class="q-ml-xs" color="white"
            >c</InfoBadge
          ></InfoTooltip
        >
      </q-btn>
      <TimeFrameDropdown @timeFrameChanged="onTimeFrameChange" />
      <q-space />
      <q-btn
        dense
        flat
        square
        icon="crop_square"
        :ripple="false"
        @click="$emit('maximize')"
      />
      <q-btn
        dense
        flat
        square
        icon="close"
        :ripple="false"
        @click="$emit('close')"
      />
    </q-bar>
  </div>
</template>

<script lang="ts" setup>
import TimeFrameDropdown from './child-components/time-frame-dropdown.vue';
import InfoTooltip from 'src/shared/components/info-tooltip.vue';
import InfoBadge from 'src/shared/components/info-badge.vue';
import { TimeFrame } from './child-components/time-frame-dropdown.if';

const emit = defineEmits<{
  (event: 'maximize'): void;
  (event: 'close'): void;
  (event: 'zoomIn'): void;
  (event: 'zoomOut'): void;
  (event: 'setTimeFrame', timeFrame: TimeFrame): void;
}>();

function onTimeFrameChange(tf: TimeFrame) {
  emit('setTimeFrame', tf);
}
</script>

<style lang="scss" scoped>
.header-bar {
  border-bottom: 1px solid var(--q-primary);
}
</style>
