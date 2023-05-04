<template>
  <q-btn-dropdown
    v-model="timeFrameMenuShowing"
    dense
    flat
    menuAnchor="bottom left"
    menuSelf="top left"
    square
    size="sm"
    :ripple="false"
    color="primary"
    :label="selectedTimeFrame"
    @hide="resetCustomTimeFrameInputText"
    bordered
    class="time-frame-dropdown-button header-button q-px-xs"
    :class="{ blink: isBlinking && !blinkingBlock }"
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
          v-if="!$q.platform.is.mobile"
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
          v-if="!$q.platform.is.mobile"
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
          v-if="!$q.platform.is.mobile"
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
          v-if="!$q.platform.is.mobile"
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
          v-if="!$q.platform.is.mobile"
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
          v-if="!$q.platform.is.mobile"
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
            :style="`width: ${$q.platform.is.mobile ? 54 : 93}px`"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, Ref, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import InfoBadge from 'src/shared/components/info-badge.vue';
import {
  allowedTimeFrames,
  allowedTimeFramesEnum,
  TimeFrame,
} from './time-frame-dropdown.if';
import { StandardTimeFrames } from 'src/components/chart-window/chart-window.if';
import { INITIAL_TIME_FRAME } from 'src/pages/broker-charts/consts';

const props = defineProps<{
  timeFrame: TimeFrame;
}>();

const emit = defineEmits<{
  (event: 'timeFrameChanged', timeFrame: TimeFrame): void;
}>();

const $q = useQuasar();

// TODO: should come from the users saved settings
const selectedTimeFrame = ref<TimeFrame>(INITIAL_TIME_FRAME);

const exampleTextForTimeFrame = computed(() => {
  return $q.platform.is.mobile ? 'M2..' : 'Custom';
});

const showTimeFrameMenuList = ref(true);
const timeFrameMenuShowing = ref(false);
const customTimeFrameInputText = ref('');
const customTimeFramePlaceHolder = ref(exampleTextForTimeFrame.value);

const timeFrameSetByUser = inject(
  'timeFrameSetByUser'
) as Ref<StandardTimeFrames>;

const firstTimeBlink = ref(false);
watch(
  () => props.timeFrame,
  () => {
    selectedTimeFrame.value = props.timeFrame;
    if (firstTimeBlink.value) {
      timeFrameBlink();
    }
    firstTimeBlink.value = true;
  }
);

watch(timeFrameSetByUser, () => {
  blinkingBlock.value = true;
  setTimeout(() => {
    blinkingBlock.value = false;
  }, 400);
  selectedTimeFrame.value = timeFrameSetByUser.value;
});

const isBlinking = ref(false);
const blinkingBlock = ref(false);

function timeFrameBlink() {
  isBlinking.value = true;
  setTimeout(() => {
    isBlinking.value = false;
  }, 400);
}

function onCustomTFInputClick(input: string) {
  blinkingBlock.value = true;
  setTimeout(() => {
    blinkingBlock.value = false;
  }, 400);
  if (!Object.keys(allowedTimeFramesEnum).includes(input)) {
    $q.notify({
      message: `The Input <b>'${input}'</b> is not a valid timeframe. Available timeframes are <i>${allowedTimeFrames.join(
        ', '
      )}</i>. <br />More timeframes are a work in progress.`,
      actions: [{ icon: 'close', color: 'white' }],
      html: true,
      timeout: 7000,
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
  customTimeFramePlaceHolder.value = exampleTextForTimeFrame.value;
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
