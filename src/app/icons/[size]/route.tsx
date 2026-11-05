import { notFound } from 'next/navigation'
import { renderAppIcon } from '@/lib/app-icon'

const SIZES = ['192', '512'] as const

export const dynamicParams = false

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }))
}

/** PNG icons referenced by the web app manifest (Android home screen, install prompt). */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  if (!(SIZES as readonly string[]).includes(size)) notFound()
  return renderAppIcon(Number(size))
}
