<template>
  <q-dialog
    v-model="dialogOpen"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">Welcome to DefiCharts!</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <ul>
          <li>
            This is an <b>ALPHA MVP</b> Version, features are still added to the
            platform — use at your own risk.
          </li>
          <li>
            Deficharts is a charting provider for decentralized crypto futures,
            including interactions with derivative protocols.
          </li>
          <li>Feedback and Bug Reports are very much appreciated.</li>
        </ul>
      </q-card-section>

      <q-card-section
        class="q-pt-none prevent-select"
        style="cursor: pointer"
        @click="accepted = !accepted"
      >
        <q-checkbox v-model="accepted" /> I have read and agreed to
        <u>Terms of Service</u>.
      </q-card-section>

      <q-card-actions>
        <q-btn
          flat
          class="full-width"
          color="secondary"
          style="background-color: black"
          noCaps
          label="Start charting"
          :disable="!accepted"
          v-close-popup
          @click="setCookie(COOKIE_DIALOG_NAME, 'true')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useCookies } from 'src/composables/cookies';
import { onMounted, ref } from 'vue';

const COOKIE_DIALOG_NAME = 'cookie-dialog-info-tos-accepted';

const dialogOpen = ref(false);

const accepted = ref(false);

const { setCookie, getCookie } = useCookies();

onMounted(() => {
  const cookie = getCookie(COOKIE_DIALOG_NAME);
  console.log('cookie', cookie);
  if (cookie === null || cookie === 'false') {
    dialogOpen.value = true;
  }
});
</script>
