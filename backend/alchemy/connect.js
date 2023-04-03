import { credentials } from "./credentials.js";
import { Network, Alchemy } from "alchemy-sdk";

const settings = {
  apiKey: credentials.API_KEY,
  network: Network.OPT_MAINNET,
};

export const alchemy = new Alchemy(settings);
