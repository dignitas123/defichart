<template>
  <q-layout
    view="hHr LpR fFr"
    container
    style="height: 100vh"
    class="secondary-radial-gradient-light"
  >
    <q-header elevated>
      <q-bar style="padding-right: 0">
        <q-icon name="img:deficharts.svg" />
        <q-icon
          name="img:deficharts_text.svg"
          style="width: auto; height: auto"
        />
        <AtomicClock />
        <q-space />
        <q-btn
          v-if="!loading && selectedAccountAddress && ethBalance"
          unelevated
          class="q-px-sm"
          dense
          padding="xs"
          color="transparent"
          :ripple="false"
          text-color="white"
          @click="walletDrawerOpen = true"
        >
          <span v-if="userSettings.getAccountBalanceShow" class="q-mr-sm">{{
            accountBalance
          }}</span
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
        <q-btn
          v-if="afterMounted && !selectedAccountAddress"
          dense
          class="secondary-gradient q-mr-xs"
          :ripple="false"
          text-color="primary"
          label="Connect Wallet"
          @click="setProviderAndSigner"
        />
        <q-skeleton
          v-else-if="loading"
          class="q-px-sm"
          width="150px"
          type="QBtn"
          animation="pulse"
          style="border-radius: 4px"
        />
      </q-bar>
    </q-header>

    <WalletDrawer
      v-model:open="walletDrawerOpen"
      :selected-account-address="selectedAccountAddress"
      :account-balance="accountBalance"
      @disconnect="disconnectWallet"
    />

    <CookieDialog />

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
import WalletDrawer from 'src/components/wallet-drawer/wallet-drawer.vue';
import JazzIcon from 'src/components/jazz-icon/jazz-icon.vue';
import { useCoinGecko } from 'src/stores/coin-gecko';
import {
  AccountCurrencies,
  accountCurrencySymbols,
  useUserSettings,
} from 'src/stores/user-settings';
import AtomicClock from 'src/components/atomic-clock/atomic-clock.vue';
import CookieDialog from 'src/components/cookie-dialog/cookie-dialog.vue';

const coinGecko = useCoinGecko();

const userSettings = useUserSettings();

const { getProviderAndSigner } = useWeb3Provider();

const web3Instance = ref();
let web3Provider: Web3Provider | undefined;
const web3Signer = ref<JsonRpcSigner>();
const web3Accounts = ref<string[]>([]);

// balance
const ethBalance = ref<string>();

function getCoinGeckoPriceToEth(price: string) {
  // TODO: add balances from other relevant assets to this amount
  if (!ethBalance.value) {
    return undefined;
  }
  let roundingNumber = 100; // e.g. $100.52
  if (price === 'idr') {
    roundingNumber = 1;
  } else if (price === 'eth') {
    roundingNumber = 1000;
  }
  return (
    Math.round(
      coinGecko.getPrices.ethereum[price] *
        Number(ethBalance.value) *
        roundingNumber
    ) / roundingNumber
  );
}

function getCoinGeckoStringForCurrency(accountCurrency: AccountCurrencies) {
  switch (accountCurrency) {
    case AccountCurrencies.eth:
      return 'eth';
    case AccountCurrencies.usd:
      return 'usd';
    case AccountCurrencies.eur:
      return 'eur';
    case AccountCurrencies.jpy:
      return 'jpy';
    case AccountCurrencies.krw:
      return 'krw';
    case AccountCurrencies.idr:
      return 'idr';
    case AccountCurrencies.twd:
      return 'twd';
    case AccountCurrencies.cny:
      return 'cny';
    case AccountCurrencies.rub:
      return 'rub';
  }
}

const accountBalance = computed(() => {
  if (userSettings.getAccountCurrency === AccountCurrencies.eth) {
    return `${ethBalance.value?.substring(0, 5)} ${
      accountCurrencySymbols[AccountCurrencies.eth]
    }`;
  }
  const priceToEthInAccountCurrency = getCoinGeckoPriceToEth(
    getCoinGeckoStringForCurrency(userSettings.getAccountCurrency)
  );
  const accountCurrencySymbol =
    accountCurrencySymbols[userSettings.getAccountCurrency];
  if (userSettings.getAccountCurrency === AccountCurrencies.eur) {
    return priceToEthInAccountCurrency + accountCurrencySymbol;
  } else {
    return accountCurrencySymbol + priceToEthInAccountCurrency;
  }
});

const selectedAccountAddress = computed(() => {
  const account = web3Accounts.value[0];
  if (!account) {
    return undefined;
  }
  return account;
});

const accountAddressFirst7Digits = computed(() => {
  return selectedAccountAddress.value?.substring(0, 7);
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

function disconnectWallet() {
  if (!web3Signer.value) {
    return;
  }
  web3Provider = undefined;
  web3Signer.value = undefined;
  web3Accounts.value = [];
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
