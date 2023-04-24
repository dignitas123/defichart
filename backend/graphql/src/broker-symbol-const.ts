// synonymous with the aws timestream tables

const BTCUSD = "btcusd";
const PERP = "perp";

const SYMBOL_LIST = [BTCUSD];
const BROKER_LIST = [PERP];
const TIME_INTERVALS = ["m1", "m5", "h1", "d1", "w1"];

export const SYMBOL_BROKER_LIST = SYMBOL_LIST.flatMap((symbol) => {
  return BROKER_LIST.map((broker) => {
    return `${symbol}-${broker}`;
  });
});

export const SYMBOL_BROKER_TIME_INTERVAL_LIST = SYMBOL_BROKER_LIST.flatMap(
  (symbolBroker) => {
    return TIME_INTERVALS.map((timeInterval) => {
      return `${symbolBroker}_${timeInterval}`;
    });
  }
);
