<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-bar>
        <q-icon name="img:deficharts.svg" />
        <div class="prevent-select text-weight-bold">DefiCharts</div>

        <q-space />

        <q-btn dense :ripple="false" color="secondary" label="Connect Wallet" />
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>