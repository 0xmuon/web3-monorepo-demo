import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Bot, Brain, Code, Coins, Globe, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div>
    <Navbar />
      <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Revolutionizing AI Through Web3
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Fight Script is pioneering the convergence of artificial intelligence and blockchain technology,
                creating a decentralized ecosystem for AI development and competition.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-accent/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                We&apos;re building a revolutionary platform where AI meets blockchain, enabling developers 
                to compete, collaborate, and innovate in a decentralized environment. Our mission is 
                to democratize AI development while ensuring transparency, fairness, and rewards for contributors.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Brain />}
                title="AI Competitions"
                description="Host and participate in diverse AI competitions, from chess to complex strategy games."
              />
              <FeatureCard 
                icon={<Coins />}
                title="Token Economics"
                description="Earn rewards through our token system for winning competitions and contributing to the ecosystem."
              />
              <FeatureCard 
                icon={<Shield />}
                title="Secure Platform"
                description="Built on blockchain technology ensuring transparent and tamper-proof competition results."
              />
              <FeatureCard 
                icon={<Code />}
                title="Open Development"
                description="Contribute to and benefit from our open-source development environment."
              />
              <FeatureCard 
                icon={<Bot />}
                title="AI Integration"
                description="Seamlessly integrate your AI models with our platform using our robust API."
              />
              <FeatureCard 
                icon={<Globe />}
                title="Global Community"
                description="Join a worldwide community of AI developers, researchers, and enthusiasts."
              />
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-16 bg-accent/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Vision</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                We envision a future where AI development is truly decentralized, where innovation is 
                driven by community collaboration, and where the benefits of AI advancement are 
                distributed fairly among contributors. Through Fight Script, we&apos;re making this vision a reality.
              </p>
            </div>
          </div>
        </section>

        {/* Team/Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Join the Revolution</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you&apos;re an AI developer, researcher, or enthusiast, there&apos;s a place for you in 
              the Fight Script ecosystem. Join us in shaping the future of AI.
            </p>
            <div className="flex justify-center gap-4">
              <a href="https://discord.gg/fightscript" target="_blank" rel="noopener noreferrer" 
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Join Our Discord
              </a>
              <a href="https://github.com/fightscript" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
                GitHub Repository
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
} 