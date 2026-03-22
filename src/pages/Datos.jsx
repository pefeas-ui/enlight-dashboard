import React, { useState, useCallback, useRef } from 'react'
import { useApp } from '../App'
import { parseExcelFile } from '../utils/excelParser'
import { fmt } from '../utils/format'

function DropZone({ type, label, icon, status, onFile }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file, type)
  }, [type, onFile])

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file, type)
  }

  return (
    <div
      className="drop-zone"
      style={{
        border: `2px dashed ${dragging ? 'var(--jade)' : status?.ok ? 'var(--jade)' : 'var(--border2)'}`,
        borderRadius: 12, padding: 32, textAlign: 'center',
        background: dragging ? 'var(--jade-dim)' : 'var(--marino2)',
        transition: 'all .2s', cursor: 'pointer',
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--gris)', marginBottom: 12 }}>
        Arrastra o haz clic · RIE_{type === 'rev' ? 'Revenue' : 'COGS'}.xlsx
      </div>
      <input
        ref={inputRef} type="file" accept=".xlsx"
        style={{ display: 'none' }} onChange={handleChange}
      />
      {status && (
        <div style={{
          fontSize: 12, marginTop: 8, padding: '4px 12px', borderRadius: 20, display: 'inline-block',
          background: status.ok ? 'var(--jade-dim)' : 'var(--danger-dim)',
          color: status.ok ? 'var(--jade)' : 'var(--danger)',
        }}>
          {status.ok ? `✓ ${status.name} — ${status.count} proyectos` : `✗ ${status.error}`}
        </div>
      )}
    </div>
  )
}

export default function Datos() {
  const { data, loadRevenue, loadCogs, applyData, canApply, status } = useApp()

  const [loading, setLoading] = useState({ rev: false, cogs: false })
  const [fileStatus, setFileStatus] = useState({ rev: null, cogs: null })

  const handleFile = useCallback(async (file, type) => {
    setLoading(l => ({ ...l, [type]: true }))
    try {
      const rows = await parseExcelFile(file)
      if (type === 'rev') loadRevenue(rows)
      else loadCogs(rows)
      setFileStatus(s => ({
        ...s,
        [type]: { ok: true, name: file.name, count: rows?.length || 0 }
      }))
    } catch (e) {
      setFileStatus(s => ({ ...s, [type]: { ok: false, error: e.message } }))
    } finally {
      setLoading(l => ({ ...l, [type]: false }))
    }
  }, [loadRevenue, loadCogs])

  // KPIs del estado actual
  const active   = data.filter(d => d.ri > 0)
  const totRev   = active.reduce((s, d) => s + d.ri, 0)
  const totCxC   = active.reduce((s, d) => s + (d.rpp || 0), 0)
  const totCxP   = active.reduce((s, d) => s + (d.cpp || 0), 0)

  return (
    <div style={{ padding: 24 }}>
      <div className="sec-title" style={{ marginBottom: 4 }}>Datos Oracle</div>
      <div className="sec-sub" style={{ marginBottom: 20 }}>
        Carga los archivos RIE de Revenue y COGS para actualizar el dashboard
      </div>

      {/* Resumen datos actuales */}
      <div style={{ background: 'var(--marino2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--gris)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontWeight: 600 }}>
          Estado actual de los datos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            ['Proyectos activos', active.length, 'var(--white)'],
            ['Revenue total',     fmt(totRev),   'var(--jade)'],
            ['CxC pendiente',     fmt(totCxC),   'var(--warn)'],
            ['CxP pendiente',     fmt(totCxP),   'var(--cerceta)'],
          ].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: 'var(--gris)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 10 }}>
          Fuente: {fileStatus.rev?.ok ? `${fileStatus.rev.name}` : 'datos RAW embebidos'}
        </div>
      </div>

      {/* Drop zones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <DropZone type="rev"  label="RIE Revenue" icon="📊"
          status={loading.rev ? { ok: false, error: 'Procesando...' } : fileStatus.rev}
          onFile={handleFile} />
        <DropZone type="cogs" label="RIE COGS"    icon="📉"
          status={loading.cogs ? { ok: false, error: 'Procesando...' } : fileStatus.cogs}
          onFile={handleFile} />
      </div>

      {/* Botón aplicar */}
      {canApply && (
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-jade"
            style={{ padding: '10px 32px', fontSize: 15 }}
            onClick={applyData}
          >
            ✓ Aplicar datos Oracle al dashboard
          </button>
          <div style={{ fontSize: 11, color: 'var(--gris)', marginTop: 8 }}>
            Actualizará Dashboard, P&L, Pacing y el Agente IA
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{ marginTop: 32, padding: 20, background: 'var(--marino2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--jade)' }}>¿Cómo obtener los archivos?</div>
        {[
          ['1', 'Abre Oracle ERP → Reportes → RIE'],
          ['2', 'Ejecuta "Revenue for Work Progress" → Exportar a Excel → guarda como RIE_-_Revenue.xlsx'],
          ['3', 'Ejecuta "COGS for Work Progress" → Exportar a Excel → guarda como RIE_-_COGS.xlsx'],
          ['4', 'Arrastra ambos archivos a las zonas de arriba y haz clic en "Aplicar"'],
        ].map(([num, text]) => (
          <div key={num} style={{ display: 'flex', gap: 12, marginBottom: 8, color: 'var(--gris)' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--jade)', color: 'var(--marino)', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
