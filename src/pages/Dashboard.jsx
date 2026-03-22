import React, { useMemo, useState } from 'react'
import { useApp } from '../App'
import { fmt, fmtUSD, fmtPct } from '../utils/format'

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}

function ProjectRow({ d, onOpen }) {
  const u = d.ri - d.ci
  const m = d.ri > 0 ? u / d.ri : 0
  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => onOpen(d.p)}>
      <td style={{ color: 'var(--jade)', fontWeight: 500 }}>{d.p}</td>
      <td style={{ fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {d.c.replace(/CUS-\d+[:.]?\d*\s*/, '')}
      </td>
      <td style={{ textAlign: 'right' }}>{fmt(d.ri)}</td>
      <td style={{ textAlign: 'right' }}>{fmt(d.ci)}</td>
      <td style={{ textAlign: 'right', color: u >= 0 ? 'var(--jade)' : 'var(--danger)' }}>{fmt(u)}</td>
      <td style={{ textAlign: 'right', color: m >= 0.2 ? 'var(--jade)' : m >= 0.1 ? 'var(--warn)' : 'var(--danger)' }}>
        {fmtPct(m)}
      </td>
      <td style={{ textAlign: 'right', color: d.rpp > 0 ? 'var(--warn)' : 'var(--gris)' }}>{fmt(d.rpp || 0)}</td>
    </tr>
  )
}

export default function Dashboard() {
  const { data, modal } = useApp()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('ri')
  const [sortDir, setSortDir] = useState(-1)

  const stats = useMemo(() => {
    const active = data.filter(d => d.ri > 0)
    const totRev = active.reduce((s, d) => s + d.ri, 0)
    const totCost = active.reduce((s, d) => s + d.ci, 0)
    const totCxC = active.reduce((s, d) => s + (d.rpp || 0), 0)
    const totCxP = active.reduce((s, d) => s + (d.cpp || 0), 0)
    const totU = totRev - totCost
    return { active, totRev, totCost, totCxC, totCxP, totU, avgM: totRev > 0 ? totU / totRev : 0 }
  }, [data])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data
      .filter(d => d.ri > 0)
      .filter(d => !q || d.p.toLowerCase().includes(q) || d.c.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = sortKey === 'm' ? (a.ri > 0 ? (a.ri - a.ci) / a.ri : 0) : (a[sortKey] || 0)
        const bv = sortKey === 'm' ? (b.ri > 0 ? (b.ri - b.ci) / b.ri : 0) : (b[sortKey] || 0)
        return (bv - av) * sortDir
      })
  }, [data, search, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const openModal = (projId) => modal.open(projId)

  const SortTh = ({ k, children }) => (
    <th
      style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => handleSort(k)}
    >
      {children} {sortKey === k ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div className="page-content" style={{ padding: 24 }}>

      {/* KPIs */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
        <KpiCard label="Proyectos activos" value={stats.active.length} />
        <KpiCard label="Revenue total" value={fmt(stats.totRev)} color="var(--jade)" />
        <KpiCard label="Utilidad" value={fmt(stats.totU)} color={stats.totU >= 0 ? 'var(--jade)' : 'var(--danger)'} />
        <KpiCard label="Margen" value={fmtPct(stats.avgM)} color="var(--jade2)" />
        <KpiCard label="CxC pendiente" value={fmt(stats.totCxC)} color="var(--warn)" />
      </div>

      {/* Filtro */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <input
          className="ctrl"
          type="text"
          placeholder="Buscar proyecto o cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <span style={{ fontSize: 12, color: 'var(--gris)' }}>
          {filtered.length} de {stats.active.length} proyectos
        </span>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>ID</th>
              <th style={{ textAlign: 'left' }}>Proyecto</th>
              <SortTh k="ri">Ingresos</SortTh>
              <SortTh k="ci">Costos</SortTh>
              <SortTh k="u">Utilidad</SortTh>
              <SortTh k="m">Margen</SortTh>
              <SortTh k="rpp">CxC</SortTh>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <ProjectRow key={d.p} d={d} onOpen={openModal} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
