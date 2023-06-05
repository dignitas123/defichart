<template>
  <div class="atomic-time-wrapper">
    <div class="atomic-time">
      {{ atomicTime.formattedTime }}
    </div>
    UTC
    <q-tooltip>
      Coordinated Universal Time - 5 hours before New York Time
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useAtomicTimeStore } from 'src/stores/atomic-time';

const atomicTime = useAtomicTimeStore();
</script>

<style lang="scss" scoped>
.atomic-time-wrapper {
  display: inline-flex;
  cursor: help;
  font-size: 11px;
  .atomic-time {
    width: 50px;
  }
}
</style>
