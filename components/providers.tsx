"use client"

import { ThemeProvider } from "next-themes"
import { AppWalletProvider } from "./app-wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppWalletProvider>
        {children}
        <Toaster />
      </AppWalletProvider>
    </ThemeProvider>
  )
} 