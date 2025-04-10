"use client"

import { FC, ReactNode } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { ThemeProvider } from "next-themes"

// Import wallet adapter CSS
require("@solana/wallet-adapter-react-ui/styles.css")

interface ProvidersProps {
  children: ReactNode
}

const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter()
]

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  )
} 