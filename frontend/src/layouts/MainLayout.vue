<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-bar>
        <q-icon name="analytics" />
        <div>Defi Charts</div>

        <q-space />

        <q-btn dense :ripple="false" color="secondary" label="Connect Wallet" />
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
