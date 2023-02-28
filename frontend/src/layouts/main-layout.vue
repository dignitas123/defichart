<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-bar>
        <q-icon name="img:deficharts.svg" />
        <span class="prevent-select q-ml-xs">DefiCharts</span>

        <q-space />

        <q-btn dense :ripple="false" color="secondary" label="Connect Wallet" />
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
