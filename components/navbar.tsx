"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Trophy, ListTodo } from "lucide-react"
import { WalletButton } from "@/app/components/WalletButton"
import { useWallet } from "@solana/wallet-adapter-react"

const navigationItems = [
  { href: "/competitions", label: "Competitions" },
  { href: "/about", label: "About Us" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  // Remove or update any staking-related links
]

export function Navbar() {
  const { publicKey } = useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Fight Script</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {publicKey ? (
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <User className="h-4 w-4" />
            </Link>
          ) : null}
          <Link href="https://0xmuon.github.io/co3pe-docs/" target="_blank" rel="noopener noreferrer" className="text-white">
            Docs
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}