import { defineStore } from 'pinia';

export const accountCurrencySymbols = {
  eth: 'ETH',
  usd: '$',
  eur: '€',
  jpy: '¥',
  krw: '₩',
  idr: '₹',
  twd: 'NT$',
  cny: 'CN¥',
  rub: '₽',
};

export enum AccountCurrencies {
  eth = 'eth',
  usd = 'usd',
  eur = 'eur',
  jpy = 'jpy',
  krw = 'krw',
  idr = 'idr',
  twd = 'twd',
  cny = 'cny',
  rub = 'rub',
}

interface DisplaySettings {
  accountCurrency: AccountCurrencies;
  accountBalanceShow: boolean;
}

const standardDisplaySettings: DisplaySettings = {
  accountCurrency: AccountCurrencies.usd,
  accountBalanceShow: true,
};

export const useUserSettings = defineStore('user-settings', {
  state: () => ({
    displaySettings: standardDisplaySettings,
  }),
  getters: {
    getAccountCurrency: (state) => state.displaySettings.accountCurrency,
    getAccountBalanceShow: (state) => state.displaySettings.accountBalanceShow,
  },
  actions: {
    setAccountCurrency(currency: AccountCurrencies) {
      this.displaySettings.accountCurrency = currency;
      setItemToLocalStorage('accountCurrency', currency);
    },
    setAccountBalanceShow(show: boolean) {
      this.displaySettings.accountBalanceShow = show;
      setItemToLocalStorage('accountBalanceShow', String(show));
    },
    setDisplaySettingsFromLocalStorage() {
      const displaySettings = localStorage.getItem('displaySettings');
      if (displaySettings) {
        this.displaySettings = JSON.parse(displaySettings);
      }
    },
  },
});

function setItemToLocalStorage(item: string, value: string) {
  const settingsFromLocalStorage = localStorage.getItem('settings');
  let displaySettingsToLocalStorage = '';
  if (settingsFromLocalStorage) {
    const settingsObject = JSON.parse(settingsFromLocalStorage);
    settingsObject[item] = value;
    displaySettingsToLocalStorage = JSON.stringify(settingsObject);
  } else {
    displaySettingsToLocalStorage = JSON.stringify(standardDisplaySettings);
  }
  localStorage.setItem('displaySettings', displaySettingsToLocalStorage);
}
