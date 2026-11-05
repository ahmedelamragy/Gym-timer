'use client' // Error boundaries must be Client Components

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-zinc-400">Please try again. If it keeps happening, reload the page.</p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-zinc-950 hover:bg-emerald-400"
        >
          Try again
        </button>
        <Link href="/" className="rounded-2xl border border-zinc-700 px-6 py-3 hover:bg-zinc-800">
          Home
        </Link>
      </div>
    </div>
  )
}
