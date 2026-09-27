// Date helpers. Dates are stored as 'YYYY-MM-DD' strings in the user's local time zone.

export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date
}

export function today() {
  return toDateString(new Date())
}

// The last n days, oldest first (today is last)
export function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i))
}

// Number of consecutive completed days ending today.
// If today isn't done yet, the streak still counts from yesterday so it isn't "lost" mid-day.
export function calcStreak(doneDates) {
  let offset = doneDates.has(today()) ? 0 : 1
  let streak = 0
  while (doneDates.has(toDateString(daysAgo(offset)))) {
    streak++
    offset++
  }
  return streak
}
