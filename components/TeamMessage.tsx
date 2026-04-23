import { Quote } from 'lucide-react'

export default function TeamMessage() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <Quote size={24} className="text-rose-400" />
          </div>
        </div>

        <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-10">
          From the team
        </h2>

        <blockquote className="font-outfit text-lg md:text-xl text-slate-600 leading-relaxed italic space-y-5">
          <p>
            &ldquo;Some people leave a job. You&apos;re leaving a hole in the heart of this team.
            From the very first day you walked into DB PERF, you changed the energy in the room.
          </p>
          <p>
            You turned debugging sessions into learning moments. You made Mondays feel like
            catching up with friends. You brought warmth to every standup, every incident,
            every late-night fix.
          </p>
          <p>This isn&apos;t goodbye. It&apos;s just — see you around, legend.&rdquo;</p>
        </blockquote>

        <div className="mt-10 font-inter text-slate-400 text-sm">
          — With love and a little bit of tears,{' '}
          <span className="font-semibold text-rose-400">The DB PERF Family</span>
        </div>
      </div>
    </section>
  )
}
