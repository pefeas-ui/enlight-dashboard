import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../App'
import { AUTH_API } from '../data/config'

const ROL_COLORS = {
  admin:      { color: 'var(--jade)',    bg: 'var(--jade-dim)'    },
  gerente:    { color: 'var(--warn)',    bg: 'var(--warn-dim)'    },
  controller: { color: 'var(--cerceta)', bg: 'var(--cerceta-dim)' },
  usuario:    { color: 'var(--gris)',    bg: 'var(--marino3)'     },
}

function UserRow({ user, onToggle }) {
  const rc = ROL_COLORS[user.rol] || ROL_COLORS.usuario
  const isActive = user.activo !== 'FALSE'
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', opacity: isActive ? 1 : .5 }}>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 500 }}>{user.nombre}</div>
      </td>
      <td style={{ padding: '10px 12px', color: 'var(--gris)', fontSize: 12 }}>{user.email}</td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: rc.bg, color: rc.color }}>
          {user.rol}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ fontSize: 11, color: isActive ? 'var(--jade)' : 'var(--danger)' }}>
          {isActive ? '● Activo' : '● Inactivo'}
        </span>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ color: isActive ? 'var(--danger)' : 'var(--jade)', borderColor: isActive ? 'var(--danger)' : 'var(--jade)', fontSize: 11 }}
          onClick={() => onToggle(user.email, user.activo)}
        >
          {isActive ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    </tr>
  )
}

export default function Admin() {
  const { user, isAdmin } = useApp()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', pass: '', rol: 'usuario' })

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        body: JSON.stringify({ action: 'listUsers', requesterEmail: user?.email })
      })
      const data = await res.json()
      if (data.success) setUsers(data.users || [])
    } catch (e) {
      setMsg({ type: 'error', text: 'Error cargando usuarios' })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadUsers() }, [loadUsers])

  const toggleUser = async (email, activo) => {
    const newVal = activo === 'TRUE' ? 'FALSE' : 'TRUE'
    await fetch(AUTH_API, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateUser', requesterEmail: user.email, email, activo: newVal })
    })
    loadUsers()
  }

  const createUser = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.pass) return
    setMsg(null)
    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        body: JSON.stringify({ action: 'createUser', requesterEmail: user.email, ...form, password: form.pass })
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'ok', text: `Usuario ${form.email} creado correctamente` })
        setForm({ nombre: '', email: '', pass: '', rol: 'usuario' })
        setShowForm(false)
        loadUsers()
      } else {
        setMsg({ type: 'error', text: data.message || 'Error creando usuario' })
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' })
    }
  }

  if (!isAdmin) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--gris)' }}>
      No tienes permisos para ver esta sección.
    </div>
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="sec-title">Administración de usuarios</div>
          <div className="sec-sub" style={{ marginTop: 4 }}>Gestiona accesos a la plataforma</div>
        </div>
        <button className="btn btn-jade" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13,
          background: msg.type === 'ok' ? 'var(--jade-dim)' : 'var(--danger-dim)',
          color: msg.type === 'ok' ? 'var(--jade)' : 'var(--danger)',
          border: `1px solid ${msg.type === 'ok' ? 'var(--jade)' : 'var(--danger)'}`,
        }}>
          {msg.text}
        </div>
      )}

      {/* Formulario nuevo usuario */}
      {showForm && (
        <form onSubmit={createUser} style={{
          background: 'var(--marino2)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: 18, marginBottom: 20
        }}>
          <div style={{ fontWeight: 600, marginBottom: 14, color: 'var(--jade)' }}>Nuevo usuario</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            {[
              ['Nombre completo', 'nombre', 'text', 'Pedro Avalos'],
              ['Email',           'email',  'email','pedro@enlight.mx'],
              ['Contraseña',      'pass',   'password','Mín. 6 caracteres'],
            ].map(([lbl, key, type, ph]) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>{lbl}</label>
                <input className="ctrl" type={type} style={{ width: '100%' }}
                  value={form[key]} placeholder={ph}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Rol</label>
              <select className="ctrl" style={{ width: '100%' }} value={form.rol}
                onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                <option value="usuario">Usuario</option>
                <option value="controller">Controller</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button className="btn btn-jade btn-sm" type="submit">Crear usuario</button>
        </form>
      )}

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris)' }}>Cargando usuarios...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--marino2)' }}>
                {['Nombre','Email','Rol','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gris)', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--gris)' }}>No hay usuarios registrados</td></tr>
                : users.map(u => <UserRow key={u.email} user={u} onToggle={toggleUser} />)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
