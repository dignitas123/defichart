<template>
  <q-layout
    view="lHh lpr lFf"
    container
    style="height: 600px; width: 700px"
    class="chart-wrapper"
  >
    <q-header elevated>
      <q-bar>
        <q-icon name="laptop_chromebook" />
        <div>Chart</div>

        <q-space />

        <q-btn dense flat icon="minimize" />
        <q-btn dense flat icon="crop_square" />
        <q-btn dense flat icon="close" />
      </q-bar>
    </q-header>
    <q-page-container style="height: 100%">
      <slot />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.chart-wrapper {
  .q-layout {
    position: absolute;
    height: 100%;
  }
}
</style>

<style lang="scss" scoped>
.chart-wrapper {
  position: absolute;
  border: 1px solid var(--q-primary);
}
</style>
