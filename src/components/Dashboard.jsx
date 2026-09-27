import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import HabitForm from './HabitForm'
import HabitList from './HabitList'

// Loads the user's habits and handles create / update / delete against Supabase.
// Row level security ensures only the logged-in user's habits are returned or changed.
export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // READ: load habits once when the dashboard opens
  useEffect(() => {
    let ignore = false
    supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (ignore) return
        if (error) setError(error.message)
        else setHabits(data)
        setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  // CREATE
  async function createHabit(fields) {
    setError('')
    const { data, error } = await supabase.from('habits').insert(fields).select().single()
    if (error) {
      setError(error.message)
      return false
    }
    setHabits((prev) => [...prev, data])
    return true
  }

  // UPDATE
  async function updateHabit(id, fields) {
    setError('')
    const { data, error } = await supabase.from('habits').update(fields).eq('id', id).select().single()
    if (error) {
      setError(error.message)
      return false
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)))
    return true
  }

  // DELETE
  async function deleteHabit(id) {
    setError('')
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <>
      <section className="card">
        <h2>New habit</h2>
        <HabitForm onSubmit={createHabit} />
      </section>

      {error && <p className="error banner">{error}</p>}

      <section>
        <h2 className="section-title">Your habits</h2>
        {loading ? <p className="muted">Loading habits…</p> : (
          <HabitList habits={habits} onUpdate={updateHabit} onDelete={deleteHabit} />
        )}
      </section>
    </>
  )
}
