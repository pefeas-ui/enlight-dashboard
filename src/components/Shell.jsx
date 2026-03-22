import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../App'

const NAV_TECNICO = [
  { path: '/procore',    icon: '🏗️', label: 'Avance de obra', beta: true },
  { path: '/correlacion',icon: '🔗', label: 'Correlaciones',   beta: true },
  { path: '/dovo',       icon: '📋', label: 'D.O. / V.O.',     beta: true },
  { path: '/pacing',     icon: '📅', label: 'Pacing / Avance'              },
]

const NAV_FINANCIERO = [
  { path: '/',           icon: '📊', label: 'Dashboard'                    },
  { path: '/pl',         icon: '📑', label: 'P&L Mensual'                  },
  { path: '/facturacion',icon: '🧾', label: 'Facturación', beta: true      },
  { path: '/ia',         icon: '🤖', label: 'Agente IA'                    },
  { path: '/datos',      icon: '📂', label: 'Datos Oracle'                  },
]

const PAGE_TITLES = {
  '/': 'Dashboard financiero',
  '/pacing': 'Pacing / Control de Avance',
  '/pl': 'P&L Mensual — Enerclima',
  '/facturacion': 'Facturación',
  '/ia': 'Agente IA',
  '/datos': 'Datos Oracle',
  '/admin': 'Usuarios',
  '/procore': 'Avance de obra',
  '/correlacion': 'Correlaciones',
  '/dovo': 'D.O. / V.O.',
}

function SidebarLink({ path, icon, label, beta, exact }) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
    >
      <span className="sb-icon">{icon}</span>
      <span className="sb-link-text">
        {label}
        {beta && <span className="beta-chip">BETA</span>}
      </span>
    </NavLink>
  )
}

export default function Shell() {
  const { user, logout, isAdmin, data } = useApp()
  const location = useLocation()
  const [searchVal, setSearchVal] = useState('')

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'
  const initials = user?.nombre?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div id="appShell" style={{ display: 'flex' }}>

      {/* SIDEBAR */}
      <nav id="sidebar" style={{ display: 'flex' }}>
        <div className="sb-logo">
          <span style={{ color: 'var(--jade)', fontWeight: 600, fontSize: 18 }}>enlight</span>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">Técnico</div>
          {NAV_TECNICO.map(n => <SidebarLink key={n.path} {...n} />)}
        </div>

        <div className="sb-divider" />

        <div className="sb-section">
          <div className="sb-section-title">Financiero</div>
          {NAV_FINANCIERO.map(n => <SidebarLink key={n.path} {...n} />)}
        </div>

        {isAdmin && (
          <>
            <div className="sb-divider" />
            <div className="sb-section">
              <div className="sb-section-title">Administración</div>
              <NavLink to="/admin" className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
                <span className="sb-icon">⚙️</span>
                <span className="sb-link-text">Usuarios</span>
              </NavLink>
            </div>
          </>
        )}

        <div className="sb-bottom">
          <div className="sb-avatar">{initials}</div>
          <div>
            <div id="sbUserName" style={{ fontSize: 13, fontWeight: 500, color: 'var(--white)' }}>
              {user?.nombre}
            </div>
            <div id="sbUserRole" style={{ fontSize: 11, color: 'var(--gris)' }}>
              {user?.rol}
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginLeft: 'auto', fontSize: 11 }}
            onClick={logout}
          >
            Salir
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div id="mainWrapper">
        <div id="topbar">
          <span style={{ fontSize: 11, color: 'var(--gris)' }}>{pageTitle}</span>
          <div className="tb-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Buscador global de proyectos */}
            <input
              type="text"
              placeholder="🔍 Buscar proyecto..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              style={{
                background: 'var(--marino2)', border: '1px solid var(--border)',
                color: 'var(--white)', padding: '5px 10px', borderRadius: 6,
                fontSize: 11, width: 180
              }}
            />
            <span className="tb-badge">{data.length} proyectos</span>
          </div>
        </div>

        <main id="mainContent">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
