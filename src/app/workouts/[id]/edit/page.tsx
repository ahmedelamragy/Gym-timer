import { notFound } from 'next/navigation'
import { WorkoutForm } from '@/components/WorkoutForm'
import { createClient } from '@/lib/supabase/server'
import type { WorkoutInput } from '@/lib/types'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('workouts').select('name, rounds, steps').eq('id', id).maybeSingle()
  if (!data) notFound()

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">تعديل التمرين</h1>
      <WorkoutForm initial={data as WorkoutInput} workoutId={id} />
    </>
  )
}
