<template>
  <q-btn
    dense
    flat
    square
    size="sm"
    :ripple="false"
    color="primary"
    :label="selectedTimeFrame"
    class="time-frame-dropdown-button q-px-xs"
  >
    <q-menu
      v-model="timeFrameMenuShowing"
      bordered
      @hide="resetCustomTimeFrameInputText"
    >
      <q-list dense v-if="showTimeFrameMenuList">
        <q-item
          :active="selectedTimeFrame === 'M1'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('M1')"
        >
          <q-item-section>M1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M1' ? 'white' : 'primary'"
            >⇧1</InfoBadge
          >
        </q-item>
        <q-item
          :active="selectedTimeFrame === 'M5'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('M5')"
        >
          <q-item-section>M5</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M5' ? 'white' : 'primary'"
            >⇧2</InfoBadge
          >
        </q-item>
        <q-item
          :active="selectedTimeFrame === 'M30'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('M30')"
        >
          <q-item-section>M30</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M30' ? 'white' : 'primary'"
            >⇧3</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'H4'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('H4')"
        >
          <q-item-section>H4</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'H4' ? 'white' : 'primary'"
            >⇧4</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'D1'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('D1')"
        >
          <q-item-section>D1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'D1' ? 'white' : 'primary'"
            >⇧5</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'W1'"
          active-class="selected-item"
          clickable
          @click="onCustomTFInputClick('W1')"
        >
          <q-item-section>W1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'W1' ? 'white' : 'primary'"
            >⇧6</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item class="time-frame-custom-input-item">
          <q-item-section>
            <q-input
              outlined
              dense
              v-model="customTimeFrameInputText"
              mask="A##"
              ref="customTimeFrameInputRef"
              :placeholder="customTimeFramePlaceHolder"
              @focus="focusCustomTimeFrame"
              @blur="resetCustomTimeFrameInputText"
              @keydown.enter="onCustomTFInputClick(customTimeFrameInputText)"
              style="width: 93px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, Ref, ref } from 'vue';
import { useQuasar } from 'quasar';
import InfoBadge from 'src/shared/components/info-badge.vue';
import { allowedTimeFrames, TimeFrame } from './time-frame-dropdown.if';
import { StandardTimeFrames } from 'src/components/chart-window/chart-window.if';

const emit = defineEmits<{
  (event: 'timeFrameChanged', timeFrame: TimeFrame): void;
}>();

const $q = useQuasar();

// TODO: should come from the users saved settings
const selectedTimeFrame = ref<TimeFrame>('M5');

const exampleTextForTimeFrame = 'Custom';

const showTimeFrameMenuList = ref(true);
const timeFrameMenuShowing = ref(false);
const customTimeFrameInputText = ref('');
const customTimeFramePlaceHolder = ref(exampleTextForTimeFrame);

const timeFrameSetByKey = inject(
  'timeFrameSetByKey'
) as Ref<StandardTimeFrames>;

watch(timeFrameSetByKey, () => {
  selectedTimeFrame.value = timeFrameSetByKey.value;
});

function onCustomTFInputClick(input: string) {
  if (!allowedTimeFrames.includes(input)) {
    $q.notify({
      message: `The Input '${input}' is not a valid timeframe.`,
    });
  } else {
    emit('timeFrameChanged', input as TimeFrame);
    selectedTimeFrame.value = input as TimeFrame;
  }
  showTimeFrameMenuList.value = false;
  setTimeout(() => {
    timeFrameMenuShowing.value = false;
    showTimeFrameMenuList.value = true;
  }, 500);
  timeFrameMenuShowing.value = false;

  resetCustomTimeFrameInputText();
}

function focusCustomTimeFrame() {
  customTimeFramePlaceHolder.value = '';
}

function resetCustomTimeFrameInputText() {
  customTimeFramePlaceHolder.value = exampleTextForTimeFrame;
  customTimeFrameInputText.value = '';
}

onMounted(() => {
  emit('timeFrameChanged', selectedTimeFrame.value);
});
</script>

<style lang="scss" scoped>
.time-frame-dropdown-button {
  font-weight: bold;
}

.selected-item {
  background: var(--q-dark);
  color: white;
}

.time-frame-custom-input-item {
  width: 0;
  padding-left: 4px;
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>

<style lang="scss">
.time-frame-custom-input-item {
  .q-field--dense .q-field__control,
  .q-field--dense .q-field__marginal {
    height: 28px !important;
  }
}
</style>
