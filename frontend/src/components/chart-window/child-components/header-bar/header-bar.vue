<template>
  <div class="header-bar">
    <q-bar dark dense>
      <!-- TODO: BTCUSD should be coming from the broker chart chart-settings -->
      <div class="q-mr-xs">BTCUSD</div>
      <TimeFrameDropdown
        :timeFrame="timeFrame"
        @timeFrameChanged="onTimeFrameChange"
      />
      <LookbackDropdown @lookBackPeriodChanged="onLoockbackPeriodChange" />
      <q-space />
      <q-btn
        dense
        flat
        square
        class="header-button items-center"
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
      <span class="q-mr-xs">
        <q-btn
          dense
          flat
          square
          class="header-button items-center"
          icon="zoom_in"
          size="sm"
          :ripple="false"
          @click="$emit('zoomIn')"
        >
          <InfoTooltip
            >Zoom in<InfoBadge color="white">c</InfoBadge></InfoTooltip
          >
        </q-btn>
      </span>
      <q-btn
        dense
        flat
        square
        class="header-button"
        icon="crop_square"
        :ripple="false"
        @click="$emit('maximize')"
      />
      <q-btn
        dense
        flat
        square
        class="header-button"
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
import LookbackDropdown from './child-components/lookback-dropdown.vue';
import { LookbackPeriod } from './child-components/lookback-dropdown.if';

defineProps<{
  timeFrame: TimeFrame;
}>();

const emit = defineEmits<{
  (event: 'maximize'): void;
  (event: 'close'): void;
  (event: 'zoomIn'): void;
  (event: 'zoomOut'): void;
  (event: 'setTimeFrame', timeFrame: TimeFrame): void;
  (event: 'setLookbackPeriod', lookbackPeriod: LookbackPeriod): void;
}>();

// @emit timeFrameChanged
function onTimeFrameChange(tf: TimeFrame) {
  emit('setTimeFrame', tf);
}

// @emit lookBackPeriodChanged
function onLoockbackPeriodChange(lookbackPeriod: LookbackPeriod) {
  emit('setLookbackPeriod', lookbackPeriod);
}
</script>

<style lang="scss" scoped>
.header-bar {
  border-bottom: 1px solid var(--q-primary);
}
</style>

<style>
.header-button {
  padding-bottom: 1px;
  margin-bottom: 1px;
}
</style>
