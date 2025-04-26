'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Commitment, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID, AccountInfo as TokenAccountInfo, MintInfo } from '@solana/spl-token'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, TrendingUp, Clock, Coins } from 'lucide-react'
import { toast } from 'react-hot-toast'

const MINT_ADDRESS = 'mntLuRtjrYJACzkgFksuUzzbm9wvoJzz7vyjVBZ8E6p'
const RPC_ENDPOINT = 'https://api.devnet.solana.com'
const MAX_STAKE_PERCENTAGE = 0.02 // 0.02% of market cap
const TOKEN_SWAP_PROGRAM_ID = new PublicKey('SwapsVeCiPHMUAtzQWZw7RjsKjgCjhwU55QGu4U1Szw')
const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

// Add environment variables for fee addresses
const SWAP_PROGRAM_OWNER_FEE_ADDRESS = process.env.NEXT_PUBLIC_SWAP_PROGRAM_OWNER_FEE_ADDRESS
  ? new PublicKey(process.env.NEXT_PUBLIC_SWAP_PROGRAM_OWNER_FEE_ADDRESS)
  : undefined
const SWAP_HOST_FEE_ADDRESS = process.env.NEXT_PUBLIC_SWAP_HOST_FEE_ADDRESS
  ? new PublicKey(process.env.NEXT_PUBLIC_SWAP_HOST_FEE_ADDRESS)
  : undefined

// Add token metadata interface
interface TokenMetadata {
  decimals: number;
  supply: string;
  isInitialized: boolean;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  name: string;
  symbol: string;
}

interface TokenExtension {
  type: string;
  pointer: PublicKey;
}

interface ExtendedMintInfo extends MintInfo {
  extensions?: TokenExtension[];
}

// Add token swap interface
interface TokenSwap {
  tokenA: PublicKey;
  tokenB: PublicKey;
  fee: number;
  curveType: number;
  programOwnerFeeAddress?: PublicKey;
  hostFeeAddress?: PublicKey;
  poolTokenMint: PublicKey;
  poolTokenAccount: PublicKey;
  tokenAAccount: PublicKey;
  tokenBAccount: PublicKey;
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
  const [maxStakeAmount, setMaxStakeAmount] = useState<number>(0)
  const [isBuying, setIsBuying] = useState<boolean>(false)
  const [solBalance, setSolBalance] = useState<number>(0)
  const [pricePerToken, setPricePerToken] = useState<number>(0.1) // 0.1 SOL per CO3PE token
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [swapAmount, setSwapAmount] = useState<number>(0)
  const [swapDirection, setSwapDirection] = useState<'buy' | 'sell'>('buy')
  const [tokenSwap, setTokenSwap] = useState<TokenSwap | null>(null)
  
  const isWalletConnected = !!publicKey

  // Add function to check user's SOL balance
  const checkSolBalance = useCallback(async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      const balance = await connection.getBalance(publicKey)
      setSolBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error checking SOL balance:', error)
      setError('Failed to check SOL balance')
    }
  }, [publicKey])

  // Add function to check user's token balance
  const checkUserBalance = useCallback(async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      const token = new Token(
        connection,
        new PublicKey(MINT_ADDRESS),
        SPL_TOKEN_PROGRAM_ID,
        {
          publicKey,
          secretKey: new Uint8Array(64) // This is a dummy signer since we're only reading
        }
      )

      try {
        const tokenAccount = await token.getOrCreateAssociatedAccountInfo(publicKey)
        const balance = Number(tokenAccount.amount) / Math.pow(10, tokenMetadata?.decimals || 9)
        setUserBalance(balance)
      } catch (err) {
        // If account doesn't exist, balance is 0
        setUserBalance(0)
      }
    } catch (error) {
      console.error('Error checking balance:', error)
      setError('Failed to check token balance')
    }
  }, [publicKey, tokenMetadata?.decimals])

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

      const token = new Token(
        connection,
        new PublicKey(MINT_ADDRESS),
        SPL_TOKEN_PROGRAM_ID,
        {
          publicKey,
          secretKey: new Uint8Array(64) // This is a dummy signer since we're only creating instructions
        }
      )

      // Get or create token account
      const tokenAccount = await token.getOrCreateAssociatedAccountInfo(publicKey)

      // Create transfer instruction for SOL
      const transferSolInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(MINT_ADDRESS), // This should be your treasury wallet
        lamports: totalSolCost * LAMPORTS_PER_SOL
      })

      // Create transfer instruction for tokens
      const transferTokensInstruction = Token.createTransferInstruction(
        SPL_TOKEN_PROGRAM_ID,
        new PublicKey(MINT_ADDRESS),
        tokenAccount.address,
        publicKey,
        [],
        amount * Math.pow(10, tokenMetadata?.decimals || 9)
      )

      // Create and sign transaction
      const transaction = new Transaction()
        .add(transferSolInstruction)
        .add(transferTokensInstruction)
      
      const signedTx = await signTransaction(transaction)
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature)

      toast.success(`Successfully bought ${amount} FST tokens for ${totalSolCost} SOL`)
      await checkUserBalance()
      await checkSolBalance()
    } catch (error) {
      console.error('Error buying tokens:', error)
      setError(error instanceof Error ? error.message : 'Failed to buy tokens. Please try again.')
    } finally {
      setIsBuying(false)
    }
  }

  // Add function to initialize token swap
  const initializeTokenSwap = async () => {
    if (!publicKey) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      
      // Create token swap state
      const swap: TokenSwap = {
        tokenA: new PublicKey(MINT_ADDRESS), // FST token
        tokenB: SOL_MINT, // SOL token
        fee: 0.003, // 0.3% fee
        curveType: 0, // Constant product curve
        programOwnerFeeAddress: SWAP_PROGRAM_OWNER_FEE_ADDRESS,
        hostFeeAddress: SWAP_HOST_FEE_ADDRESS,
        poolTokenMint: new PublicKey('pool_token_mint_address'), // Replace with actual pool token mint
        poolTokenAccount: new PublicKey('pool_token_account'), // Replace with actual pool token account
        tokenAAccount: new PublicKey('token_a_account'), // Replace with actual token A account
        tokenBAccount: new PublicKey('token_b_account') // Replace with actual token B account
      }

      setTokenSwap(swap)
    } catch (error) {
      console.error('Error initializing token swap:', error)
      setError('Failed to initialize token swap')
    }
  }

  // Add function to handle token swap
  const handleTokenSwap = async () => {
    if (!publicKey || !signTransaction || !tokenSwap) return

    try {
      setIsSwapping(true)
      setError(null)

      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      
      // Create swap instruction
      const swapInstruction = {
        programId: TOKEN_SWAP_PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true }, // User
          { pubkey: tokenSwap.tokenAAccount, isSigner: false, isWritable: true }, // Token A account
          { pubkey: tokenSwap.tokenBAccount, isSigner: false, isWritable: true }, // Token B account
          { pubkey: tokenSwap.poolTokenMint, isSigner: false, isWritable: true }, // Pool token mint
          { pubkey: tokenSwap.poolTokenAccount, isSigner: false, isWritable: true }, // Pool token account
          { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // Token program
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System program
        ],
        data: Buffer.from([
          swapDirection === 'buy' ? 1 : 2, // 1 for buy, 2 for sell
          ...new Uint8Array(new BigUint64Array([BigInt(swapAmount)]).buffer)
        ])
      }

      // Add fee addresses if they exist
      if (tokenSwap.programOwnerFeeAddress) {
        swapInstruction.keys.push({
          pubkey: tokenSwap.programOwnerFeeAddress,
          isSigner: false,
          isWritable: true
        })
      }

      if (tokenSwap.hostFeeAddress) {
        swapInstruction.keys.push({
          pubkey: tokenSwap.hostFeeAddress,
          isSigner: false,
          isWritable: true
        })
      }

      // Create and sign transaction
      const transaction = new Transaction().add(swapInstruction)
      const signedTx = await signTransaction(transaction)
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature)

      toast.success(`Successfully ${swapDirection === 'buy' ? 'bought' : 'sold'} ${swapAmount} FST tokens`)
      await checkUserBalance()
    } catch (error) {
      console.error('Error swapping tokens:', error)
      setError(error instanceof Error ? error.message : 'Failed to swap tokens. Please try again.')
    } finally {
      setIsSwapping(false)
    }
  }

  // Add function to get pool information
  const getPoolInfo = async () => {
    if (!publicKey || !tokenSwap) return

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      
      // Get pool token account info
      const poolTokenAccount = await connection.getAccountInfo(tokenSwap.poolTokenAccount)
      if (!poolTokenAccount) {
        throw new Error('Pool token account not found')
      }

      // Get token A account info
      const tokenAAccount = await connection.getAccountInfo(tokenSwap.tokenAAccount)
      if (!tokenAAccount) {
        throw new Error('Token A account not found')
      }

      // Get token B account info
      const tokenBAccount = await connection.getAccountInfo(tokenSwap.tokenBAccount)
      if (!tokenBAccount) {
        throw new Error('Token B account not found')
      }

      // Calculate pool liquidity
      const tokenABalance = Number(tokenAAccount.data.readBigUInt64LE(64)) / Math.pow(10, 9)
      const tokenBBalance = Number(tokenBAccount.data.readBigUInt64LE(64)) / Math.pow(10, 9)

      return {
        tokenABalance,
        tokenBBalance,
        totalLiquidity: tokenABalance * tokenBBalance
      }
    } catch (error) {
      console.error('Error getting pool info:', error)
      setError('Failed to get pool information')
      return null
    }
  }

  // Add function to calculate swap price
  const calculateSwapPrice = (amount: number, poolInfo: { tokenABalance: number; tokenBBalance: number }) => {
    const { tokenABalance, tokenBBalance } = poolInfo
    const k = tokenABalance * tokenBBalance
    const newTokenABalance = swapDirection === 'buy' ? tokenABalance + amount : tokenABalance - amount
    const newTokenBBalance = k / newTokenABalance
    return Math.abs(newTokenBBalance - tokenBBalance)
  }

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (!MINT_ADDRESS) {
          throw new Error('Mint address is not configured')
        }
        console.log('Using mint address:', MINT_ADDRESS)
        
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

        // Get mint account info
        const mintAccount = await connection.getAccountInfo(new PublicKey(MINT_ADDRESS))
        if (!mintAccount) {
          throw new Error('Mint account not found')
        }

        // Parse mint data manually
        const mintData = mintAccount.data
        const mintInfo = {
          decimals: 9, // We know this from the token info
          supply: mintData.readBigUInt64LE(36).toString(), // Read supply from mint data
          isInitialized: true,
          freezeAuthority: new PublicKey('bosHM5afpZ9qiwfZBR5fmsgn2ajAoWkD9PNwLV8E7Zg'),
          mintAuthority: new PublicKey('bosHM5afpZ9qiwfZBR5fmsgn2ajAoWkD9PNwLV8E7Zg'),
          name: 'FightScript Token',
          symbol: 'FST'
        }

        const formattedSupply = (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toLocaleString()
        const maxStake = (Number(mintInfo.supply) * MAX_STAKE_PERCENTAGE) / 100
        setMaxStakeAmount(maxStake)

        const metadata: TokenMetadata = {
          decimals: mintInfo.decimals,
          supply: formattedSupply,
          isInitialized: mintInfo.isInitialized,
          freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
          mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
          name: mintInfo.name,
          symbol: mintInfo.symbol
        }

        console.log('Token metadata:', metadata)
        setTokenMetadata(metadata)
      } catch (error: any) {
        console.error('Error in fetchTokenMetadata:', error)
        setError(error.message || 'Failed to fetch token information. Please check the console for details.')
      } finally {
        setIsLoading(false)
      }
    }

    if (publicKey) {
      fetchTokenMetadata()
      checkUserBalance()
      checkSolBalance()
      initializeTokenSwap()
    }
  }, [publicKey, checkUserBalance, checkSolBalance, initializeTokenSwap])

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

    if (amount > maxStakeAmount) {
      setError(`Maximum staking amount is ${maxStakeAmount.toLocaleString()} FST (${MAX_STAKE_PERCENTAGE}% of total supply)`)
      return
    }
    
    try {
      setIsStaking(true)
      setError(null)
      
      // Here you would implement the actual staking logic
      // This would involve a transaction to the staking smart contract
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully staked ${amount} FST tokens for ${duration} days`)
      
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
      <h1 className="mb-8 text-4xl font-bold">FST Token Swap</h1>
      
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
                <CardTitle>{tokenMetadata.name}</CardTitle>
                <CardDescription>Your Balance: {userBalance} {tokenMetadata.symbol}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-medium">{tokenMetadata.supply} {tokenMetadata.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swap Fee</span>
                  <span className="font-medium">0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className="font-medium">{userBalance} {tokenMetadata.symbol}</span>
                </div>
                {SWAP_PROGRAM_OWNER_FEE_ADDRESS && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program Owner Fee Address</span>
                    <span className="font-mono text-sm break-all">{SWAP_PROGRAM_OWNER_FEE_ADDRESS.toBase58()}</span>
                  </div>
                )}
                {SWAP_HOST_FEE_ADDRESS && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host Fee Address</span>
                    <span className="font-mono text-sm break-all">{SWAP_HOST_FEE_ADDRESS.toBase58()}</span>
                  </div>
                )}
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
            <CardTitle>Swap FST Tokens</CardTitle>
            <CardDescription>
              Swap FST tokens with SOL. Current fee: 0.3%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Swap Direction</Label>
              <div className="flex gap-4">
                <Button
                  variant={swapDirection === 'buy' ? 'default' : 'outline'}
                  onClick={() => setSwapDirection('buy')}
                >
                  Buy FST
                </Button>
                <Button
                  variant={swapDirection === 'sell' ? 'default' : 'outline'}
                  onClick={() => setSwapDirection('sell')}
                >
                  Sell FST
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to {swapDirection === 'buy' ? 'Buy' : 'Sell'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.000000001"
                  value={swapAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      setSwapAmount(value)
                    }
                  }}
                  disabled={!isWalletConnected || isSwapping}
                  className="flex-1"
                />
                <span className="font-medium">FST</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleTokenSwap} 
              disabled={!isWalletConnected || isSwapping || swapAmount <= 0}
            >
              {isSwapping ? 'Processing...' : `Swap ${swapDirection === 'buy' ? 'Buy' : 'Sell'} Tokens`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Swap Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Direction</span>
                <span className="font-medium">{swapDirection === 'buy' ? 'Buy FST' : 'Sell FST'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{swapAmount} FST</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">0.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Balance</span>
                <span className="font-medium">{userBalance} FST</span>
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
                  <span>Instant token swaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Low fees (0.3%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <span>Liquidity provided by the community</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
        <h2 className="mb-4 text-2xl font-bold">About FST Token Swap</h2>
        <p className="mb-4">
          The FST token swap allows you to trade FST tokens with SOL instantly. The swap uses a constant product curve to determine prices, ensuring fair and efficient trading.
        </p>
        <p>
          The swap fee is 0.3% of the transaction amount, which is used to reward liquidity providers and maintain the pool. The more liquidity in the pool, the better the trading experience for everyone.
        </p>
      </div>
    </div>
  )
} 