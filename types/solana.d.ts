declare module "@solana/wallet-adapter-react" {
  import { FC } from "react";
  import { Connection } from "@solana/web3.js";
  import { Wallet } from "@solana/wallet-adapter-base";

  export interface WalletProviderProps {
    wallets: Wallet[];
    autoConnect?: boolean;
    children: React.ReactNode;
  }

  export interface ConnectionProviderProps {
    endpoint: string;
    children: React.ReactNode;
  }

  export const WalletProvider: FC<WalletProviderProps>;
  export const ConnectionProvider: FC<ConnectionProviderProps>;
  export const useWallet: () => any;
  export const useConnection: () => { connection: Connection };
}

declare module "@solana/wallet-adapter-react-ui" {
  import { FC } from "react";
  export const WalletModalProvider: FC<{ children: React.ReactNode }>;
}

declare module "@solana/wallet-adapter-wallets" {
  import { WalletAdapter } from "@solana/wallet-adapter-base";
  export class PhantomWalletAdapter implements WalletAdapter {}
  export class SolflareWalletAdapter implements WalletAdapter {}
} 