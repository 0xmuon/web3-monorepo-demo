"use client"

import { useMemo } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"

// Import wallet adapter CSS
require("@solana/wallet-adapter-react-ui/styles.css")

export function AppWalletProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  // Network is constant, so we can define it outside useMemo
  const network = WalletAdapterNetwork.Devnet
  const endpoint = clusterApiUrl(network)

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [] // Empty dependency array since wallets don't depend on network
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
} 