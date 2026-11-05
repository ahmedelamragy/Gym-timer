import { notFound } from 'next/navigation'
import { DamagedWorkout } from '@/components/DamagedWorkout'
import { WorkoutForm } from '@/components/WorkoutForm'
import { parseStoredWorkout } from '@/lib/schema'
import { createClient } from '@/lib/supabase/server'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('workouts').select('name, rounds, steps').eq('id', id).maybeSingle()
  if (!data) notFound()

  const workout = parseStoredWorkout(data)
  if (!workout) return <DamagedWorkout />

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Edit workout</h1>
      <WorkoutForm initial={workout} workoutId={id} />
    </>
  )
}
