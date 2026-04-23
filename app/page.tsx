import Hero from '@/components/Hero'
import MessageBoard from '@/components/MessageBoard'
import TeamMessage from '@/components/TeamMessage'
import Highlights from '@/components/Highlights'
import Closing from '@/components/Closing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <MessageBoard />
      <TeamMessage />
      <Highlights />
      <Closing />
      <Footer />
    </main>
  )
}
