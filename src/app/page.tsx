import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/home/Hero"
import { AboutSection } from "@/components/home/AboutSection"
import { Services } from "@/components/home/Services"
import { Portfolio } from "@/components/home/Portfolio"
import { ProcessSection } from "@/components/home/ProcessSection"
import { SustainabilitySection } from "@/components/home/SustainabilitySection"
import { ContactSection } from "@/components/home/ContactSection"
import { ChatWidget } from "@/components/home/ChatWidget"
import { AnimatedWaves } from "@/components/home/AnimatedWaves"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display relative">
      <AnimatedWaves />
      <Header />
      <Hero />
      <AboutSection />
      <Services />
      <Portfolio />
      <ProcessSection />
      <SustainabilitySection />
      <ContactSection />
      <ChatWidget />
      <Footer />
    </main>
  )
}
