"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Trophy, InfoIcon,CpuIcon, FileTerminalIcon, GraduationCapIcon, ListTodo, Menu, X } from "lucide-react"
import { WalletButton } from "@/app/components/WalletButton"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react"
import { Icon } from "@radix-ui/react-select"

const navigationItems = [
  { href: "/competitions", label: "Competitions" ,icon: FileTerminalIcon},
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/docs", label: "Docs", icon:GraduationCapIcon},
  { href: "/about", label: "About Us", icon: InfoIcon }
  // Remove or update any staking-related links
]

export function Navbar() {
  const { publicKey } = useWallet()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CpuIcon></CpuIcon><span className="font-bold">Fight Script</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2">
          {publicKey ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-auto" />
                <span className="sr-only">Dashboard</span>
              </Button>
            </Link>
          ) : null}
          <WalletButton />
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="menu-button flex items-center justify-center md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/50 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-0 h-full w-64 bg-background/95 backdrop-blur-md border-l border-border/40 p-4 space-y-4 transform transition-transform duration-200 ease-in-out">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary py-2 text-lg font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  {item.label}
                </Link>
              ))}
              {publicKey && (
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-primary flex items-center gap-2 py-2 text-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}