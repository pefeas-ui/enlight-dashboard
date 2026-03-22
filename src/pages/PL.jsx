import React, { useMemo, useState } from 'react'
import PL_DATA from '../data/plData'
import { fmtUSDk, fmtPct } from '../utils/format'

const ROWS_CONFIG = [
  { key: 'rev_work',      label: 'Revenue por avance de obra',  section: 'revenue', indent: true },
  { key: 'rev_services',  label: 'Revenue por servicios',       section: 'revenue', indent: true },
  { key: 'rev_other',     label: 'Otros ingresos',              section: 'revenue', indent: true },
  { key: 'total_rev',     label: 'TOTAL REVENUE',               section: 'revenue', total: true },
  { key: 'cogs_work',     label: 'COGS avance de obra',         section: 'cogs',    indent: true, negGood: true },
  { key: 'cogs_services', label: 'COGS servicios',              section: 'cogs',    indent: true, negGood: true },
  { key: 'cogs_other',    label: 'Otros COGS',                  section: 'cogs',    indent: true, negGood: true },
  { key: 'total_cogs',    label: 'TOTAL COGS',                  section: 'cogs',    subtotal: true, negGood: true },
  { key: 'gross_profit',  label: 'UTILIDAD BRUTA',              section: 'gross',   total: true },
  { key: 'gross_margin',  label: 'Margen bruto %',              section: 'gross',   pct: true },
  { key: 'sga_other',     label: 'Otros SG&A',                  section: 'sga',     indent: true, negGood: true },
  { key: 'comisiones',    label: 'Comisiones',                  section: 'sga',     indent: true, negGood: true },
  { key: 'pasivo_lab',    label: 'Pasivo laboral',              section: 'sga',     indent: true, negGood: true },
  { key: 'adjustments',   label: 'Ajustes',                     section: 'sga',     indent: true },
  { key: 'ptu',           label: 'PTU',                         section: 'sga',     indent: true, negGood: true },
  { key: 'payroll',       label: 'Nómina',                      section: 'sga',     indent: true, negGood: true },
  { key: 'total_sga',     label: 'TOTAL SG&A',                  section: 'sga',     subtotal: true, negGood: true },
  { key: 'ebitda',        label: 'EBITDA',                      section: 'ebitda',  ebitda: true },
  { key: 'ebitda_margin', label: 'Margen EBITDA %',             section: 'ebitda',  ebitda: true, pct: true },
]

const SECTIONS = {
  revenue: '📥 Revenue',
  cogs:    '📤 Costo de ventas (COGS)',
  gross:   '',
  sga:     '🏢 Gastos operativos (SG&A)',
  ebitda:  '',
}

export default function PL() {
  const [yearFilter, setYearFilter] = useState('2025')
  const [corte, setCorte] = useState(PL_DATA.corte)

  const months = PL_DATA.months
  const r = PL_DATA.rows

  const visibleIdxs = useMemo(() =>
    months.map((m, i) => (yearFilter === 'all' || m.startsWith(yearFilter)) ? i : -1).filter(i => i >= 0),
    [yearFilter, months]
  )

  const corteDate = months[corte] ? new Date(months[corte]).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : ''

  // KPIs del período visible
  const kpis = useMemo(() => {
    const sum = (row) => visibleIdxs.reduce((s, i) => s + (row[i] || 0), 0)
    const totRev = sum(r.total_rev)
    const totCogs = sum(r.total_cogs)
    const totGP = sum(r.gross_profit)
    const totSGA = sum(r.total_sga)
    const totEBITDA = sum(r.ebitda)
    return { totRev, totCogs, totGP, totSGA, totEBITDA,
      gpPct: totRev > 0 ? totGP / totRev : 0,
      ebitdaPct: totRev > 0 ? totEBITDA / totRev : 0 }
  }, [visibleIdxs, r])

  // Formato de celda
  const cellVal = (v, pct) => {
    if (pct) return Math.abs(v) < 0.001 ? '—' : fmtPct(v)
    if (Math.abs(v) < 0.1) return '—'
    return v < 0
      ? '(' + Math.abs(v).toLocaleString('es-MX', { maximumFractionDigits: 0 }) + ')'
      : v.toLocaleString('es-MX', { maximumFractionDigits: 0 })
  }

  const cellColor = (v, negGood, pct) => {
    if (Math.abs(v) < (pct ? 0.001 : 0.1)) return 'var(--gris)'
    if (pct) return v > 0 ? 'var(--jade)' : 'var(--danger)'
    if (negGood) return v < 0 ? 'var(--danger)' : 'var(--gris2)'
    return v > 0 ? 'var(--jade)' : 'var(--danger)'
  }

  const exportCSV = () => {
    const r = PL_DATA.rows
    const headers = ['Concepto', ...visibleIdxs.map(i => months[i].slice(0,7)), 'TOTAL']
    const dataRows = ROWS_CONFIG.map(row => {
      const rowData = r[row.key] || []
      const total = visibleIdxs.reduce((s, i) => s + (rowData[i] || 0), 0)
      return [
        row.label,
        ...visibleIdxs.map(i => (rowData[i] || 0).toFixed(0)),
        total.toFixed(0)
      ]
    })
    const csv = [headers, ...dataRows]
      .map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'PL_Enerclima_' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
  }

  let lastSection = null

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="sec-title">P&L Mensual — Enerclima</div>
          <div className="sec-sub" style={{ marginTop: 4 }}>
            Cifras en miles de pesos (MXN) ·{' '}
            <span style={{ color: 'var(--jade)' }}>Histórico hasta {corteDate} · Proyectado a partir de ahí</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="ctrl" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="all">Todos los años</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <select className="ctrl" value={corte} onChange={e => setCorte(+e.target.value)}>
            <option value={23}>Corte: Dic 2025</option>
            <option value={11}>Corte: Dic 2024</option>
            <option value={14}>Corte: Mar 2025</option>
            <option value={35}>Corte: Dic 2026</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Exportar</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          ['Revenue', fmtUSDk(kpis.totRev), 'var(--jade)'],
          ['COGS', fmtUSDk(kpis.totCogs), 'var(--warn)'],
          ['Utilidad Bruta', fmtUSDk(kpis.totGP), kpis.totGP >= 0 ? 'var(--jade)' : 'var(--danger)'],
          ['SG&A', fmtUSDk(kpis.totSGA), 'var(--cerceta)'],
          ['EBITDA', fmtUSDk(kpis.totEBITDA), kpis.totEBITDA >= 0 ? 'var(--jade)' : 'var(--danger)'],
        ].map(([label, val, color]) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className="kpi-val" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', minWidth: 180, padding: '7px 10px', background: 'var(--marino2)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--gris)' }}>
                Concepto
              </th>
              {visibleIdxs.map(i => {
                const d = new Date(months[i])
                const isHist = i <= corte
                return (
                  <th key={i} style={{
                    padding: '7px 8px', textAlign: 'right', background: 'var(--marino2)',
                    fontSize: 10, color: isHist ? 'var(--white)' : 'var(--jade)',
                    fontStyle: isHist ? 'normal' : 'italic', whiteSpace: 'nowrap'
                  }}>
                    {d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase()}
                    <br />
                    <span style={{ fontSize: 9, opacity: .6 }}>{d.getFullYear()}</span>
                    <span style={{
                      marginLeft: 3, fontSize: 8, padding: '1px 3px', borderRadius: 2,
                      background: isHist ? 'rgba(61,125,156,.3)' : 'rgba(0,173,136,.2)',
                      color: isHist ? 'var(--cerceta)' : 'var(--jade)'
                    }}>
                      {isHist ? 'H' : 'F'}
                    </span>
                  </th>
                )
              })}
              <th style={{ textAlign: 'right', padding: '7px 8px', background: 'rgba(0,173,136,.08)', color: 'var(--jade)', fontSize: 10 }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS_CONFIG.map((row, ri) => {
              const rowData = r[row.key] || []
              const rowTotal = visibleIdxs.reduce((s, i) => s + (rowData[i] || 0), 0)
              const showHeader = row.section !== lastSection && SECTIONS[row.section]
              if (row.section !== lastSection) lastSection = row.section

              return (
                <React.Fragment key={row.key}>
                  {showHeader && (
                    <tr>
                      <td colSpan={visibleIdxs.length + 2} style={{
                        padding: '8px 10px', background: 'var(--marino2)',
                        color: 'var(--jade)', fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '.04em'
                      }}>
                        {SECTIONS[row.section]}
                      </td>
                    </tr>
                  )}
                  <tr style={{
                    borderBottom: '1px solid var(--border)',
                    background: row.ebitda ? 'rgba(0,173,136,.07)' : 'transparent'
                  }}>
                    <td style={{
                      padding: '6px 10px',
                      paddingLeft: row.indent ? 24 : 10,
                      fontWeight: (row.total || row.subtotal || row.ebitda) ? 600 : 400,
                      fontSize: row.indent ? 11 : 12,
                      color: row.indent ? 'var(--gris)' : 'var(--white)'
                    }}>
                      {row.label}
                    </td>
                    {visibleIdxs.map(i => {
                      const v = rowData[i] || 0
                      const isHist = i <= corte
                      return (
                        <td key={i} style={{
                          padding: '6px 8px', textAlign: 'right',
                          fontStyle: isHist ? 'normal' : 'italic',
                          color: cellColor(v, row.negGood, row.pct),
                          fontSize: row.pct ? 10 : 11.5
                        }}>
                          {cellVal(v, row.pct)}
                        </td>
                      )
                    })}
                    <td style={{
                      padding: '6px 8px', textAlign: 'right', fontWeight: 700,
                      background: 'rgba(0,173,136,.05)',
                      color: row.pct
                        ? (rowTotal > 0 ? 'var(--jade)' : 'var(--danger)')
                        : cellColor(rowTotal, row.negGood, false),
                      fontSize: row.pct ? 10 : 11.5
                    }}>
                      {row.pct
                        ? fmtPct(rowTotal / visibleIdxs.length)
                        : cellVal(rowTotal, false)}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
