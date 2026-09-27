import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore an existing session (if the user already logged in before)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Keep session state in sync on login / logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="container"><p className="muted">Loading…</p></div>

  if (!session) {
    return (
      <div className="container">
        <Auth />
      </div>
    )
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>🌱 Habit Tracker</h1>
        <div className="user">
          <span className="muted">{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>

      <main>
        <Dashboard />
      </main>
    </div>
  )
}
