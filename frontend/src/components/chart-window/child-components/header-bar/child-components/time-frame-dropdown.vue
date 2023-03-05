<template>
  <q-btn
    dense
    flat
    square
    size="sm"
    :ripple="false"
    color="primary"
    label="M5"
    class="time-frame-dropdown-button q-px-xs"
  >
    <q-menu
      v-model="timeFrameMenuShowing"
      bordered
      @hide="resetCustomTimeFrameInputText"
    >
      <q-list dense v-if="showTimeFrameMenuList">
        <q-item clickable @click="onItemClick">
          <q-item-section>M1</q-item-section>
        </q-item>
        <q-item clickable @click="onItemClick">
          <q-item-section>M5</q-item-section>
        </q-item>
        <q-item clickable @click="onItemClick">
          <q-item-section>M30</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="onItemClick">
          <q-item-section>H4</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="onItemClick">
          <q-item-section>D1</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="onItemClick">
          <q-item-section>W1</q-item-section>
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
              @keydown.enter="onItemClick"
              style="width: 54px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (event: 'itemClicked'): void;
}>();

const showTimeFrameMenuList = ref(true);
const timeFrameMenuShowing = ref(false);
const customTimeFrameInputText = ref('');
const customTimeFramePlaceHolder = ref("'H1'");

function onItemClick() {
  emit('itemClicked');
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
  customTimeFramePlaceHolder.value = "'H1'";
  customTimeFrameInputText.value = '';
}
</script>

<style lang="scss">
.time-frame-dropdown-button {
  font-weight: bold;
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
