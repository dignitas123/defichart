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
        this.prices = {
          ethereum: {
            eth: 1.0,
            usd: 1830.04,
            jpy: 242878,
            eur: 1684.11,
            krw: 2390891,
            idr: 27393218,
            twd: 55890,
            cny: 12570.17,
            rub: 141876,
          },
        };
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
