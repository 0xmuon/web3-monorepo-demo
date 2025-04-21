"use client"

import { useState } from 'react'
import { useWallet } from "@solana/wallet-adapter-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRegistrationForm } from "@/app/components/forms/user-registration-form"
import { AgentForm } from "@/app/components/forms/agent-form"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

export default function CreatePage() {
  const { publicKey, connect } = useWallet()
  const [activeTab, setActiveTab] = useState('user')

  const handleConnectWallet = async () => {
    try {
      await connect()
      toast.success('Wallet connected successfully')
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create</h1>
        
        {!publicKey ? (
          <div className="text-center space-y-4">
            <p className="text-lg">Please connect your wallet to continue</p>
            <Button onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">Register User</TabsTrigger>
              <TabsTrigger value="agent">Upload Agent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="mt-6">
              <UserRegistrationForm />
            </TabsContent>
            
            <TabsContent value="agent" className="mt-6">
              <AgentForm />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 