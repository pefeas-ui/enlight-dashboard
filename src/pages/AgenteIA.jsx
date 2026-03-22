import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'
import { useIA } from '../hooks/useIA'
import { fmtAI } from '../utils/format'

const QUICK_PROMPTS = [
  ['📋', 'Resumen ejecutivo del portafolio'],
  ['⚠️', '¿Cuáles son los proyectos con mayor riesgo?'],
  ['🏆', 'Top 5 clientes por ingreso'],
  ['💸', 'Análisis de cuentas por cobrar'],
  ['📉', '¿Qué proyectos están en pérdida?'],
  ['📊', 'Genera una gráfica de revenue por cliente'],
]

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      marginBottom: 12,
      textAlign: isUser ? 'right' : 'left'
    }}>
      <div style={{
        display: 'inline-block',
        maxWidth: '85%',
        padding: '10px 14px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
        fontSize: 13,
        lineHeight: 1.6,
        background: isUser ? 'var(--jade)' : 'var(--marino2)',
        color: isUser ? 'var(--marino)' : 'var(--white)',
        border: isUser ? 'none' : '1px solid var(--border)',
      }}
        dangerouslySetInnerHTML={{ __html: isUser ? msg.content : fmtAI(msg.content) }}
      />
    </div>
  )
}

export default function AgenteIA() {
  const { data } = useApp()
  const { history, loading, sendMessage, clearHistory } = useIA(data)
  const [tab, setTab] = useState('chat')
  const [input, setInput] = useState('')
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [history, loading])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    await sendMessage(q)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, padding: '0 24px',
        borderBottom: '1px solid var(--border)', flexShrink: 0
      }}>
        {[['chat', '💬 Chat'], ['info', 'ℹ️ Contexto']].map(([key, label]) => (
          <button
            key={key}
            className={`ia-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Mensajes */}
          <div
            ref={chatBodyRef}
            style={{
              flex: 1, overflowY: 'auto', padding: 20,
              display: 'flex', flexDirection: 'column'
            }}
          >
            {history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gris)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 14 }}>Agente IA del portafolio Enerclima</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Usa los accesos rápidos o escribe tu pregunta</div>
              </div>
            )}
            {history.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {loading && (
              <div style={{ color: 'var(--gris)', fontStyle: 'italic', fontSize: 13 }}>
                Analizando portafolio...
              </div>
            )}
          </div>

          {/* Accesos rápidos */}
          {history.length === 0 && (
            <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_PROMPTS.map(([icon, text]) => (
                <button
                  key={text}
                  className="btn btn-outline btn-sm"
                  onClick={() => sendMessage(text)}
                  disabled={loading}
                >
                  {icon} {text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '8px 16px',
            borderTop: '1px solid var(--border)'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              rows={2}
              placeholder="Pregunta sobre el portafolio..."
              style={{
                flex: 1, minHeight: 44, maxHeight: 100, resize: 'none',
                background: 'var(--marino2)', border: '1px solid var(--border2)',
                color: 'var(--white)', borderRadius: 8, padding: '10px 12px',
                fontSize: 13, fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="btn btn-jade" onClick={handleSend} disabled={loading || !input.trim()}>
                Enviar
              </button>
              {history.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={clearHistory}>
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'info' && (
        <div style={{ padding: 24, color: 'var(--gris)', fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ color: 'var(--jade)', fontWeight: 600, marginBottom: 8 }}>Contexto del agente</div>
          <p>El agente tiene acceso al portafolio completo de <strong style={{ color: 'var(--white)' }}>{data.filter(d => d.ri > 0).length} proyectos activos</strong> de Enerclima.</p>
          <p style={{ marginTop: 8 }}>Modelo: <strong style={{ color: 'var(--white)' }}>Claude Sonnet</strong> via Netlify Functions — sin que los datos salgan de la plataforma.</p>
          <p style={{ marginTop: 8 }}>El historial de conversación se mantiene durante la sesión. Al cerrar sesión se borra.</p>
        </div>
      )}
    </div>
  )
}
