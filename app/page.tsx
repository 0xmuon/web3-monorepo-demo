"use client"

import { useEffect, useState, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import { CTA } from "@/components/cta"
import Footer from "@/components/footer"
import { Suspense } from "react"
import { LoadingState } from "@/components/ui/loading-state"
import { useWallet } from "@solana/wallet-adapter-react"
import { UserOnboardingModal, UserOnboardingModalProps } from "./components/user-onboarding-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { fetchUser } from "./lib/api"

// Cache user check results
const userCheckCache = new Map<string, boolean>()

export default function Home() {
  const { publicKey } = useWallet()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)

  const checkUser = useCallback(async () => {
    if (!publicKey || isCheckingUser) return

    const walletAddress = publicKey.toString()
    
    // Check cache first
    const cachedIsNew = userCheckCache.get(walletAddress)
    if (cachedIsNew !== undefined) {
      setIsNewUser(cachedIsNew)
      setShowOnboarding(cachedIsNew)
      return
    }

    setIsCheckingUser(true)
    try {
      console.log('Checking user with wallet:', walletAddress)
      const response = await fetch(`https://fightscript.onrender.com/api/users/${walletAddress}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      // If we get here, the user exists
      userCheckCache.set(walletAddress, false)
      setIsNewUser(false)
      setShowOnboarding(false)
    } catch (error) {
      console.error('Error checking user:', error)
      // If the error is a 404, the user doesn't exist
      if (error instanceof Error && error.message.includes('not found')) {
        console.log('New user detected, showing onboarding modal')
        userCheckCache.set(walletAddress, true)
        setIsNewUser(true)
        setShowOnboarding(true)
      } else {
        toast.error("Failed to check user status")
      }
    } finally {
      setIsCheckingUser(false)
    }
  }, [publicKey, isCheckingUser])

  useEffect(() => {
    if (publicKey) {
      checkUser()
    }
  }, [publicKey, checkUser])

  return (
    <div className="relative min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <section className="py-20 bg-background/60 backdrop-blur-sm">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Active Competitions</h2>
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={<LoadingState />}>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Chess AI Competition</CardTitle>
                        <CardDescription>Compete with your AI chess agent against others</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Build and train your AI agent to play chess. Compete against other agents and climb the leaderboard.
                        </p>
                        <Link href="/competitions/chess">
                          <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                            Participate Now
                          </button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </Suspense>
              </div>
            </div>
          </section>
          <CTA />
        </main>
        <Footer />
      </div>

      {isNewUser && (
        <UserOnboardingModal 
          isOpen={showOnboarding} 
          onClose={() => {
            setShowOnboarding(false)
            setIsNewUser(false)
            // Update cache when user completes onboarding
            if (publicKey) {
              userCheckCache.set(publicKey.toString(), false)
            }
          }} 
        />
      )}
    </div>
  )
}

