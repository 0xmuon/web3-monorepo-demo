'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StakingPage() {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to stake tokens');
      }

      // Refresh the page to show updated balance
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Staking</h1>
        
        {!publicKey ? (
          <p className="text-center">Please connect your wallet to stake tokens</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Stake Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStake} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Stake</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    min="0"
                    step="0.000000001"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" disabled={loading || !publicKey || !amount}>
                  {loading ? 'Staking...' : 'Stake Tokens'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 