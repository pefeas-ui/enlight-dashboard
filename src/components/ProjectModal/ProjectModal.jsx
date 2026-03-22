import React, { useEffect } from 'react'
import { useApp } from '../../App'
import { fmt, fmtPct, daysLeft, fmtDate } from '../../utils/format'
import TabCDM from './TabCDM'
import TabOC from './TabOC'
import TabFacturas from './TabFacturas'

function KpiCard({ label, value, color }) {
  return (
    <div className="modal-kpi">
      <div className="modal-kpi-label">{label}</div>
      <div className="modal-kpi-val" style={color ? { color } : {}}>{value}</div>
    </div>
  )
}

function FechasBadge({ meta, projId }) {
  if (!meta) return null
  const days = daysLeft(meta.fin)
  const color = days < 0 ? 'var(--danger)' : days < 30 ? 'var(--warn)' : 'var(--jade)'
  return (
    <div style={{ fontSize: 11, color: 'var(--gris)', textAlign: 'right' }}>
      <div>Inicio: {fmtDate(meta.inicio)}</div>
      <div>Fin: {fmtDate(meta.fin)}</div>
      <div style={{ color, marginTop: 2, fontWeight: 500 }}>
        {days < 0 ? `${Math.abs(days)}d vencido` : `${days}d restantes`}
      </div>
    </div>
  )
}

export default function ProjectModal({ modal }) {
  const { data } = useApp()
  const {
    projId, activeTab, activeFactTab,
    close, setActiveTab, setActiveFactTab,
    getProjectData, getCDM, getOCs, getFacturas, getMeta,
    createOC, markOCPagada,
  } = modal

  // Cerrar con Escape
  useEffect(() => {
    if (!projId) return
    const handler = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [projId, close])

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = projId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [projId])

  if (!projId) return null

  const d = getProjectData(projId, data)
  if (!d) return null

  const name = d.c.replace(/CUS-\d+[:.]?\d*\s*/, '')
  const u = d.ri - d.ci
  const m = d.ri > 0 ? u / d.ri : 0
  const cdm = getCDM(projId, data)
  const ocs = getOCs(projId)
  const facturas = getFacturas(projId, data)
  const meta = getMeta(projId)

  return (
    /* Overlay */
    <div
      id="projModal"
      className="open"
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className="modal-box">

        {/* HEADER */}
        <div className="modal-header">
          <button className="modal-close" onClick={close}>✕</button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="modal-proj-id">{projId}</div>
              <div className="modal-proj-name">{name}</div>
            </div>
            <FechasBadge meta={meta} projId={projId} />
          </div>

          {/* KPIs */}
          <div className="modal-kpis">
            <KpiCard label="Ingresos"    value={fmt(d.ri)}   color="var(--jade)" />
            <KpiCard label="Costos"      value={fmt(d.ci)}   color="var(--warn)" />
            <KpiCard label="Utilidad"    value={fmt(u)}      color={u >= 0 ? 'var(--jade)' : 'var(--danger)'} />
            <KpiCard label="Margen"      value={fmtPct(m)}   color={m >= 0.2 ? 'var(--jade)' : m >= 0.1 ? 'var(--warn)' : 'var(--danger)'} />
            <KpiCard label="CxC"         value={fmt(d.rpp || 0)} color={d.rpp > 0 ? 'var(--warn)' : 'var(--gris)'} />
            <KpiCard label="CxP"         value={fmt(d.cpp || 0)} color={d.cpp > 0 ? 'var(--cerceta)' : 'var(--gris)'} />
          </div>
        </div>

        {/* TABS */}
        <div className="modal-tabs">
          {[['cdm', '📊 CdM'], ['oc', '📦 OC & Costos'], ['fact', '🧾 Facturas']].map(([key, label]) => (
            <button
              key={key}
              className={`modal-tab${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="modal-body">
          {activeTab === 'cdm' && <TabCDM cdm={cdm} />}
          {activeTab === 'oc'  && (
            <TabOC
              cdm={cdm} ocs={ocs} projId={projId}
              onCreateOC={createOC} onMarkPagada={markOCPagada}
            />
          )}
          {activeTab === 'fact' && (
            <TabFacturas
              facturas={facturas}
              activeTab={activeFactTab}
              onTabChange={setActiveFactTab}
            />
          )}
        </div>

      </div>
    </div>
  )
}
