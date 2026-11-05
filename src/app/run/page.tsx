import { notFound } from 'next/navigation'
import { RunClient } from '@/components/RunClient'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { WorkoutInput } from '@/lib/types'

export default async function RunPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams

  if (!id) return <RunClient initial={null} exitHref="/" />
  if (!isSupabaseConfigured()) notFound()

  // RLS returns nothing unless this workout belongs to the signed-in user.
  const supabase = await createClient()
  const { data } = await supabase.from('workouts').select('name, rounds, steps').eq('id', id).maybeSingle()
  if (!data) notFound()

  return <RunClient initial={data as WorkoutInput} exitHref="/workouts" />
}
