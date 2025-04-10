import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Co3pe",
  description: "AI Competition Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}

