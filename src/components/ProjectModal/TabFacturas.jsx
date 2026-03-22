import React from 'react'
import { fmtMXN, fmtDate } from '../../utils/format'

const STATUS_COLOR = {
  pendiente: 'var(--warn)',
  pagada:    'var(--jade)',
  parcial:   'var(--cerceta)',
  vencida:   'var(--danger)',
}

function FactCard({ fact, tipo }) {
  const color = STATUS_COLOR[fact.status] || 'var(--gris)'
  return (
    <div style={{
      background: 'var(--marino2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', marginBottom: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--gris)', marginBottom: 2 }}>{fact.folio}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{fact.desc}</div>
          {tipo === 'cxp' && fact.proveedor && (
            <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 2 }}>{fact.proveedor}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{fmtMXN(fact.monto)}</div>
          <div style={{ fontSize: 11, color: 'var(--gris)' }}>
            Pendiente: <span style={{ color: fact.pendiente > 0 ? 'var(--warn)' : 'var(--jade)' }}>
              {fmtMXN(fact.pendiente)}
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--gris)' }}>
          {fact.fecha ? fmtDate(fact.fecha) : '—'}
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 12,
          background: `${color}22`, color, fontWeight: 600
        }}>
          {fact.status}
        </span>
      </div>
    </div>
  )
}

export default function TabFacturas({ facturas, activeTab, onTabChange }) {
  const items = activeTab === 'cxc' ? facturas.cxc : facturas.cxp

  const totalMonto    = items.reduce((s, f) => s + (f.monto || 0), 0)
  const totalPendiente = items.reduce((s, f) => s + (f.pendiente || 0), 0)

  return (
    <div>
      {/* Subtabs CxC / CxP */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14,
        borderBottom: '1px solid var(--border)', paddingBottom: 8
      }}>
        {[['cxc', '📥 Por cobrar (CxC)'], ['cxp', '📤 Por pagar (CxP)']].map(([key, label]) => (
          <button
            key={key}
            className={`fact-subtab${activeTab === key ? ' active' : ''}`}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div className="kpi-card">
            <div className="kpi-label">Total facturado</div>
            <div className="kpi-val">{fmtMXN(totalMonto)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pendiente</div>
            <div className="kpi-val" style={{ color: totalPendiente > 0 ? 'var(--warn)' : 'var(--jade)' }}>
              {fmtMXN(totalPendiente)}
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ overflowY: 'auto', maxHeight: 320 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris2)', fontSize: 13 }}>
            Sin facturas {activeTab === 'cxc' ? 'por cobrar' : 'por pagar'}
          </div>
        ) : (
          items.map((f, i) => <FactCard key={i} fact={f} tipo={activeTab} />)
        )}
      </div>
    </div>
  )
}
