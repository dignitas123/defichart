<template>
  <q-dialog v-model="open" seamless fullHeight position="right">
    <q-card class="wallet-drawer">
      <q-card-section class="full-height q-pa-none">
        <div class="row full-height">
          <div
            class="einklappen-col col-auto full-height flex justify-center cursor-pointer"
            @click="
              open = false;
              settingsOpen = false;
            "
          >
            <q-icon
              name="chevron_right"
              size="sm"
              color="dark"
              style="top: 25%"
            />
          </div>
          <div v-if="settingsOpen" class="col q-pa-md">
            <div class="row">
              <div class="col-auto">
                <q-icon
                  name="arrow_back"
                  size="sm"
                  class="cursor-pointer"
                  @click="settingsOpen = false"
                />
              </div>
              <div class="col text-center text-weight-bold">Settings</div>
            </div>
            <div class="row q-mt-md items-center">
              <div class="col">Account Currency:</div>
              <div class="col-auto">
                <q-select
                  dense
                  outlined
                  v-model="selectedAccountCurrency"
                  :options="Object.values(accountCurrencySymbols)"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="q-gutter-sm">
                <q-radio
                  v-model="hideOrShowBalance"
                  dense
                  checked-icon="task_alt"
                  val="show"
                  label="Show account balance"
                />
                <q-radio
                  v-model="hideOrShowBalance"
                  dense
                  checked-icon="task_alt"
                  val="hide"
                  label="Hide account balance"
                />
              </div>
            </div>
          </div>
          <div v-else class="col q-pa-md">
            <div class="row items-center" v-if="selectedAccountAddress">
              <q-btn
                unelevated
                class="bg-transparent absolute"
                round
                size="12px"
                :ripple="false"
              >
                <q-menu auto-close>
                  <q-list style="min-width: 120px" dense>
                    <q-item clickable>
                      <q-item-section>
                        <a
                          :href="`https://etherscan.io/address/${selectedAccountAddress}`"
                          target="_blank"
                          class="router-link"
                        >
                          <div class="row items-center">
                            Open in Etherscan<q-icon
                              name="open_in_new"
                              class="q-ml-xs"
                            />
                          </div>
                        </a>
                      </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="
                        $emit('disconnect');
                        open = false;
                      "
                    >
                      <q-item-section>
                        <div class="row items-center">
                          Disconnect Wallet<q-icon
                            name="power_settings_new"
                            class="q-ml-xs"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
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
                  @click="settingsOpen = true"
                />
              </div>
            </div>
            <div
              v-if="accountBalance && userSettings.getAccountBalanceShow"
              class="row"
            >
              <!-- TODO: signed in -->
              <div class="text-h4 text-weight-medium q-mt-md">
                {{ accountBalance }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import useClipboard from 'vue-clipboard3';
import JazzIcon from 'src/components/jazz-icon/jazz-icon.vue';
import {
  AccountCurrencies,
  accountCurrencySymbols,
  useUserSettings,
} from 'src/stores/user-settings';
import { getTargetValue } from 'src/shared/utils/object-functions';
import { useCoinGecko } from 'src/stores/coin-gecko';

const props = defineProps<{
  open: boolean;
  selectedAccountAddress?: string;
  accountBalance?: string;
}>();

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void;
  (event: 'disconnect'): void;
}>();

const { toClipboard } = useClipboard();

const { setPricesVsCurrency } = useCoinGecko();

const userSettings = useUserSettings();

const open = ref(props.open);
const settingsOpen = ref(false);

watch(
  () => props.open,
  () => {
    open.value = props.open;
  }
);
watch(open, () => {
  emit('update:open', open.value);
});

const accountDottedHover = ref(false);

async function copyToClipBoard() {
  try {
    await toClipboard(props.selectedAccountAddress ?? '');
  } catch (e) {
    console.error(e);
  }
}

const accountAddessDottedVersion = computed(() => {
  if (!props.selectedAccountAddress) {
    return '';
  }
  return (
    props.selectedAccountAddress.slice(0, 7) +
    '...' +
    props.selectedAccountAddress.slice(-4)
  );
});

//settings
const selectedAccountCurrency = ref<string>(
  accountCurrencySymbols[userSettings.getAccountCurrency]
);

watch(selectedAccountCurrency, async () => {
  userSettings.setAccountCurrency(
    getTargetValue(
      selectedAccountCurrency.value,
      accountCurrencySymbols
    ) as AccountCurrencies
  );
  // TODO: '[ethereum] can be replaced with all relevant token balances'
  await setPricesVsCurrency(['ethereum'], userSettings.getAccountCurrency);
});

const hideOrShowBalance = ref(
  userSettings.getAccountBalanceShow ? 'show' : 'hide'
);

watch(hideOrShowBalance, () => {
  userSettings.setAccountBalanceShow(hideOrShowBalance.value === 'show');
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
