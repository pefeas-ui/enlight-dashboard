import React, { useState } from 'react'
import { fmtMXN, fmtDate } from '../../utils/format'

function OCChart({ cdm, ocs }) {
  if (!cdm) return null

  const allPartidas = [...cdm.construccion, ...cdm.adicionales, ...cdm.otros]
  const totalPresup = allPartidas.reduce((s, p) => s + (p.mxn || 0), 0)
  const totalComprometido = ocs.filter(o => o.status !== 'cancelada').reduce((s, o) => s + (o.monto || 0), 0)
  const pct = totalPresup > 0 ? Math.min(1, totalComprometido / totalPresup) : 0
  const over = totalComprometido > totalPresup

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--gris)' }}>Presupuesto: <strong style={{ color: 'var(--white)' }}>{fmtMXN(totalPresup)}</strong></span>
        <span style={{ color: over ? 'var(--danger)' : 'var(--jade)' }}>
          Comprometido: <strong>{fmtMXN(totalComprometido)}</strong>
          {over && ' ⚠️ Sobre presupuesto'}
        </span>
      </div>
      <div style={{ height: 12, background: 'var(--marino3)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 6, transition: 'width .4s',
          width: `${pct * 100}%`,
          background: over ? 'var(--danger)' : pct > 0.85 ? 'var(--warn)' : 'var(--jade)'
        }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 4, textAlign: 'right' }}>
        {(pct * 100).toFixed(1)}% utilizado
      </div>
    </div>
  )
}

const STATUS_COLOR = {
  pendiente: 'var(--warn)',
  pagada: 'var(--jade)',
  cancelada: 'var(--danger)',
}

export default function TabOC({ cdm, ocs, projId, onCreateOC, onMarkPagada }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ partida: '', proveedor: '', monto: '', fecha: '', desc: '' })

  const allPartidas = cdm ? [...cdm.construccion, ...cdm.adicionales, ...cdm.otros] : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.partida || !form.proveedor || !form.monto) return
    onCreateOC(projId, {
      partida: form.partida,
      proveedor: form.proveedor,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      desc: form.desc,
    })
    setForm({ partida: '', proveedor: '', monto: '', fecha: '', desc: '' })
    setShowForm(false)
  }

  return (
    <div>
      <OCChart cdm={cdm} ocs={ocs} />

      {/* Encabezado lista OCs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Órdenes de compra</span>
        <button className="btn btn-jade btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancelar' : '+ Nueva OC'}
        </button>
      </div>

      {/* Formulario nueva OC */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--marino2)', border: '1px solid var(--border2)',
          borderRadius: 8, padding: 14, marginBottom: 14
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Partida CdM *</label>
              <select className="ctrl" style={{ width: '100%' }} value={form.partida}
                onChange={e => setForm(f => ({ ...f, partida: e.target.value }))} required>
                <option value="">— Selecciona —</option>
                {allPartidas.map((p, i) => (
                  <option key={i} value={p.desc}>{p.desc} ({fmtMXN(p.mxn)})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Proveedor *</label>
              <input className="ctrl" style={{ width: '100%' }} value={form.proveedor}
                onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))}
                placeholder="Nombre del proveedor" required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Monto MXN *</label>
              <input className="ctrl" type="number" style={{ width: '100%' }} value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                placeholder="0.00" required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Fecha estimada</label>
              <input className="ctrl" type="date" style={{ width: '100%' }} value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--gris)', display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea className="ctrl" rows={2} style={{ width: '100%' }} value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Detalle adicional..." />
          </div>
          <button className="btn btn-jade btn-sm" type="submit">Crear OC</button>
        </form>
      )}

      {/* Lista OCs */}
      {!ocs.length ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris2)' }}>
          Sin órdenes de compra. Crea la primera con el botón +
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ocs.map(oc => (
            <div key={oc.id} style={{
              background: 'var(--marino2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{oc.partida}</div>
                <div style={{ fontSize: 11, color: 'var(--gris)' }}>
                  {oc.proveedor} · {oc.fecha ? fmtDate(oc.fecha) : '—'}
                </div>
                {oc.desc && <div style={{ fontSize: 11, color: 'var(--gris2)', marginTop: 2 }}>{oc.desc}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{fmtMXN(oc.monto)}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 12,
                  background: `${STATUS_COLOR[oc.status]}22`,
                  color: STATUS_COLOR[oc.status], fontWeight: 600
                }}>
                  {oc.status}
                </span>
                {oc.status === 'pendiente' && (
                  <button className="btn btn-outline btn-sm"
                    onClick={() => onMarkPagada(oc.id, projId)}
                    style={{ fontSize: 10 }}>
                    Marcar pagada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
