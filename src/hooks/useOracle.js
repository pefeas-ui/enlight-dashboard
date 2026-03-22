import { useState, useCallback } from 'react'
import RAW from '../data/rawData'
import { parseExcelFile } from '../utils/excelParser'

// Parsear Excel Oracle (mismo algoritmo del HTML actual)
// parseExcelFile importado desde utils/excelParser.js

export function useOracle() {
  const [data, setData] = useState(RAW)
  const [loadedRev, setLoadedRev] = useState(null)
  const [loadedCogs, setLoadedCogs] = useState(null)
  const [status, setStatus] = useState({ rev: null, cogs: null })

  // Recibe rows ya parseadas desde Datos.jsx
  const loadRevenue = useCallback((rows) => {
    setLoadedRev(rows)
  }, [])

  const loadCogs = useCallback((rows) => {
    setLoadedCogs(rows)
  }, [])

  const applyData = useCallback(() => {
    if (loadedRev && loadedCogs) {
      // merge rev + cogs igual que el HTML actual
      const merged = loadedRev.map(r => {
        const c = loadedCogs.find(x => x.p === r.p) || {}
        return { ...r, ci: c.ci || 0, cp: c.cp || 0, cpp: c.cpp || 0 }
      })
      setData(merged)
    }
  }, [loadedRev, loadedCogs])

  const canApply = loadedRev && loadedCogs
  const getProject = (projId) => data.find(r => r.p === projId)

  return {
    data,
    loadedRev,
    loadedCogs,
    status,
    canApply,
    loadRevenue,
    loadCogs,
    applyData,
    getProject,
  }
}
