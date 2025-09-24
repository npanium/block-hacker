import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { defineChain } from "viem";

export const horizenTestnet = defineChain({
  id: 845320009,
  name: "Horizen Testnet",
  network: "horizen-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://horizen-rpc-testnet.appchain.base.org"],
    },
    public: {
      http: ["https://horizen-rpc-testnet.appchain.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Horizen Explorer",
      url: "https://horizen-explorer-testnet.appchain.base.org",
    },
  },
});

export const config = getDefaultConfig({
  appName: "Block-Hackers",
  projectId: "0d2cc1eff4560bfed6c144f15b28be2e",
  chains: [horizenTestnet],
  ssr: true,
});
