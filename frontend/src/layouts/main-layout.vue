<template>
  <q-layout view="hHr LpR fFr" container style="height: 100vh">
    <q-header elevated>
      <q-bar style="padding-right: 0">
        <q-icon name="img:deficharts.svg" />
        <q-icon
          name="img:deficharts_text.svg"
          style="width: auto; height: auto"
        />
        <q-space />
        <q-btn
          v-if="selectedAccountAddress && ethBalance"
          unelevated
          class="q-px-sm"
          dense
          color="transparent"
          :ripple="false"
          text-color="white"
          @click="walletDrawerOpen = true"
        >
          <span class="q-mr-sm">{{ ethBalance.substring(0, 5) }} ETH</span
          ><q-btn
            dense
            glossy
            no-caps
            :ripple="false"
            color="secondary"
            class="secondary-gradient"
            text-color="primary"
            style="opacity: 0.95"
          >
            <div class="row inline items-center">
              <span>{{ accountAddressFirst7Digits }}</span
              ><JazzIcon
                class="flex q-ml-xs"
                :address="selectedAccountAddress"
                :diameter="16"
              /></div
          ></q-btn>
        </q-btn>
        <q-skeleton
          v-if="loading"
          class="q-px-sm"
          width="150px"
          type="QBtn"
          animation="pulse"
          style="border-radius: 4px"
        />
        <q-btn
          v-if="afterMounted && !selectedAccountAddress"
          transition-show="fade"
          dense
          class="secondary-gradient q-mr-xs"
          :ripple="false"
          text-color="primary"
          label="Connect Wallet"
          @click="setProviderAndSigner"
        />
      </q-bar>
    </q-header>

    <q-dialog v-model="walletDrawerOpen" seamless fullHeight position="right">
      <q-card class="wallet-drawer">
        <q-card-section class="full-height q-pa-none">
          <div class="row full-height">
            <div
              class="einklappen-col col-auto full-height flex justify-center cursor-pointer"
              @click="walletDrawerOpen = false"
            >
              <q-icon
                name="chevron_right"
                size="sm"
                color="dark"
                style="top: 25%"
              />
            </div>
            <div class="col q-pa-md">
              <div class="row items-center" v-if="selectedAccountAddress">
                <JazzIcon
                  class="flex q-mr-xs jazz-icon-in-wallet-drawer"
                  :address="selectedAccountAddress"
                  :diameter="32"
                />
                <span
                  class="account-dotted non-selectable text-subtitle1 cursor-pointer q-mr-xs"
                  @mouseover="accountDottedHover = true"
                  @mouseout="accountDottedHover = false"
                  @click="copyToClipBoard"
                  >{{ accountAddessDottedVersion }}</span
                ><span v-if="accountDottedHover"
                  ><q-icon color="dark" name="content_copy"
                /></span>
                <div style="position: absolute; right: 16px">
                  <q-btn
                    icon="settings"
                    color="primary"
                    unelevated
                    text-color="white"
                    dense
                    padding="sm"
                    size="xs"
                    class="q-mr-xs"
                  />
                </div>
              </div>
              <div class="row">
                <!-- TODO: signed in -->
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { formatEther } from '@ethersproject/units';
import { useWeb3Provider } from 'src/shared/composables/web3provider';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import JazzIcon from 'src/components/jazz-icon/jazz-icon.vue';
import useClipboard from 'vue-clipboard3';

const { toClipboard } = useClipboard();

const { getProviderAndSigner } = useWeb3Provider();

const web3Instance = ref();
let web3Provider: Web3Provider | undefined;
const web3Signer = ref<JsonRpcSigner>();
const web3Accounts = ref<string[]>([]);
const ethBalance = ref<string>();

const selectedAccountAddress = computed(() => {
  const account = web3Accounts.value[0];
  if (!account) {
    return undefined;
  }
  return account;
});

const accountDottedHover = ref(false);

const accountAddressFirst7Digits = computed(() => {
  return selectedAccountAddress.value?.substring(0, 7);
});

async function copyToClipBoard() {
  try {
    await toClipboard(selectedAccountAddress.value ?? '');
  } catch (e) {
    console.error(e);
  }
}

// TODO: use in drawer
const accountAddessDottedVersion = computed(() => {
  return (
    selectedAccountAddress.value?.slice(0, 4) +
    '...' +
    web3Accounts.value[0].slice(-4)
  );
});

const walletDrawerOpen = ref(false);

const afterMounted = ref(false);
onMounted(async () => {
  if (window.ethereum.selectedAddress) {
    await setProviderAndSigner();
  }
  afterMounted.value = true;
});

async function getEthBalance() {
  if (!selectedAccountAddress.value || !web3Provider) {
    return undefined;
  }
  const balance = await web3Provider.getBalance(selectedAccountAddress.value);
  if (!balance) {
    return undefined;
  }
  return formatEther(balance);
}

const loading = ref(false);

async function setProviderAndSigner() {
  try {
    const { provider, signer, instance } = await getProviderAndSigner();
    if (!provider || !signer || !instance) {
      return;
    }
    loading.value = true;
    web3Provider = provider;
    web3Signer.value = signer;
    web3Instance.value = instance;
    web3Accounts.value = await web3Provider.listAccounts();
    ethBalance.value = await getEthBalance();
    // TODO: get other balances
    // const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    // const address = '0x9876543210987654321098765432109876543210'; // replace with the Ethereum address whose token balance you want to retrieve

    // async function getTokenBalance() {
    //   const balance = await tokenContract.balanceOf(address);
    //   console.log(ethers.utils.formatUnits(balance)); // convert balance to token units and log to console
    // }
    loading.value = false;
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
    setProviderAndSigner();
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

onBeforeUnmount(() => {
  web3Provider = undefined;
});
</script>

<style lang="scss" scoped>
.wallet-drawer {
  width: 320px;
  height: 150px;
  right: 3px;
  border-radius: 4px !important;

  .jazz-icon-in-wallet-drawer {
    border: 1px solid var(--q-primary);
    border-radius: 20px;
    box-shadow: 0px 0px 3px 0px var(--q-primary);
  }

  .account-dotted:hover {
    color: var(--q-dark);
  }

  .einklappen-col {
    width: 30px;
    background: linear-gradient(
      to bottom,
      rgba($dark, 0) 0%,
      rgba($dark, 0.1) 25%,
      rgba($dark, 0) 100%
    );
    transition: background-color 0.4s ease;
    &:hover {
      background: linear-gradient(
        to bottom,
        rgba($dark, 0) 0%,
        rgba($dark, 0.3) 25%,
        rgba($dark, 0) 100%
      );
    }
  }
}
</style>
