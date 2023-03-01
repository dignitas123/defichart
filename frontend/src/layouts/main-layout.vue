<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-bar>
        <q-icon name="img:deficharts.svg" />
        <q-icon
          name="img:deficharts_text.svg"
          style="width: auto; height: auto"
        />
        <q-space />

        <q-btn
          dense
          class="secondary-gradient"
          :ripple="false"
          text-color="primary"
          label="Connect Wallet"
        />
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
