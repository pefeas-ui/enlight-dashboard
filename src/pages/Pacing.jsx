import { useApp } from '../App'
import React, { useMemo, useState } from 'react'
import { PACING_DATA, PACING_MONTHS } from '../data/pacingData'
import { CORTE_MES } from '../data/config'
import { fmtUSDk, fmtPct } from '../utils/format'

function getStatusClass(s) {
  if (!s) return ''
  const sl = s.toLowerCase()
  if (sl.includes('going')) return 'status-ongoing'
  if (sl.includes('concluido')) return 'status-concluido'
  if (sl.includes('hold')) return 'status-hold'
  return ''
}

export default function Pacing() {
  const { modal } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterLinea, setFilterLinea] = useState('')
  const [year, setYear] = useState(2025)
  const [expanded, setExpanded] = useState({})
  const [edits, setEdits] = useState({})

  // Índices de meses del año seleccionado
  const monthIdxs = useMemo(() =>
    PACING_MONTHS.map((m, i) => m.startsWith(String(year)) ? i : -1).filter(i => i >= 0),
    [year]
  )

  // Datos filtrados
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return PACING_DATA.filter(p => {
      if (!p.on) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterLinea && p.linea !== filterLinea) return false
      if (q && !p.nombre.toLowerCase().includes(q) &&
          !p.cliente.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, filterStatus, filterLinea])

  // KPIs del año
  const kpis = useMemo(() => {
    let totalCapex = 0, totalRev = 0, totalCost = 0
    filtered.forEach(p => {
      totalCapex += p.capex
      monthIdxs.forEach(i => {
        totalRev += p.revenue[i] || 0
        totalCost += p.costosMes[i] || 0
      })
    })
    return { totalCapex, totalRev, totalCost, count: filtered.length }
  }, [filtered, monthIdxs])

  const toggleRow = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const updatePct = (projId, monthIdx, val) => {
    const p = PACING_DATA.find(x => x.id === projId)
    if (!p) return
    const avance = [...(edits[projId] || p.avance)]
    const pct = Math.max(0, Math.min(1, parseFloat(val) / 100 || 0))
    avance[monthIdx] = pct
    setEdits(e => ({ ...e, [projId]: avance }))
  }

  const statuses = [...new Set(PACING_DATA.map(p => p.status).filter(Boolean))]
  const lineas = [...new Set(PACING_DATA.map(p => p.linea).filter(Boolean))]

  return (
    <div style={{ padding: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          ['Proyectos', kpis.count, 'var(--white)'],
          ['CAPEX total', fmtUSDk(kpis.totalCapex), 'var(--cerceta)'],
          [`Revenue ${year}`, fmtUSDk(kpis.totalRev), 'var(--jade)'],
          [`Costo ${year}`, fmtUSDk(kpis.totalCost), 'var(--warn)'],
        ].map(([label, val, color]) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className="kpi-val" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input className="ctrl" placeholder="Buscar proyecto..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
        <select className="ctrl" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="ctrl" value={filterLinea} onChange={e => setFilterLinea(e.target.value)}>
          <option value="">Todas las líneas</option>
          {lineas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="ctrl" value={year} onChange={e => setYear(+e.target.value)}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: 'var(--marino2)' }}>
              <th style={{ width: 60, padding: '7px 10px' }}></th>
              <th style={{ textAlign: 'left', padding: '7px 6px' }}>ID</th>
              <th style={{ textAlign: 'left' }}>Cliente</th>
              <th style={{ textAlign: 'left' }}>Proyecto</th>
              <th>Línea</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>CAPEX</th>
              <th style={{ textAlign: 'right' }}>Margen</th>
              <th style={{ textAlign: 'right' }}>% Avance</th>
              <th style={{ textAlign: 'right' }}>Revenue {year}</th>
              <th style={{ textAlign: 'right' }}>Costo {year}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const avance = edits[p.id] || p.avance
              const lastAvance = [...avance].reverse().find(v => v > 0) || 0
              const revYear = monthIdxs.reduce((s, i) => s + (p.revenue[i] || 0), 0)
              const costYear = monthIdxs.reduce((s, i) => s + (p.costosMes[i] || 0), 0)
              const isExp = expanded[p.id]
              const sc = getStatusClass(p.status)

              return (
                <React.Fragment key={p.id}>
                  <tr style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                      <button className="pacing-expand" onClick={() => toggleRow(p.id)}>
                        {isExp ? '▼' : '▶'}
                      </button>
                    </td>
                    <td style={{ color: 'var(--jade)', fontWeight: 500, padding: '6px 6px', cursor: 'pointer' }}
                      onClick={() => modal.open(p.id)}>{p.id}</td>
                    <td style={{ padding: '6px 6px' }}>{p.cliente}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nombre}
                    </td>
                    <td style={{ textAlign: 'center' }}>{p.linea}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${sc}`}>{p.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{fmtUSDk(p.capex)}</td>
                    <td style={{ textAlign: 'right' }}>{p.margen > 0 ? fmtPct(p.margen) : '—'}</td>
                    <td style={{
                      textAlign: 'right',
                      color: lastAvance >= 1 ? 'var(--jade)' : lastAvance > 0.5 ? 'var(--warn)' : 'var(--white)'
                    }}>
                      {fmtPct(lastAvance)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--jade)' }}>{fmtUSDk(revYear)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--warn)' }}>{fmtUSDk(costYear)}</td>
                  </tr>

                  {isExp && (
                    <tr>
                      <td colSpan={11} style={{ padding: '0 0 0 60px', background: 'var(--marino2)' }}>
                        <PacingDetail p={p} avance={avance} monthIdxs={monthIdxs}
                          months={PACING_MONTHS} corte={CORTE_MES} onEdit={updatePct} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PacingDetail({ p, avance, monthIdxs, months, corte, onEdit }) {
  return (
    <div style={{ padding: '12px 16px 12px 0', overflowX: 'auto' }}>
      <table style={{ fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--gris)' }}>Mes</th>
            {monthIdxs.map(i => (
              <th key={i} style={{ padding: '4px 8px', textAlign: 'right', color: 'var(--gris)', whiteSpace: 'nowrap' }}>
                {new Date(months[i]).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })}
                {i <= corte
                  ? <span style={{ color: 'var(--cerceta)', marginLeft: 3, fontSize: 9 }}>H</span>
                  : <span style={{ color: 'var(--jade)', marginLeft: 3, fontSize: 9 }}>F</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '4px 8px', color: 'var(--gris)' }}>% Acum.</td>
            {monthIdxs.map(i => (
              <td key={i} style={{ padding: '3px 8px', textAlign: 'right' }}>
                {i <= corte
                  ? <span style={{ color: 'var(--white)' }}>{fmtPct(avance[i])}</span>
                  : <input
                      type="number" min="0" max="100" step="0.5"
                      defaultValue={((avance[i] || 0) * 100).toFixed(1)}
                      onBlur={e => onEdit(p.id, i, e.target.value)}
                      style={{
                        width: 52, textAlign: 'right', background: 'var(--jade-dim)',
                        border: '1px solid var(--jade)', color: 'var(--jade)',
                        borderRadius: 4, padding: '2px 4px', fontSize: 11
                      }}
                    />
                }
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ padding: '4px 8px', color: 'var(--gris)' }}>Revenue</td>
            {monthIdxs.map(i => (
              <td key={i} style={{ padding: '4px 8px', textAlign: 'right', color: 'var(--jade)' }}>
                {fmtUSDk(p.revenue[i] || 0)}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ padding: '4px 8px', color: 'var(--gris)' }}>Costo</td>
            {monthIdxs.map(i => (
              <td key={i} style={{ padding: '4px 8px', textAlign: 'right', color: 'var(--warn)' }}>
                {fmtUSDk(p.costosMes[i] || 0)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
