<template>
  <div class="atomic-time">
    {{ formattedTime }} UTC
    <q-tooltip>
      Coordinated Universal Time - 5 hours before New York Time
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { WorldTimeResult } from './atomic-time.if';

const time = ref<Date>();

const formattedTime = ref('');

function formatTime(time: Date) {
  return time.toISOString().split('T')[1].slice(0, 8);
}

function updateAtomicTime() {
  if (!time.value) {
    return;
  }
  time.value.setSeconds(time.value.getSeconds() + 1);
  formattedTime.value = formatTime(time.value);
}

function getAtomicTime() {
  axios
    .get('https://worldtimeapi.org/api/ip')
    .then((result: WorldTimeResult) => {
      time.value = new Date(result.data.utc_datetime);
      formattedTime.value = formatTime(time.value);
    });
}

onMounted(() => {
  getAtomicTime();
  setInterval(updateAtomicTime, 1000); // Update the time every second
});
</script>

<style lang="scss" scoped>
.atomic-time {
  font-size: 11px;
}
</style>
