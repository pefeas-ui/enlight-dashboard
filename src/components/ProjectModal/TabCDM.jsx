import React from 'react'
import { fmtUSD, fmtMXN } from '../../utils/format'

function CDMSection({ title, rows, color }) {
  if (!rows?.length) return null
  const total = rows.reduce((s, r) => s + (r.mxn || 0), 0)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--marino2)', padding: '6px 12px', borderRadius: '6px 6px 0 0',
        borderLeft: `3px solid ${color || 'var(--jade)'}`
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: color || 'var(--jade)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--gris)' }}>{fmtMXN(total)}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--marino3)' }}>
            <th style={{ padding: '5px 10px', textAlign: 'left', color: 'var(--gris)', fontWeight: 500, fontSize: 10 }}>Partida Oracle</th>
            <th style={{ padding: '5px 10px', textAlign: 'left', color: 'var(--gris)', fontWeight: 500, fontSize: 10 }}>Descripción</th>
            <th style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--gris)', fontWeight: 500, fontSize: 10 }}>USD</th>
            <th style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--gris)', fontWeight: 500, fontSize: 10 }}>MXN</th>
            <th style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--gris)', fontWeight: 500, fontSize: 10 }}>$/Wp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
              <td style={{ padding: '6px 10px', color: 'var(--gris2)', fontSize: 11 }}>{row.oracle}</td>
              <td style={{ padding: '6px 10px' }}>{row.desc}</td>
              <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtUSD(row.usd)}</td>
              <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--white)' }}>{fmtMXN(row.mxn)}</td>
              <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--gris)' }}>
                {row.wpr > 0 ? `$${row.wpr.toFixed(2)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TabCDM({ cdm }) {
  if (!cdm) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--gris)' }}>
      Sin datos de Comité de Márgenes para este proyecto
    </div>
  )

  return (
    <div style={{ overflowY: 'auto', maxHeight: 420 }}>
      <CDMSection title="Ingresos" rows={cdm.ingresos} color="var(--jade)" />
      <CDMSection title="Construcción" rows={cdm.construccion} color="var(--cerceta)" />
      <CDMSection title="Adicionales" rows={cdm.adicionales} color="var(--warn)" />
      <CDMSection title="Otros costos" rows={cdm.otros} color="var(--gris)" />
    </div>
  )
}
