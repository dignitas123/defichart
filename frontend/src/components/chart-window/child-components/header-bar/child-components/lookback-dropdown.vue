<template>
  <q-btn-dropdown
    v-model="lookbackMenuShowing"
    bordered
    menuAnchor="bottom left"
    menuSelf="top left"
    no-caps
    dense
    flat
    square
    size="sm"
    :ripple="false"
    color="primary"
    :label="selectedVariableLookback"
    class="lookback-dropdown-button header-button q-px-xs"
    :class="{ blink: isBlinking && !blinkingBlock }"
  >
    <q-list dense v-if="showLookbackMenuList">
      <q-item
        :active="selectedLookback === '1day'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1day')"
      >
        <q-item-section>1day</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '1day' ? 'white' : 'primary'"
          >1</InfoBadge
        >
      </q-item>
      <q-item
        :active="selectedLookback === '1week'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1week')"
      >
        <q-item-section>1week</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '1week' ? 'white' : 'primary'"
          >2</InfoBadge
        >
      </q-item>
      <q-item
        :active="selectedLookback === '1month'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1month')"
      >
        <q-item-section>1month</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '1month' ? 'white' : 'primary'"
          >3</InfoBadge
        >
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1quarter'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1quarter')"
      >
        <q-item-section>1quarter</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '1quarter' ? 'white' : 'primary'"
          >4</InfoBadge
        >
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1year'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1year')"
      >
        <q-item-section>1year</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '1year' ? 'white' : 'primary'"
          >5</InfoBadge
        >
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '5year'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('5year')"
      >
        <q-item-section>5year</q-item-section>
        <InfoBadge
          v-if="!$q.platform.is.mobile"
          class="q-ml-xs"
          :color="selectedLookback === '5year' ? 'white' : 'primary'"
          >6</InfoBadge
        >
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { inject, watch, Ref, ref, computed } from 'vue';
import InfoBadge from 'src/shared/components/info-badge.vue';
import {
  LookbackPeriod,
  LookbackPeriodString,
  lookbackPeriodStringEnum,
} from './lookback-dropdown.if';
import { INITIAL_LOOKBACK_PERIOD } from 'src/pages/broker-charts/consts';
import { useQuasar } from 'quasar';

const emit = defineEmits<{
  (event: 'lookBackPeriodChanged', lookBack: LookbackPeriodString): void;
}>();

const $q = useQuasar();

// TODO: should come from the users saved settings
const selectedLookback = ref<LookbackPeriodString>(INITIAL_LOOKBACK_PERIOD);

const lookbackVariableNumber = ref(1);

const selectedVariableLookback = computed(() => {
  const lookbackNameString =
    lookbackVariableNumber.value === 1
      ? lookbackPeriodStringEnum[selectedLookback.value].singular
      : lookbackPeriodStringEnum[selectedLookback.value].plural;
  return lookbackVariableNumber.value + lookbackNameString;
});

const showLookbackMenuList = ref(true);
const lookbackMenuShowing = ref(false);

const lookbackSetByUser = inject('lookbackSetByUser') as Ref<LookbackPeriod>;
const lookbackNumber = inject('lookbackNumber') as Ref<number>;
const lookbackPeriodString = inject(
  'lookbackPeriodString'
) as Ref<LookbackPeriodString>;

watch(lookbackSetByUser, () => {
  selectedLookback.value = lookbackSetByUser.value;
});
watch(lookbackNumber, () => {
  lookbackVariableNumber.value = lookbackNumber.value;
});
watch(lookbackPeriodString, () => {
  lookbackBlink();
  if (lookbackNumber.value === 5) {
    selectedLookback.value = '5year';
  } else {
    selectedLookback.value = lookbackPeriodString.value;
  }
});

function onLookbackClick(period: LookbackPeriod) {
  emit('lookBackPeriodChanged', period);
  selectedLookback.value = period;
  showLookbackMenuList.value = false;
  setTimeout(() => {
    lookbackMenuShowing.value = false;
    showLookbackMenuList.value = true;
  }, 500);
  lookbackMenuShowing.value = false;
}

const isBlinking = ref(false);
const blinkingBlock = ref(false);

function lookbackBlink() {
  isBlinking.value = true;
  setTimeout(() => {
    isBlinking.value = false;
  }, 400);
}
</script>

<style lang="scss" scoped>
.lookback-dropdown-button {
  font-weight: bold;
}

.selected-item {
  background: var(--q-dark);
  color: white;
}
</style>
