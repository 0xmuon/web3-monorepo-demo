"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Menu, X } from "lucide-react"
import { WalletButton } from "../../components/wallet-button"
import { useState, useEffect } from "react"

export default function Navbar() {
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
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Co3pe</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/competitions" className="transition-colors hover:text-primary">
              Competitions
            </Link>
            <Link href="/about" className="transition-colors hover:text-primary">
              About Us
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            Docs
          </Button>
          <WalletButton />
          {/* Menu Button - Always visible */}
          <Button
            variant="ghost"
            size="icon"
            className="menu-button flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu fixed inset-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
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
              <Link
                href="/competitions"
                className="transition-colors hover:text-primary py-2 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Competitions
              </Link>
              <Link
                href="/about"
                className="transition-colors hover:text-primary py-2 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-primary flex items-center gap-2 py-2 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

