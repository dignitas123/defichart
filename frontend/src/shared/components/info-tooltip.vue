<template>
  <q-tooltip
    class="info-tooltip"
    :delay="1000"
    anchor="bottom start"
    self="top left"
    style="display: inline-flex; align-items: center"
  >
    <slot />
  </q-tooltip>
</template>
