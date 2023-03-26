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

        <div v-if="accountPublicAddress">{{ accountPublicAddress }}</div>
        <q-btn
          v-if="afterMounted && !accountPublicAddress"
          transition-show="fade"
          dense
          class="secondary-gradient"
          :ripple="false"
          text-color="primary"
          label="Connect Wallet"
          @click="setProviderAndSigner"
        />
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useWeb3Provider } from 'src/shared/composables/web3provider';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

const { getProviderAndSigner } = useWeb3Provider();

const web3Instance = ref();
const web3Provider = ref<Web3Provider>();
const web3Signer = ref<JsonRpcSigner>();

const web3Accounts = ref<string[]>([]);

const accountPublicAddress = computed(() => {
  const account = web3Accounts.value[0];
  if (!account) {
    return undefined;
  }
  return account.slice(0, 4) + '...' + web3Accounts.value[0].slice(-4);
});

const afterMounted = ref(false);
onMounted(async () => {
  if (window.ethereum.selectedAddress) {
    await setProviderAndSigner();
  }
  afterMounted.value = true;
});

async function setProviderAndSigner() {
  try {
    const { provider, signer, instance } = await getProviderAndSigner();
    if (!provider || !signer || !instance) {
      return;
    }
    web3Provider.value = provider;
    web3Signer.value = signer;
    web3Instance.value = instance;
    web3Accounts.value = await web3Provider.value.listAccounts();
  } catch (e) {
    console.error(e);
  }
}

watch(web3Instance, () => {
  if (!web3Instance.value) {
    return;
  }
  web3Instance.value.on('accountsChanged', (accounts: string[]) => {
    web3Accounts.value = accounts;
  });

  web3Instance.value.on('chainChanged', (chainId: number) => {
    console.log('chainChanged', chainId);
  });

  web3Instance.value.on('connect', (info: { chainId: number }) => {
    console.log('connect', info);
  });

  web3Instance.value.on(
    'disconnect',
    (error: { code: number; message: string }) => {
      console.log('disconnect', error);
    }
  );
});
</script>
