"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'

interface Wallet {
  adapter: {
    name: string;
  };
}

export function WalletButton() {
  const { connected, select, wallets, disconnect, publicKey } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (connected) {
      console.log('Wallet connected:', publicKey?.toString())
    }
  }, [connected, publicKey])

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect Wallet
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {wallets.map((wallet: Wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => {
                    select(wallet.adapter.name)
                    setIsDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {wallet.adapter.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 