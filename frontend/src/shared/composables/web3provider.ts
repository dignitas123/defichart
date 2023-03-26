import Web3Modal from 'web3modal';
import { Web3Provider } from '@ethersproject/providers';

export function useWeb3Provider() {
  const providerOptions = {
    // TODO: add more provider options
    // See https://www.npmjs.com/package/web3modal
  };

  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions,
  });

  async function getProviderAndSigner() {
    const instance = await web3Modal.connect();
    if (!instance) {
      return { provider: undefined, signer: undefined, instance: undefined };
    }
    const provider: Web3Provider = new Web3Provider(instance);
    const signer = provider.getSigner();

    return {
      provider,
      signer,
      instance,
    };
  }

  return {
    getProviderAndSigner,
  };
}
