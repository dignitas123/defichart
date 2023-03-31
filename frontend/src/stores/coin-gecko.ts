import { defineStore } from 'pinia';
import axios from 'axios';

interface CoinData {
  [coin: string]: {
    usd: number;
    [key: string]: number;
  };
}

export const useCoinGecko = defineStore('coin-gecko', {
  state: () => ({
    prices: {} as CoinData,
  }),
  getters: {
    getPrices: (state) => state.prices,
  },
  actions: {
    async setPricesVsCurrency(prices = ['ethereum'], currency = 'usd') {
      if (process.env.NODE_ENV === 'development') {
        this.prices = { bitcoin: { usd: 27802 }, ethereum: { usd: 1769.85 } };
        return;
      }
      const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${prices.join(
        ','
      )}&vs_currencies=${currency}`;
      try {
        const response = await axios.get(endpoint);
        if (!response) {
          return;
        }
        this.prices = response.data;
      } catch (error) {
        console.error(error);
      }
    },
  },
});
