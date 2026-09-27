import { useState } from 'react'
import HabitForm from './HabitForm'

// Shows the user's habits with edit and delete controls
export default function HabitList({ habits, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)

  if (habits.length === 0) {
    return <p className="muted empty">No habits yet. Add your first one above! 🌱</p>
  }

  return (
    <ul className="habit-list">
      {habits.map((habit) => (
        <li key={habit.id} className="habit card" style={{ borderLeftColor: habit.color }}>
          {editingId === habit.id ? (
            <HabitForm
              initial={habit}
              submitLabel="Save"
              onCancel={() => setEditingId(null)}
              onSubmit={async (changes) => {
                const ok = await onUpdate(habit.id, changes)
                if (ok) setEditingId(null)
                return ok
              }}
            />
          ) : (
            <div className="habit-row">
              <div className="habit-info">
                <h3>{habit.name}</h3>
                {habit.description && <p className="muted">{habit.description}</p>}
              </div>
              <div className="actions">
                <button onClick={() => setEditingId(habit.id)}>Edit</button>
                <button
                  className="danger"
                  onClick={() => {
                    if (confirm(`Delete "${habit.name}"? This also removes its history.`)) onDelete(habit.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
