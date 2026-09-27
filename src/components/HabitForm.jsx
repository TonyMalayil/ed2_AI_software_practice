import { useState } from 'react'
import { COLORS } from '../constants'

// Form used both to create a new habit and to edit an existing one
export default function HabitForm({ initial, onSubmit, onCancel, submitLabel = 'Add habit' }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const ok = await onSubmit({ name: name.trim(), description: description.trim() || null, color })
    setSaving(false)
    // Clear the form after a successful create (edit forms are closed by the parent)
    if (ok && !initial) {
      setName('')
      setDescription('')
      setColor(COLORS[0])
    }
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <input
        placeholder="Habit name (e.g. Drink 8 glasses of water)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        required
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-row">
        <div className="colors" role="radiogroup" aria-label="Color">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              className={`swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="actions">
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="primary" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
