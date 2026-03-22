import { useState, useCallback } from 'react'
import { CLAUDE_ENDPOINT } from '../data/config'

const SYSTEM_PROMPT = `Eres un CFO y analista senior de Enerclima, empresa de energía solar en México.
Analiza el portafolio de proyectos y responde en español.
Máximo 400 palabras. Sé directo y accionable.
Termina siempre con "**Accionable:**" y una recomendación concreta.
Si generas una gráfica, usa el formato [CHART:{"title":"...","labels":[...],"values":[...],"colors":"#00AD88"}]`

export function useIA(oracleData) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const buildContext = useCallback(() => {
    const src = oracleData || []
    const active = src.filter(d => d.ri > 0)
    const totRev = active.reduce((s, d) => s + d.ri, 0)
    const totCost = active.reduce((s, d) => s + d.ci, 0)
    const totCxC = active.reduce((s, d) => s + (d.rpp || 0), 0)
    const losses = active.filter(d => d.u < 0)
    const avgMargin = totRev > 0 ? ((totRev - totCost) / totRev * 100).toFixed(1) : 0

    return `PORTAFOLIO ENERCLIMA — RESUMEN EJECUTIVO:
- Total proyectos activos: ${active.length}
- Revenue total: $${(totRev/1e6).toFixed(1)}M USD
- Costo total: $${(totCost/1e6).toFixed(1)}M USD  
- Utilidad bruta: $${((totRev-totCost)/1e6).toFixed(1)}M USD
- Margen promedio: ${avgMargin}%
- CxC pendiente: $${(totCxC/1e6).toFixed(1)}M USD
- Proyectos en pérdida: ${losses.length}
- Top proyectos por revenue: ${active.sort((a,b)=>b.ri-a.ri).slice(0,5).map(d=>d.p+':$'+(d.ri/1e6).toFixed(2)+'M').join(', ')}`
  }, [oracleData])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text }
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(CLAUDE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM_PROMPT + '\n\nCONTEXTO ACTUAL:\n' + buildContext(),
          messages: newHistory.slice(-8),
        }),
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sin respuesta'

      setHistory(h => [...h, { role: 'assistant', content: reply }])
      return reply
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [history, loading, buildContext])

  const clearHistory = useCallback(() => setHistory([]), [])

  return { history, loading, error, sendMessage, clearHistory }
}
