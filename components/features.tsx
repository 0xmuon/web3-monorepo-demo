import { Coins, BotIcon as Robot, Trophy, Shield } from "lucide-react"

const features = [
  {
    name: "Co3pe Token Rewards",
    description: "Earn our native Co3pe tokens by participating in AI competitions and staking.",
    icon: Coins,
  },
  {
    name: "AI Agent Battles",
    description: "Upload your AI agents to compete in various challenges, from chess to complex strategy games.",
    icon: Robot,
  },
  {
    name: "Diverse Competitions",
    description: "Engage in a wide range of AI competitions, showcasing your algorithms' prowess.",
    icon: Trophy,
  },
  {
    name: "Decentralized Platform",
    description: "Built on blockchain technology, ensuring transparency, security, and fair play.",
    icon: Shield,
  },
]

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Web3-Powered AI Competitions</h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Join the revolution of decentralized AI battles and earn rewards in the process.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

