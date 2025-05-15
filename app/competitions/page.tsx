import Link from "next/link"
import { Button } from "@/components/ui/button"
import CompetitionsNavbar from "@/components/competitions-navbar"
import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Brain, Castle, MessageSquare } from 'lucide-react';

const getIcon = (name: string) => {
  switch (name) {
    case 'Chess AI Battle':
      return <Castle className="w-12 h-12 text-[#E0E0FF] mr-6" />;
    case 'Strategy Game Challenge':
      return <Brain className="w-12 h-12 text-[#E0E0FF] mr-6" />;
    case 'Tic-Tac Toe Contest':
      return <MessageSquare className="w-12 h-12 text-[#E0E0FF] mr-6" />;
    default:
      return null;
  }
};

const competitions = [
  {
    name: "Chess AI Battle",
    description: "Pit your chess AI against others in intense matches.",
    arenaLink: "/competitions/chess",
    status: "Enter Arena"
  },
  {
    name: "Strategy Game Challenge",
    description: "Test your AI's strategic prowess in a complex game environment.",
    arenaLink: "#",
    status: "Coming Soon"
  },
  {
    name: "Tic-Tac Toe Contest",
    description: "Compete in various NLP tasks to showcase your AI's language understanding.",
    arenaLink: "#",
    status: "Coming Soon"
  }, {
    name: "Chess AI Battle",
    description: "Pit your chess AI against others in intense matches.",
    arenaLink: "/competitions/chess",
    status: "Enter Arena"
  },
  {
    name: "Strategy Game Challenge",
    description: "Test your AI's strategic prowess in a complex game environment.",
    arenaLink: "#",
    status: "Coming Soon"
  },
  {
    name: "Tic-Tac Toe Contest",
    description: "Compete in various NLP tasks to showcase your AI's language understanding.",
    arenaLink: "#",
    status: "Coming Soon"
  },
]

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">Competitions</h1>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-25">
            {competitions.map((competition) => (
              <div
                key={competition.name}
                className="bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-[#2A2B3C] border border-[#2E2F40] rounded-2xl shadow-lg p-6 border-2 border-solid border-cyan-700 flex flex-col transition duration-300"
              >
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-4 text-[#E0E0FF] flex items-center">
      {getIcon(competition.name)}
      {competition.name}
    </h2>
                  <p className="text-[#A0A0B2]">{competition.description}</p>
                </div>
                <div className="mt-6">
                  {competition.status === 'Coming Soon' ? (
                    <button
                      disabled
                      className="bg-[#2D2D3C] text-[#888CA6] cursor-not-allowed px-4 py-2 rounded-lg"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <Button asChild className="bg-[#1E1F2F] hover:bg-[#00B2DA] text-cyan-700 border-2 border-solid border-cyan-700 px-4 py-2 shadow-md shadow-cyan-500/50 rounded-lg">
                      <Link href={competition.arenaLink}>{competition.status}</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </main>
        <Footer />

      </div>

    </div>
  )
}

