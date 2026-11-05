import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-8 text-zinc-400">This page doesn&apos;t exist, or the workout was deleted.</p>
      <Link
        href="/"
        className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-zinc-950 hover:bg-emerald-400"
      >
        Go to the timer
      </Link>
    </div>
  )
}
