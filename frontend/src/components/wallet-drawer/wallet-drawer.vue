<template>
  <q-dialog v-model="open" seamless fullHeight position="right">
    <q-card class="wallet-drawer">
      <q-card-section class="full-height q-pa-none">
        <div class="row full-height">
          <div
            class="einklappen-col col-auto full-height flex justify-center cursor-pointer"
            @click="open = false"
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
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import useClipboard from 'vue-clipboard3';
import JazzIcon from 'src/components/jazz-icon/jazz-icon.vue';

const props = defineProps<{
  open: boolean;
  selectedAccountAddress?: string;
}>();

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void;
}>();

const { toClipboard } = useClipboard();

const open = ref(props.open);

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
