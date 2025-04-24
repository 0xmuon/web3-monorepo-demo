'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Commitment, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { 
  getMint, 
  getAccount, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID,
  Mint,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  Account
} from '@solana/spl-token'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, TrendingUp, Clock, Coins } from 'lucide-react'
import { toast } from 'react-hot-toast'

const MINT_ADDRESS = 'mntLuRtjrYJACzkgFksuUzzbm9wvoJzz7vyjVBZ8E6p'
const RPC_ENDPOINT = 'https://api.devnet.solana.com'
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

// Add token metadata interface
interface TokenMetadata {
  decimals: number;
  supply: string;
  isInitialized: boolean;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  name?: string;
  symbol?: string;
  image?: string;
}

export default function StakePage() {
  const { publicKey, signTransaction } = useWallet()
  const [amount, setAmount] = useState<number>(100)
  const [duration, setDuration] = useState<number>(30) // days
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [isBuying, setIsBuying] = useState<boolean>(false)
  const [solBalance, setSolBalance] = useState<number>(0)
  const [pricePerToken, setPricePerToken] = useState<number>(0.1) // 0.1 SOL per CO3PE token
  
  const isWalletConnected = !!publicKey

  // Add function to check user's devnet token balance
  const checkUserBalance = async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      const userATA = await getAssociatedTokenAddress(
        new PublicKey(MINT_ADDRESS),
        publicKey
      )

      try {
        const account = await getAccount(connection, userATA)
        const balance = Number(account.amount) / Math.pow(10, (account as any).decimals)
        setUserBalance(balance)
      } catch (err) {
        // If account doesn't exist, balance is 0
        setUserBalance(0)
      }
    } catch (error) {
      console.error('Error checking balance:', error)
      setError('Failed to check token balance')
    }
  }

  // Add function to check user's SOL balance
  const checkSolBalance = async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      const balance = await connection.getBalance(publicKey)
      setSolBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error checking SOL balance:', error)
      setError('Failed to check SOL balance')
    }
  }

  // Add function to buy CO3PE tokens with SOL
  const handleBuyTokens = async () => {
    if (!publicKey || !signTransaction) return

    try {
      setIsBuying(true)
      setError(null)

      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      
      // Calculate total SOL cost
      const totalSolCost = amount * pricePerToken
      
      // Check if user has enough SOL
      if (solBalance < totalSolCost) {
        throw new Error('Insufficient SOL balance')
      }

      // Get or create user's token account
      const userATA = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        new PublicKey(MINT_ADDRESS),
        publicKey
      )

      // Create transfer instruction for SOL
      const transferSolInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(MINT_ADDRESS), // This should be your treasury wallet
        lamports: totalSolCost * LAMPORTS_PER_SOL
      })

      // Create mint instruction for CO3PE tokens
      const mintInstruction = createTransferInstruction(
        new PublicKey(MINT_ADDRESS),
        userATA.address,
        publicKey,
        amount * Math.pow(10, tokenMetadata?.decimals || 9)
      )

      // Create and sign transaction
      const transaction = new Transaction()
        .add(transferSolInstruction)
        .add(mintInstruction)
      
      const signedTx = await signTransaction(transaction)
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature)

      toast.success(`Successfully bought ${amount} CO3PE tokens for ${totalSolCost} SOL`)
      await checkUserBalance()
      await checkSolBalance()
    } catch (error) {
      console.error('Error buying tokens:', error)
      setError(error instanceof Error ? error.message : 'Failed to buy tokens. Please try again.')
    } finally {
      setIsBuying(false)
    }
  }

  useEffect(() => {
    if (publicKey) {
      checkUserBalance()
      checkSolBalance()
    }
  }, [publicKey])

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Validate mint address
        if (!MINT_ADDRESS) {
          throw new Error('Mint address is not configured')
        }
        console.log('Using mint address:', MINT_ADDRESS)
        
        // Create connection with error handling
        let connection: Connection
        try {
          console.log('Connecting to Solana devnet...')
          connection = new Connection(RPC_ENDPOINT, 'confirmed' as Commitment)
          const version = await connection.getVersion()
          console.log('Connected to Solana devnet. Version:', version)
        } catch (err) {
          console.error('Failed to connect to Solana:', err)
          throw new Error('Failed to connect to Solana network. Please check your internet connection.')
        }
        
        // Create PublicKey with error handling
        let mintPublicKey: PublicKey
        try {
          mintPublicKey = new PublicKey(MINT_ADDRESS)
          console.log('PublicKey created successfully')
        } catch (err) {
          console.error('Invalid mint address:', err)
          throw new Error('Invalid mint address format')
        }
        
        // Get token metadata with error handling and timeout
        let mintInfo: Mint
        try {
          console.log('Fetching mint info...')
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 10000)
          )
          
          // Try to get mint info using Token-2022 program
          mintInfo = await Promise.race([
            getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID),
            timeoutPromise
          ]) as Mint
          console.log('Mint info received:', mintInfo)
        } catch (err) {
          console.error('Failed to fetch mint info:', err)
          if (err instanceof Error && err.message === 'Request timed out') {
            throw new Error('Request timed out. Please try again.')
          }
          throw new Error('Failed to fetch token information. The token might not exist on devnet.')
        }
        
        // Format the supply with proper decimals
        const formattedSupply = (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toLocaleString()
        console.log('Formatted supply:', formattedSupply)
        
        const metadata: TokenMetadata = {
          decimals: mintInfo.decimals,
          supply: formattedSupply,
          isInitialized: mintInfo.isInitialized,
          freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
          mintAuthority: mintInfo.mintAuthority?.toBase58() || null
        }
        console.log('Setting token metadata:', metadata)
        setTokenMetadata(metadata)
      } catch (error: any) {
        console.error('Error in fetchTokenMetadata:', error)
        setError(error.message || 'Failed to fetch token information. Please check the console for details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenMetadata()
  }, [])

  // Calculate estimated rewards based on amount and duration
  const calculateRewards = () => {
    // Example calculation: 10% APY prorated for the staking duration
    const apy = 0.10
    const durationInYears = duration / 365
    return amount * (1 + apy * durationInYears) - amount
  }

  const estimatedRewards = calculateRewards()

  const handleStake = async () => {
    if (!publicKey) return
    
    // Add input validation
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    
    if (duration < 1) {
      setError('Duration must be at least 1 day')
      return
    }
    
    try {
      setIsStaking(true)
      setError(null)
      
      // Here you would implement the actual staking logic
      // This would involve a transaction to the staking smart contract
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully staked ${amount} CO3PE tokens for ${duration} days`)
      
      // Reset or redirect as needed
      // setAmount(0)
    } catch (error: any) {
      console.error('Error staking tokens:', error)
      setError('Failed to stake tokens. Please try again.')
    } finally {
      setIsStaking(false)
    }
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="mb-8 text-4xl font-bold">Buy CO3PE Tokens</h1>
      
      {isLoading && (
        <div className="mb-8 text-center">
          <p>Loading token information...</p>
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}
      
      {tokenMetadata && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div>
                <CardTitle>CO3PE Token</CardTitle>
                <CardDescription>Your Balance: {userBalance} CO3PE</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-medium">{tokenMetadata.supply} CO3PE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Token</span>
                  <span className="font-medium">{pricePerToken} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your SOL Balance</span>
                  <span className="font-medium">{solBalance} SOL</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint Address</span>
                  <span className="font-mono text-sm break-all">{MINT_ADDRESS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint Authority</span>
                  <span className="font-mono text-sm break-all">{tokenMetadata.mintAuthority || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Freeze Authority</span>
                  <span className="font-mono text-sm break-all">{tokenMetadata.freezeAuthority || 'None'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Buy CO3PE Tokens</CardTitle>
            <CardDescription>
              Purchase CO3PE tokens using SOL. Current price: {pricePerToken} SOL per token.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Buy</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.000000001"
                  value={amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      setAmount(value)
                    }
                  }}
                  disabled={!isWalletConnected || isBuying}
                  className="flex-1"
                />
                <span className="font-medium">CO3PE</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{(amount * pricePerToken).toFixed(4)} SOL</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleBuyTokens} 
              disabled={!isWalletConnected || isBuying || amount <= 0 || solBalance < (amount * pricePerToken)}
            >
              {isBuying ? 'Processing...' : 'Buy Tokens'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{amount} CO3PE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price per Token</span>
                <span className="font-medium">{pricePerToken} SOL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-medium">{(amount * pricePerToken).toFixed(4)} SOL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your SOL Balance</span>
                <span className="font-medium">{solBalance} SOL</span>
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
        <h2 className="mb-4 text-2xl font-bold">About CO3PE Tokens</h2>
        <p className="mb-4">
          CO3PE tokens are the native currency of our platform. By purchasing these tokens, 
          you're contributing to the growth and stability of the platform.
        </p>
        <p>
          We offer competitive rewards to our early supporters. The longer you hold, the higher your 
          potential ROI. Your tokens help fund competition prizes, platform development, and community initiatives.
        </p>
      </div>
    </div>
  )
} 