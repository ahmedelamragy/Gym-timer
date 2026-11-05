import { notFound, redirect } from 'next/navigation'
import { DamagedWorkout } from '@/components/DamagedWorkout'
import { RunClient } from '@/components/RunClient'
import { parseStoredWorkout } from '@/lib/schema'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export default async function RunPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams

  if (!id) return <RunClient initial={null} exitHref="/" />
  if (!isSupabaseConfigured()) notFound()

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  // A saved workout's link opened while signed out: sign in, then come back here.
  if (!auth?.claims) redirect(`/login?next=${encodeURIComponent(`/run?id=${id}`)}`)

  // RLS returns nothing unless this workout belongs to the signed-in user.
  const { data } = await supabase.from('workouts').select('name, rounds, steps').eq('id', id).maybeSingle()
  if (!data) notFound()

  const workout = parseStoredWorkout(data)
  if (!workout) return <DamagedWorkout />

  return <RunClient initial={workout} exitHref="/workouts" />
}
