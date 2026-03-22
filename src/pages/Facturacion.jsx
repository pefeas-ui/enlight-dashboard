import React, { useState } from 'react'
import FACT_DATA_DEFAULT from '../data/factData'
import { fmtMXN, fmtDate } from '../utils/format'

const STATUS_CONFIG = {
  lista:    { label: '✓ Lista para aprobar', color: 'var(--jade)',   bg: 'var(--jade-dim)' },
  revision: { label: '⏳ En revisión',       color: 'var(--warn)',   bg: 'var(--warn-dim)' },
  proxima:  { label: '🔜 Próxima',           color: 'var(--gris)',   bg: 'var(--marino3)'  },
  aprobada: { label: '✓ Aprobada',           color: 'var(--jade)',   bg: 'var(--jade-dim)' },
  rechazada:{ label: '✗ Rechazada',          color: 'var(--danger)', bg: 'var(--danger-dim)'},
}

function FactItem({ item, onApprove, onReject }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.proxima
  const isActionable = item.status === 'lista'
  return (
    <div style={{
      background: 'var(--marino2)',
      border: `1px solid ${isActionable ? 'var(--jade)' : 'var(--border)'}`,
      borderRadius: 10, padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--gris)', marginBottom: 3 }}>{item.id}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: 'var(--gris)', marginTop: 2 }}>{item.proj} · {item.hito}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--jade)' }}>{fmtMXN(item.monto)}</div>
          <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 2 }}>{fmtDate(item.fecha)}</div>
        </div>
      </div>
      <div style={{ background: 'var(--marino3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--gris)', marginBottom: 10, borderLeft: '3px solid var(--cerceta)' }}>
        <span style={{ color: 'var(--cerceta)', fontWeight: 500 }}>Condición: </span>{item.condicion}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 500 }}>
          {cfg.label}
        </span>
        {isActionable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => onReject(item.id)}>✗ Rechazar</button>
            <button className="btn btn-jade btn-sm" onClick={() => onApprove(item.id)}>✓ Aprobar factura</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Facturacion() {
  const [items, setItems] = useState(FACT_DATA_DEFAULT)
  const [filter, setFilter] = useState('all')

  const approve = (id) => setItems(its => its.map(i => i.id === id ? { ...i, status: 'aprobada' } : i))
  const reject  = (id) => setItems(its => its.map(i => i.id === id ? { ...i, status: 'rechazada' } : i))

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const totalListas = items.filter(i => i.status === 'lista').length
  const totalMonto  = items.filter(i => i.status === 'lista').reduce((s, i) => s + i.monto, 0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="sec-title">Facturación</div>
          <div className="sec-sub" style={{ marginTop: 4 }}>Propuestas de factura pendientes de aprobación</div>
        </div>
        {totalListas > 0 && (
          <div style={{ background: 'var(--jade-dim)', border: '1px solid var(--jade)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--jade)' }}>{fmtMXN(totalMonto)}</div>
            <div style={{ fontSize: 11, color: 'var(--gris)' }}>{totalListas} facturas listas</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['all','Todas'],['lista','Listas'],['revision','En revisión'],['proxima','Próximas'],['aprobada','Aprobadas']].map(([val, lbl]) => (
          <button key={val} className={`btn btn-sm ${filter === val ? 'btn-jade' : 'btn-outline'}`} onClick={() => setFilter(val)}>
            {lbl} <span style={{ marginLeft: 4, opacity: .7 }}>({val === 'all' ? items.length : items.filter(i => i.status === val).length})</span>
          </button>
        ))}
      </div>
      {filtered.length === 0
        ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--gris)' }}>No hay facturas en este estado</div>
        : filtered.map(item => <FactItem key={item.id} item={item} onApprove={approve} onReject={reject} />)
      }
    </div>
  )
}
