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
          @click="onItemClick('M1')"
        >
          <q-item-section>M1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M1' ? 'white' : 'primary'"
            >1</InfoBadge
          >
        </q-item>
        <q-item
          :active="selectedTimeFrame === 'M5'"
          active-class="selected-item"
          clickable
          @click="onItemClick('M5')"
        >
          <q-item-section>M5</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M5' ? 'white' : 'primary'"
            >2</InfoBadge
          >
        </q-item>
        <q-item
          :active="selectedTimeFrame === 'M30'"
          active-class="selected-item"
          clickable
          @click="onItemClick('M30')"
        >
          <q-item-section>M30</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'M30' ? 'white' : 'primary'"
            >3</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'H4'"
          active-class="selected-item"
          clickable
          @click="onItemClick('H4')"
        >
          <q-item-section>H4</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'H4' ? 'white' : 'primary'"
            >4</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'D1'"
          active-class="selected-item"
          clickable
          @click="onItemClick('D1')"
        >
          <q-item-section>D1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'D1' ? 'white' : 'primary'"
            >5</InfoBadge
          >
        </q-item>
        <q-separator />
        <q-item
          :active="selectedTimeFrame === 'W1'"
          active-class="selected-item"
          clickable
          @click="onItemClick('W1')"
        >
          <q-item-section>W1</q-item-section>
          <InfoBadge
            class="q-ml-xs"
            :color="selectedTimeFrame === 'W1' ? 'white' : 'primary'"
            >6</InfoBadge
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
              @keydown.enter="onItemClick(customTimeFrameInputText)"
              style="width: 80px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InfoBadge from 'src/shared/components/info-badge.vue';
import { useQuasar } from 'quasar';
import { allowedTimeFrames } from './time-frame-dropdown.if';
import { StandardTimeFrames } from 'src/components/chart-window/chart-window.if';

const emit = defineEmits<{
  (event: 'timeFrameChanged', timeFrame: StandardTimeFrames): void;
}>();

const $q = useQuasar();

const selectedTimeFrame = ref('M5');

const exampleTextForTimeFrame = 'Custom';

const showTimeFrameMenuList = ref(true);
const timeFrameMenuShowing = ref(false);
const customTimeFrameInputText = ref('');
const customTimeFramePlaceHolder = ref(exampleTextForTimeFrame);

function onItemClick(timeFrame: string) {
  if (!allowedTimeFrames.includes(timeFrame)) {
    $q.notify({
      message: `The Input '${timeFrame}' is not a valid timeframe.`,
    });
  } else {
    emit('timeFrameChanged', timeFrame as StandardTimeFrames);
    selectedTimeFrame.value = timeFrame;
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
  width: 62px;
  padding-left: 4px !important;
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
