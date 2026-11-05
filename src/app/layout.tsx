import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AuthButton } from '@/components/AuthButton'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Gym Timer',
  description: 'Interval timer with rounds and saved workouts',
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-dvh bg-zinc-950 text-zinc-100 antialiased`}>
        <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Gym Timer
          </Link>
          <AuthButton />
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-16">{children}</main>
      </body>
    </html>
  )
}
