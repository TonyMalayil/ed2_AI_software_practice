import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { today } from '../dates'
import HabitForm from './HabitForm'
import HabitList from './HabitList'

// Loads the user's habits and check-off logs, and handles all changes against Supabase.
// Row level security ensures only the logged-in user's rows are returned or changed.
export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({}) // { [habitId]: Set of 'YYYY-MM-DD' dates }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // READ: load habits and their logs once when the dashboard opens
  useEffect(() => {
    let ignore = false
    Promise.all([
      supabase.from('habits').select('*').order('created_at', { ascending: true }),
      supabase.from('habit_logs').select('habit_id, date'),
    ]).then(([habitsRes, logsRes]) => {
      if (ignore) return
      const err = habitsRes.error || logsRes.error
      if (err) setError(err.message)
      else {
        setHabits(habitsRes.data)
        const grouped = {}
        for (const { habit_id, date } of logsRes.data) {
          ;(grouped[habit_id] ??= new Set()).add(date)
        }
        setLogs(grouped)
      }
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

  // DELETE (the database also deletes the habit's logs via ON DELETE CASCADE)
  async function deleteHabit(id) {
    setError('')
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setLogs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // CHECK-OFF: mark a habit done (insert a log) or undo it (delete the log) for a given day
  async function toggleDone(habitId, date = today()) {
    setError('')
    const isDone = logs[habitId]?.has(date)

    const { error } = isDone
      ? await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', date)
      : await supabase.from('habit_logs').insert({ habit_id: habitId, date })

    if (error) {
      setError(error.message)
      return
    }
    setLogs((prev) => {
      const dates = new Set(prev[habitId])
      if (isDone) dates.delete(date)
      else dates.add(date)
      return { ...prev, [habitId]: dates }
    })
  }

  const doneToday = habits.filter((h) => logs[h.id]?.has(today())).length

  return (
    <>
      <section className="card">
        <h2>New habit</h2>
        <HabitForm onSubmit={createHabit} />
      </section>

      {error && <p className="error banner">{error}</p>}

      <section>
        <div className="section-header">
          <h2>Your habits</h2>
          {habits.length > 0 && (
            <span className="muted">{doneToday} of {habits.length} done today</span>
          )}
        </div>
        {loading ? <p className="muted">Loading habits…</p> : (
          <HabitList
            habits={habits}
            logs={logs}
            onUpdate={updateHabit}
            onDelete={deleteHabit}
            onToggle={toggleDone}
          />
        )}
      </section>
    </>
  )
}
