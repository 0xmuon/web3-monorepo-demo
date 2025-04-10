"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AgentForm() {
  const { publicKey } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('walletAddress', publicKey.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload agent')
      }

      // Refresh the page to show updated agent info
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Agent File</Label>
        <Input
          id="file"
          type="file"
          accept=".cpp"
          onChange={handleFileChange}
          required
        />
        <p className="text-sm text-gray-500">Upload your C++ agent file</p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={loading || !publicKey || !file}>
        {loading ? 'Uploading...' : 'Upload Agent'}
      </Button>
    </form>
  )
} 