<template>
  <q-btn
    no-caps
    dense
    flat
    square
    size="sm"
    :ripple="false"
    color="primary"
    :label="selectedLookback"
    class="lookback-dropdown-button q-px-xs"
  >
    <q-menu v-model="lookbackMenuShowing" bordered>
      <q-list dense v-if="showLookbackMenuList">
        <q-item
          :active="selectedLookback === '1day'"
          active-class="selected-item"
          clickable
          @click="onLookbackClick('1day')"
        >
          <q-item-section>1day</q-item-section>
          <InfoBadge
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
            class="q-ml-xs"
            :color="selectedLookback === '5year' ? 'white' : 'primary'"
            >6</InfoBadge
          >
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, Ref, ref } from 'vue';
import InfoBadge from 'src/shared/components/info-badge.vue';
import { LookbackPeriod } from './lookback-dropdown.if';

const emit = defineEmits<{
  (event: 'lookBackPeriodChanged', lookBack: LookbackPeriod): void;
}>();

// TODO: should come from the users saved settings
const selectedLookback = ref<LookbackPeriod>('1week');

const showLookbackMenuList = ref(true);
const lookbackMenuShowing = ref(false);

const lookbackSetByKey = inject('lookbackSetByKey') as Ref<LookbackPeriod>;

watch(lookbackSetByKey, () => {
  selectedLookback.value = lookbackSetByKey.value;
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

onMounted(() => {
  emit('lookBackPeriodChanged', selectedLookback.value);
});
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
