'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, TrendingUp, Clock, Coins } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function StakePage() {
  const { publicKey } = useWallet()
  const [amount, setAmount] = useState<number>(100)
  const [duration, setDuration] = useState<number>(30) // days
  const [isStaking, setIsStaking] = useState<boolean>(false)
  
  const isWalletConnected = !!publicKey

  // Calculate estimated rewards based on amount and duration
  const calculateRewards = () => {
    // Example calculation: 10% APY prorated for the staking duration
    const apy = 0.10
    const durationInYears = duration / 365
    return amount * (1 + apy * durationInYears) - amount
  }

  const estimatedRewards = calculateRewards()

  const handleStake = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setIsStaking(true)
      
      // Here you would implement the actual staking logic
      // This would involve a transaction to the staking smart contract
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully staked ${amount} CO3PE tokens for ${duration} days`)
      
      // Reset or redirect as needed
      // setAmount(0)
    } catch (error: any) {
      console.error('Staking error:', error)
      toast.error(`Failed to stake: ${error.message || 'Unknown error'}`)
    } finally {
      setIsStaking(false)
    }
  }

  return (
    <div className="container max-w-4xl py-12">
        
      <h1 className="mb-8 text-4xl font-bold">Stake CO3PE Tokens</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Stake Your Tokens</CardTitle>
            <CardDescription>
              Earn rewards by staking your CO3PE tokens. The longer you stake, the higher your potential returns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Staking Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-medium">CO3PE</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="duration">Staking Duration</Label>
                <span className="text-sm text-muted-foreground">{duration} days</span>
              </div>
              <Slider
                id="duration"
                defaultValue={[duration]}
                min={7}
                max={365}
                step={1}
                onValueChange={(value) => setDuration(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span>30 days</span>
                <span>90 days</span>
                <span>1 year</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleStake} 
              disabled={!isWalletConnected || isStaking || amount <= 0}
            >
              {isStaking ? 'Processing...' : 'Stake Tokens'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{amount} CO3PE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. Rewards</span>
                <span className="font-medium text-green-600">+{estimatedRewards.toFixed(2)} CO3PE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Return</span>
                <span className="font-bold">{(amount + estimatedRewards).toFixed(2)} CO3PE</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Earn passive income</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Higher rewards for longer durations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <span>Support the CO3PE ecosystem</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
        <h2 className="mb-4 text-2xl font-bold">About CO3PE Staking</h2>
        <p className="mb-4">
          By staking your CO3PE tokens, you're contributing to the growth and stability of the platform. 
          As our AI competition ecosystem expands, stakers will benefit from the platform's success.
        </p>
        <p>
          We offer competitive rewards to our early supporters. The longer you stake, the higher your 
          potential ROI. Your staked tokens help fund competition prizes, platform development, and community initiatives.
        </p>
      </div>
    </div>
  )
} 