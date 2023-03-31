import { defineStore } from 'pinia';

export enum AccountCurrencies {
  eth = 'ETH',
  usd = '$',
  eur = '€',
  yen = '¥',
  krw = '₩',
  idr = '₹',
  twd = 'NT$',
  cny = 'CN¥',
  rub = '₽',
}

interface UserStore {
  accountCurrency: AccountCurrencies;
}

export const useUserSettings = defineStore('user-settings', {
  state: () => ({
    displaySettings: {
      accountCurrency: AccountCurrencies.usd,
    } as UserStore,
  }),
  getters: {
    getAccountCurrency: (state) => state.displaySettings.accountCurrency,
  },
  actions: {
    setAccountCurrency(currency: AccountCurrencies) {
      this.displaySettings.accountCurrency = currency;
      const settingsFromLocalStorage = localStorage.getItem('settings');
      let displaySettingsToLocalStorage = '';
      if (settingsFromLocalStorage) {
        const settingsObject = JSON.parse(settingsFromLocalStorage);
        settingsObject.accountCurrency = currency;
        displaySettingsToLocalStorage = JSON.stringify(settingsObject);
      } else {
        displaySettingsToLocalStorage = JSON.stringify({
          accountCurrency: currency,
        });
      }
      localStorage.setItem('displaySettings', displaySettingsToLocalStorage);
    },
    setDisplaySettingsFromLocalStorage() {
      const displaySettings = localStorage.getItem('displaySettings');
      if (displaySettings) {
        this.displaySettings = JSON.parse(displaySettings);
      }
    },
  },
});
