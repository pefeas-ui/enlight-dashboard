// Formato compacto: $1.2M / $450K / $320
export function fmt(v) {
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(1) + 'M'
  if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(0) + 'K'
  return s + '$' + a.toFixed(0)
}

// USD con decimales
export function fmtUSD(v) {
  if (!v && v !== 0) return '—'
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1e6) return s + 'USD ' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return s + 'USD ' + (a / 1e3).toFixed(1) + 'K'
  return s + 'USD ' + a.toFixed(0)
}

// MXN
export function fmtMXN(v) {
  if (!v && v !== 0) return '—'
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(1) + 'K'
  return s + '$' + a.toFixed(0)
}

// USD en miles para tabla pacing/P&L
export function fmtUSDk(v) {
  if (!v) return '—'
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(0) + 'K'
  return s + '$' + a.toFixed(0)
}

// Porcentaje
export function fmtPct(v, decimals = 1) {
  if (v === null || v === undefined) return '—'
  return (v * 100).toFixed(decimals) + '%'
}

// Formato markdown del agente IA a HTML
export function fmtAI(t) {
  if (!t) return ''
  return t
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(
      /^### (.+)$/gm,
      '<div style="font-size:11px;font-weight:700;color:var(--jade);text-transform:uppercase;letter-spacing:.06em;margin:12px 0 6px">$1</div>'
    )
    .replace(/^## (.+)$/gm, '<div style="font-size:13px;font-weight:600;color:var(--white);margin:10px 0 5px">$1</div>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0">')
    .replace(/\n/g, '<br>')
}

// Fecha corta: "31 Ene 2025"
export function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Días restantes
export function daysLeft(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
