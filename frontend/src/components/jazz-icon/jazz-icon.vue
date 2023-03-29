<template>
  <div ref="jazziconRef" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { addressToNumber, generateIdenticon } from './jazz-icon.model';

const props = withDefaults(
  defineProps<{
    address: string;
    seed?: number;
    diameter?: number;
  }>(),
  {
    seed: Math.round(Math.random() * 10000000),
    diameter: 100,
  }
);

function setIcon(icon: HTMLDivElement) {
  if (!jazziconRef.value) {
    return;
  }
  jazziconRef.value.appendChild(icon);
}

const jazziconRef = ref<HTMLDivElement>();

onMounted(() => {
  if (!props.seed || !props.address) {
    return;
  }
  const icon = generateIdenticon(
    props.diameter,
    addressToNumber(props.address)
  );
  setIcon(icon);
});
</script>
