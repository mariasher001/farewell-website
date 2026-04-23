import Hero from '@/components/Hero'
import MessageBoard from '@/components/MessageBoard'
import ManagerMessage from '@/components/ManagerMessage'
import TeamMessage from '@/components/TeamMessage'
import Highlights from '@/components/Highlights'
import Closing from '@/components/Closing'
import Footer from '@/components/Footer'
import ConfettiBlast from '@/components/ConfettiBlast'

export default function Home() {
  return (
    <main>
      <ConfettiBlast />
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
