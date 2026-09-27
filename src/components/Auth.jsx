import { useState } from 'react'
import { supabase } from '../supabaseClient'

// Login / registration form using Supabase email + password auth
export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // On success, App.jsx picks up the new session automatically
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      else if (!data.session) setMessage('Account created! Check your email to confirm, then log in.')
    }

    setLoading(false)
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login')
    setError('')
    setMessage('')
  }

  return (
    <div className="auth-card card">
      <h1>🌱 Habit Tracker</h1>
      <p className="muted">Build better habits, one day at a time.</p>

      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Log in' : 'Create an account'}</h2>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
        </button>
      </form>

      <p className="switch">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button type="button" className="link" onClick={switchMode}>
          {isLogin ? 'Register' : 'Log in'}
        </button>
      </p>
    </div>
  )
}
