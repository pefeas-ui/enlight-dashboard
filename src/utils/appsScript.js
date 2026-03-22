// Fetch a Google Apps Script evitando CORS
// Apps Script no soporta preflight (OPTIONS) — usar GET con URL params
export async function appsScriptFetch(params) {
  const AUTH_API = import.meta.env.VITE_AUTH_API ||
    'https://script.google.com/macros/s/AKfycbwpANsj9_rSwQ3rLbHs1HqsSrLICCyja2z4Wj-Mh4BfUc2Ptv5u77d1o0yqaU7_cfTaHg/exec'
  const url = AUTH_API + '?' + new URLSearchParams(params).toString()
  const res = await fetch(url, { method: 'GET', redirect: 'follow' })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{.*\}/s)
    if (match) return JSON.parse(match[0])
    throw new Error('Respuesta inválida del servidor')
  }
}
