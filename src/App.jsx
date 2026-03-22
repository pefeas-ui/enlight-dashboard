import React, { createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useOracle } from './hooks/useOracle'
import { useProjectModal } from './hooks/useProjectModal'
import Login from './pages/Login'
import ProjectModal from './components/ProjectModal/ProjectModal'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import Pacing from './pages/Pacing'
import PL from './pages/PL'
import Facturacion from './pages/Facturacion'
import AgenteIA from './pages/AgenteIA'
import Datos from './pages/Datos'
import Admin from './pages/Admin'
import Procore from './pages/Procore'
import Correlacion from './pages/Correlacion'
import DOVO from './pages/DOVO'

// Contexto global de la app
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function PrivateRoute({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const auth = useAuth()
  const oracle = useOracle()
  const modal = useProjectModal()

  const ctx = { ...auth, ...oracle, modal }

  return (
    <AppContext.Provider value={ctx}>
      <ProjectModal modal={modal} />
      <Routes>
        <Route path="/login" element={
          auth.user ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Shell />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="pacing" element={<Pacing />} />
          <Route path="pl" element={<PL />} />
          <Route path="facturacion" element={<Facturacion />} />
          <Route path="ia" element={<AgenteIA />} />
          <Route path="datos" element={<Datos />} />
          <Route path="admin" element={<Admin />} />
          <Route path="procore" element={<Procore />} />
          <Route path="correlacion" element={<Correlacion />} />
          <Route path="dovo" element={<DOVO />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  )
}
