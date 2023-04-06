import { alchemy } from "./connect.js";

export async function getBlock(block) {
  return await alchemy.core.getBlock(block);
}
