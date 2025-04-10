"use client"

import { useState } from 'react'
import { useWallet } from "@solana/wallet-adapter-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRegistrationForm } from "@/app/components/forms/user-registration-form"
import { AgentForm } from "@/app/components/forms/agent-form"

export default function CreatePage() {
  const { publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState('user')

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create</h1>
        
        {!publicKey ? (
          <p className="text-center">Please connect your wallet to continue</p>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">Register User</TabsTrigger>
              <TabsTrigger value="agent">Upload Agent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <UserRegistrationForm />
            </TabsContent>
            
            <TabsContent value="agent">
              <AgentForm />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 