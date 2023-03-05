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
    <q-menu v-model="showing" bordered>
      <q-list dense>
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
        <q-item
          style="
            padding-left: 4px;
            padding-right: 4px;
            margin-top: 2px;
            margin-bottom: 2px;
          "
        >
          <q-item-section>
            <q-input
              outlined
              dense
              v-model="text"
              :placeholder="customTimeFramePlaceHolder"
              @focus="focusCustomTimeFrame"
              @blur="blurCustomTimeFrame"
              style="max-width: 54px"
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

const showing = ref(false);
const text = ref('');
const customTimeFramePlaceHolder = ref("'H1'");

function onItemClick() {
  emit('itemClicked');
  showing.value = false;
}

function focusCustomTimeFrame() {
  customTimeFramePlaceHolder.value = '';
}

function blurCustomTimeFrame() {
  customTimeFramePlaceHolder.value = "'H1'";
}
</script>

<style lang="scss">
.time-frame-dropdown-button {
  font-weight: bold;
}
</style>
