'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { workoutSchema } from '@/lib/schema'
import { createClient } from '@/lib/supabase/server'

type Result = { error: string }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function validate(input: unknown) {
  const parsed = workoutSchema.safeParse(input)
  return parsed.success
    ? { data: parsed.data, error: null }
    : { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid workout' }
}

export async function createWorkout(input: unknown): Promise<Result> {
  const { data, error } = validate(input)
  if (!data) return { error }

  const { supabase, user } = await requireUser()
  if (!user) return { error: 'Please sign in first' }

  const { error: dbError } = await supabase.from('workouts').insert({ ...data, user_id: user.id })
  if (dbError) return { error: 'Could not save. Please try again.' }

  revalidatePath('/workouts')
  redirect('/workouts')
}

export async function updateWorkout(id: string, input: unknown): Promise<Result> {
  const { data, error } = validate(input)
  if (!data) return { error }

  const { supabase, user } = await requireUser()
  if (!user) return { error: 'Please sign in first' }

  // RLS limits this to the user's own row; zero rows back means not theirs or gone.
  const { data: rows, error: dbError } = await supabase
    .from('workouts')
    .update(data)
    .eq('id', id)
    .select('id')
  if (dbError) return { error: 'Could not save. Please try again.' }
  if (!rows?.length) return { error: 'Workout not found' }

  revalidatePath('/workouts')
  redirect('/workouts')
}

export async function deleteWorkout(id: string): Promise<Result | undefined> {
  const { supabase, user } = await requireUser()
  if (!user) return { error: 'Please sign in first' }

  // RLS limits this to the user's own row; zero rows back means not theirs or already gone.
  const { data: rows, error } = await supabase.from('workouts').delete().eq('id', id).select('id')
  if (error) return { error: 'Could not delete. Please try again.' }
  if (!rows?.length) return { error: 'Workout not found' }

  revalidatePath('/workouts')
}
