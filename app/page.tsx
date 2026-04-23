import Hero from '@/components/Hero'
import MessageBoard from '@/components/MessageBoard'
import ManagerMessage from '@/components/ManagerMessage'
import TeamMessage from '@/components/TeamMessage'
import Highlights from '@/components/Highlights'
import Closing from '@/components/Closing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <ManagerMessage />
      <MessageBoard />
      <TeamMessage />
      <Highlights />
      <Closing />
      <Footer />
    </main>
  )
}
