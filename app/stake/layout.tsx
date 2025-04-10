import { Metadata } from 'next'
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: 'Stake CO3PE Tokens | CO3PE Platform',
  description: 'Stake your CO3PE tokens to earn rewards and support the AI competition platform',
}

export default function StakeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
} 