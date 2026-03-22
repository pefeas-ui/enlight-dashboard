import React, { useState } from 'react'
import { useApp } from '../App'

export default function Login() {
  const { login, loading, error } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div id="loginScreen" style={{ display: 'flex' }}>
      <div className="login-box">
        <div className="login-logo">
          <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--jade)' }}>enlight</span>
          <span style={{ fontSize: 12, color: 'var(--gris)', display: 'block', marginTop: 4 }}>
            Dashboard Financiero
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="ctrl"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@enlight.mx"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="ctrl"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <button
            className="btn btn-jade"
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
