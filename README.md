# Enlight Dashboard v2 — React + Vite

## Setup inicial (una sola vez)

```bash
npm install
npm run dev
```

Abre http://localhost:5173 — misma URL de login, mismo Google Apps Script.

## Estructura

```
src/
  data/           # Datos estáticos (Oracle raw, Pacing, P&L, config)
    config.js     # AUTH_API, CLAUDE_ENDPOINT, CORTE_MES
    rawData.js    # 534 proyectos Oracle (se reemplazará con API)
    pacingData.js # 227 proyectos pacing (193KB)
    plData.js     # P&L mensual Enerclima
  
  hooks/          # Lógica reutilizable
    useAuth.js    # Login / logout / roles
    useOracle.js  # Carga de Excel Oracle
    useIA.js      # Agente IA (Claude API)
  
  pages/          # Una página = un archivo
    Dashboard.jsx
    Pacing.jsx
    PL.jsx
    AgenteIA.jsx
    Facturacion.jsx  # pendiente
    Datos.jsx        # pendiente
    Admin.jsx        # pendiente
  
  components/     # Componentes compartidos
    Shell.jsx     # Sidebar + Topbar + layout
  
  utils/
    format.js     # fmt, fmtUSD, fmtMXN, fmtUSDk, fmtPct, fmtDate
  
  styles/
    enlight-theme.css  # Paleta y clases del dashboard

functions/
  claude.js       # Netlify Function (sin cambios)

netlify.toml      # build: npm run build → dist/
```

## Deploy en Netlify

El `netlify.toml` ya está configurado. Netlify detecta automáticamente:
- **Build command:** `npm run build`
- **Publish dir:** `dist`
- **Functions:** `functions/`

Variables de entorno requeridas (ya están en Netlify):
- `ANTHROPIC_API_KEY`

## Roadmap de migración

- [x] Fase 1: Setup React + Vite + estructura base
- [x] Dashboard financiero
- [x] Pacing / Control de Avance  
- [x] P&L Mensual
- [x] Agente IA
- [ ] Facturación (CxC / CxP)
- [ ] Datos Oracle (drag & drop Excel)
- [ ] Modal de proyecto (CdM / OC / Facturas)
- [ ] Admin de usuarios
- [ ] Procore / Correlaciones / D.O.V.O.

## Agregar un módulo nuevo

1. Crear `src/pages/MiModulo.jsx`
2. Agregar la ruta en `src/App.jsx`
3. Agregar el link en `src/components/Shell.jsx`

No tocar ningún otro archivo.
