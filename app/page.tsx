import Hero from '@/components/Hero'
import ManagementBoard from '@/components/ManagementBoard'
import MessageBoard from '@/components/MessageBoard'
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
      <ManagementBoard />
      <MessageBoard />
      <TeamMessage />
      <Highlights />
      <Closing />
      <Footer />
    </main>
  )
}
