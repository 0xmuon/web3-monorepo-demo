"use client"

import { ThemeProvider } from "next-themes"
import { AppWalletProvider } from "./app-wallet-provider"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AppWalletProvider>
        {children}
        <Toaster />
      </AppWalletProvider>
    </ThemeProvider>
  )
} 