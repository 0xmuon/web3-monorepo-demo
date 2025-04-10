import Link from "next/link"
import { Button } from "@/components/ui/button"
import CompetitionsNavbar from "@/components/competitions-navbar"
import Footer from "@/components/footer"

const competitions = [
  {
    name: "Chess AI Battle",
    description: "Pit your chess AI against others in intense matches.",
    arenaLink: "/competitions/chess",
  },
  {
    name: "Strategy Game Challenge",
    description: "Test your AI's strategic prowess in a complex game environment.",
    arenaLink: "#",
  },
  {
    name: "Natural Language Processing Contest",
    description: "Compete in various NLP tasks to showcase your AI's language understanding.",
    arenaLink: "#",
  },
]

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <CompetitionsNavbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Active Competitions</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <div key={competition.name} className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{competition.name}</h2>
              <p className="text-muted-foreground mb-6">{competition.description}</p>
              <Button asChild>
                <Link href={competition.arenaLink}>Enter Arena</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

