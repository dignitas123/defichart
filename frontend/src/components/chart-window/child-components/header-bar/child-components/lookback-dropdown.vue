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
        <q-item-section>1 day</q-item-section>
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1week'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1week')"
      >
        <q-item-section>1 week</q-item-section>
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1month'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1month')"
      >
        <q-item-section>1 month</q-item-section>
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1quarter'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1quarter')"
      >
        <q-item-section>1 quarter</q-item-section>
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '1year'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('1year')"
      >
        <q-item-section>1 year</q-item-section>
      </q-item>
      <q-separator />
      <q-item
        :active="selectedLookback === '5year'"
        active-class="selected-item"
        clickable
        @click="onLookbackClick('5year')"
      >
        <q-item-section>5 years</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { inject, watch, Ref, ref, computed } from 'vue';
import {
  LookbackPeriod,
  LookbackPeriodString,
  lookbackPeriodStringEnum,
} from './lookback-dropdown.if';
import { INITIAL_LOOKBACK_PERIOD } from 'src/pages/broker-charts/consts';

const emit = defineEmits<{
  (event: 'lookBackPeriodChanged', lookBack: LookbackPeriodString): void;
}>();

// TODO: should come from the users saved settings
const selectedLookback = ref<LookbackPeriodString>(INITIAL_LOOKBACK_PERIOD);

const lookbackVariableNumber = ref(1);

const selectedVariableLookback = computed(() => {
  const lookbackNameString =
    lookbackVariableNumber.value === 1
      ? lookbackPeriodStringEnum[selectedLookback.value].singular
      : lookbackPeriodStringEnum[selectedLookback.value].plural;
  return lookbackVariableNumber.value + ' ' + lookbackNameString;
});

const showLookbackMenuList = ref(true);
const lookbackMenuShowing = ref(false);

const lookbackNumber = inject('lookbackNumber') as Ref<number>;
const lookbackPeriodString = inject(
  'lookbackPeriodString'
) as Ref<LookbackPeriodString>;

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
