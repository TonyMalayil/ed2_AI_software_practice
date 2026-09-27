import { useState } from 'react'
import { calcStreak, lastNDays, toDateString, today } from '../dates'
import HabitForm from './HabitForm'

const EMPTY = new Set()

// Shows the user's habits with check-off, streak, last-7-days history, edit and delete
export default function HabitList({ habits, logs, onUpdate, onDelete, onToggle }) {
  const [editingId, setEditingId] = useState(null)

  if (habits.length === 0) {
    return <p className="muted empty">No habits yet. Add your first one above! 🌱</p>
  }

  const week = lastNDays(7)

  return (
    <ul className="habit-list">
      {habits.map((habit) => {
        const done = logs[habit.id] ?? EMPTY
        const doneToday = done.has(today())
        const streak = calcStreak(done)

        return (
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
              <>
                <div className="habit-row">
                  <button
                    className={`check ${doneToday ? 'checked' : ''}`}
                    style={{ '--habit-color': habit.color }}
                    onClick={() => onToggle(habit.id)}
                    aria-pressed={doneToday}
                    aria-label={doneToday ? `Undo ${habit.name} for today` : `Mark ${habit.name} done today`}
                  >
                    {doneToday ? '✓' : ''}
                  </button>

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

                <div className="habit-footer">
                  <span className={`streak ${streak > 0 ? 'active' : ''}`}>
                    {streak > 0 ? `🔥 ${streak}-day streak` : 'No streak yet'}
                  </span>

                  <div className="week" aria-label="Last 7 days">
                    {week.map((day) => {
                      const date = toDateString(day)
                      const isDone = done.has(date)
                      return (
                        <button
                          key={date}
                          className={`day ${isDone ? 'done' : ''}`}
                          style={{ '--habit-color': habit.color }}
                          onClick={() => onToggle(habit.id, date)}
                          title={`${day.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}: ${isDone ? 'done' : 'not done'}`}
                          aria-pressed={isDone}
                        >
                          {day.toLocaleDateString(undefined, { weekday: 'narrow' })}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
