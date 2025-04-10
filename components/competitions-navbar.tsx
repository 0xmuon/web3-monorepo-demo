import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Trophy } from "lucide-react"
import { WalletButton } from "./wallet-button"

export default function CompetitionsNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Co3pe</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/competitions" className="transition-colors hover:text-primary">
            Competitions
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            About Us
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-primary flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Link href="https://0xmuon.github.io/co3pe-docs/" target="_blank" rel="noopener noreferrer" className="text-black">
            Docs
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}

