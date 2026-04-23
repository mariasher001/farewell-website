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

        <blockquote className="font-outfit text-lg md:text-xl text-slate-600 leading-relaxed italic space-y-6 text-left">
          <p>
            &ldquo;It&apos;s rare to work with someone who makes the team better just by being
            in the room. That&apos;s exactly what you did.
          </p>
          <p>
            You brought clarity to the chaos, patience to the pressure, and a kind of warmth
            that turned DB PERF into more than a team name. Every one of us learned something
            from you &mdash; whether we realized it at the time or not.
          </p>
          <p>
            The team you&apos;re joining is lucky, and they&apos;ll figure that out fast. We
            already know. Different team, same building &mdash; but we&apos;re still going to
            miss having you on this side.&rdquo;
          </p>
        </blockquote>

        <div className="mt-10 font-inter text-slate-400 text-sm">
          — With love and a little bit of tears,{' '}
          <span className="font-semibold text-rose-400">The DB PERF Family</span>
        </div>
      </div>
    </section>
  )
}
