import { HomeClient } from '@/components/HomeClient'

export default function HomePage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Build your workout</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Run the timer right away, no account needed. Sign in only if you want to save workouts.
      </p>
      <HomeClient />
    </>
  )
}
