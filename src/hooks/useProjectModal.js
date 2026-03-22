import { useState, useCallback } from 'react'
import PROJ_META from '../data/projMeta'
import { FACT_STORE } from '../data/factStore'
import { PACING_DATA } from '../data/pacingData'

// Genera datos CdM a partir de datos Oracle (igual que getCDM del HTML)
function buildCDM(d) {
  if (!d) return null
  const n = d.c.replace(/CUS-\d+[:.]?\d*\s*/, '')
  return {
    cliente: n,
    ingresos: [
      { oracle: '—', desc: 'Precio de venta', usd: Math.round(d.ri / 18.45), mxn: d.ri, wpr: 0 },
    ],
    construccion: [
      { oracle: 'FV-Cons-Módulos FV',      desc: 'Módulos FV',         usd: Math.round(d.ci * 0.35 / 18.45), mxn: Math.round(d.ci * 0.35), wpr: 0 },
      { oracle: 'FV-Cons-Inversor',         desc: 'Inversores',         usd: Math.round(d.ci * 0.15 / 18.45), mxn: Math.round(d.ci * 0.15), wpr: 0 },
      { oracle: 'FV-Cons-Estructura',       desc: 'Estructura metálica', usd: Math.round(d.ci * 0.12 / 18.45), mxn: Math.round(d.ci * 0.12), wpr: 0 },
      { oracle: 'FV-Cons-Obra civil',       desc: 'Obra civil',          usd: Math.round(d.ci * 0.10 / 18.45), mxn: Math.round(d.ci * 0.10), wpr: 0 },
      { oracle: 'FV-Cons-Eléctrico',        desc: 'Trabajo eléctrico',   usd: Math.round(d.ci * 0.18 / 18.45), mxn: Math.round(d.ci * 0.18), wpr: 0 },
    ],
    adicionales: [
      { oracle: 'FV-Add-Proyecto',          desc: 'Ingeniería y proyecto', usd: Math.round(d.ci * 0.05 / 18.45), mxn: Math.round(d.ci * 0.05), wpr: 0 },
      { oracle: 'FV-Add-Gestión',           desc: 'Gestión y permisos',    usd: Math.round(d.ci * 0.03 / 18.45), mxn: Math.round(d.ci * 0.03), wpr: 0 },
    ],
    otros: [
      { oracle: 'FV-Otros-Contingencia',    desc: 'Contingencia (2%)',    usd: Math.round(d.ci * 0.02 / 18.45), mxn: Math.round(d.ci * 0.02), wpr: 0 },
    ],
  }
}

// Genera datos de facturas demo
function buildFactData(d) {
  if (!d) return { cxc: [], cxp: [] }
  return {
    cxc: d.rpp > 0 ? [
      { folio: d.p + '-CXC-01', desc: 'Anticipo contrato', monto: Math.round(d.rp * 0.3), pendiente: Math.round(d.rpp * 0.6), status: 'parcial', fecha: '2025-01-15' },
      { folio: d.p + '-CXC-02', desc: 'Estimación avance obra', monto: Math.round(d.rp * 0.5), pendiente: Math.round(d.rpp * 0.4), status: 'pendiente', fecha: '2025-03-01' },
    ] : [],
    cxp: d.cpp > 0 ? [
      { folio: d.p + '-CXP-01', desc: 'Módulos fotovoltaicos', monto: Math.round(d.cp * 0.4), pendiente: Math.round(d.cpp * 0.5), status: 'pendiente', proveedor: 'Risen Energy', fecha: '2025-02-10' },
      { folio: d.p + '-CXP-02', desc: 'Inversores SMA', monto: Math.round(d.cp * 0.2), pendiente: Math.round(d.cpp * 0.3), status: 'parcial', proveedor: 'SMA Solar', fecha: '2025-03-15' },
    ] : [],
  }
}

export function useProjectModal() {
  const [projId, setProjId] = useState(null)
  const [activeTab, setActiveTab] = useState('cdm')
  const [activeFactTab, setActiveFactTab] = useState('cxc')
  const [ocStore, setOcStore] = useState({})  // { projId: [oc, ...] }
  const [showOCForm, setShowOCForm] = useState(false)

  const open = useCallback((id) => {
    setProjId(id)
    setActiveTab('cdm')
    setActiveFactTab('cxc')
    setShowOCForm(false)
  }, [])

  const close = useCallback(() => {
    setProjId(null)
  }, [])

  // Obtener datos del proyecto de Oracle o Pacing
  const getProjectData = useCallback((id, oracleData) => {
    if (!id) return null
    let d = oracleData?.find(r => r.p === id)
    if (!d) {
      const pd = PACING_DATA.find(r => r.id === id)
      if (pd) d = {
        p: pd.id, c: pd.cliente + ' | ' + pd.nombre,
        ri: pd.capex, ci: pd.costo,
        u: pd.capex - pd.costo,
        m: pd.margen * 100, rpp: 0, cpp: 0, rp: 0, cp: 0
      }
    }
    return d || null
  }, [])

  // OC
  const getOCs = useCallback((id) => ocStore[id] || [], [ocStore])

  const createOC = useCallback((id, ocData) => {
    const newOC = {
      id: `OC-${id}-${Date.now()}`,
      projId: id,
      status: 'pendiente',
      fecha: new Date().toISOString().slice(0, 10),
      ...ocData,
    }
    setOcStore(s => ({ ...s, [id]: [...(s[id] || []), newOC] }))
  }, [])

  const markOCPagada = useCallback((ocId, id) => {
    setOcStore(s => ({
      ...s,
      [id]: (s[id] || []).map(oc => oc.id === ocId ? { ...oc, status: 'pagada' } : oc)
    }))
  }, [])

  // CDM
  const getCDM = useCallback((id, oracleData) => {
    const d = getProjectData(id, oracleData)
    return d ? buildCDM(d) : null
  }, [getProjectData])

  // Facturas — usa FACT_STORE si existen datos reales, sino genera demo
  const getFacturas = useCallback((id, oracleData) => {
    if (FACT_STORE[id]) return FACT_STORE[id]
    const d = getProjectData(id, oracleData)
    return buildFactData(d)
  }, [getProjectData])

  // Meta (fechas)
  const getMeta = useCallback((id) => PROJ_META[id] || null, [])

  return {
    projId, activeTab, activeFactTab,
    showOCForm, setShowOCForm,
    open, close,
    setActiveTab, setActiveFactTab,
    getProjectData, getCDM, getOCs, getFacturas, getMeta,
    createOC, markOCPagada,
  }
}
