<template>
  <div class="header-bar">
    <q-bar dark dense>
      <q-icon name="img:icons/coins/btc.svg" />
      <div class="q-mx-xs" style="margin-left: 4px">{{ symbolName }}</div>
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
            >Zoom in<InfoBadge class="q-ml-xs" color="white"
              >c</InfoBadge
            ></InfoTooltip
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
        @click="$emit('close')"
      />
      <q-btn
        dense
        flat
        square
        class="header-button"
        icon="crop_free"
        :ripple="false"
        @click="$emit('maximize')"
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
import { LookbackPeriodString } from './child-components/lookback-dropdown.if';

defineProps<{
  timeFrame: TimeFrame;
  symbolName: string;
}>();

const emit = defineEmits<{
  (event: 'maximize'): void;
  (event: 'close'): void;
  (event: 'zoomIn'): void;
  (event: 'zoomOut'): void;
  (event: 'setTimeFrame', timeFrame: TimeFrame): void;
  (event: 'setLookbackPeriod', lookbackPeriod: LookbackPeriodString): void;
}>();

// @emit timeFrameChanged
function onTimeFrameChange(tf: TimeFrame) {
  emit('setTimeFrame', tf);
}

// @emit lookBackPeriodChanged
function onLoockbackPeriodChange(lookbackPeriod: LookbackPeriodString) {
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
