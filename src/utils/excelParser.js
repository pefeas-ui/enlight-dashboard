// Parser nativo ZIP/XML para archivos .xlsx de Oracle
// Extraído del index.html original — sin dependencias externas

async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const ab = e.target.result;
        // Extraer ZIP
        const zip = await extractZIP(ab);
        if(!zip) { reject(new Error('No se pudo leer el archivo')); return; }
        
        // Leer sharedStrings
        const ssXML = zip['xl/sharedStrings.xml'];
        const strings = parseSharedStrings(ssXML);
        
        // Leer sheet1
        const sheetXML = zip['xl/worksheets/sheet1.xml'];
        const rows = parseSheet(sheetXML, strings);
        
        resolve(rows);
      } catch(err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

async function extractZIP(ab) {
  // Simple ZIP parser para archivos XLSX
  const view = new DataView(ab);
  const files = {};
  
  // Encontrar el End of Central Directory
  const bytes = new Uint8Array(ab);
  let eocd = -1;
  for(let i = bytes.length - 22; i >= 0; i--) {
    if(bytes[i]===0x50 && bytes[i+1]===0x4B && bytes[i+2]===0x05 && bytes[i+3]===0x06) {
      eocd = i; break;
    }
  }
  if(eocd < 0) return null;
  
  const cdOffset = view.getUint32(eocd + 16, true);
  const cdSize = view.getUint32(eocd + 12, true);
  
  let pos = cdOffset;
  while(pos < cdOffset + cdSize) {
    if(view.getUint32(pos, true) !== 0x02014B50) break;
    const method = view.getUint16(pos + 10, true);
    const compSize = view.getUint32(pos + 20, true);
    const uncompSize = view.getUint32(pos + 24, true);
    const fnLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    
    const fnBytes = bytes.slice(pos + 46, pos + 46 + fnLen);
    const fname = new TextDecoder().decode(fnBytes);
    
    // Leer local file header
    const lpos = localOffset;
    const lFnLen = view.getUint16(lpos + 26, true);
    const lExtraLen = view.getUint16(lpos + 28, true);
    const dataStart = lpos + 30 + lFnLen + lExtraLen;
    const compData = bytes.slice(dataStart, dataStart + compSize);
    
    if(method === 0) {
      // Sin compresión
      files[fname] = new TextDecoder('utf-8').decode(compData);
    } else if(method === 8) {
      // Deflate
      try {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        const reader2 = ds.readable.getReader();
        writer.write(compData);
        writer.close();
        const chunks = [];
        while(true) {
          const {done, value} = await reader2.read();
          if(done) break;
          chunks.push(value);
        }
        const total = chunks.reduce((a,c)=>a+c.length,0);
        const out = new Uint8Array(total);
        let off = 0;
        for(const c of chunks) { out.set(c, off); off += c.length; }
        files[fname] = new TextDecoder('utf-8').decode(out);
      } catch(e) {}
    }
    pos += 46 + fnLen + extraLen + commentLen;
  }
  return files;
}

function parseSharedStrings(xml) {
  if(!xml) return [];
  const strings = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const sis = doc.getElementsByTagName('si');
  for(const si of sis) {
    const ts = si.getElementsByTagName('t');
    strings.push(Array.from(ts).map(t => t.textContent || '').join(''));
  }
  return strings;
}

function parseSheet(xml, strings) {
  if(!xml) return [];
  const clean = xml.replace(/>NaN</g, '>0<');
  const parser = new DOMParser();
  const doc = parser.parseFromString(clean, 'text/xml');
  const rows = [];
  for(const row of doc.getElementsByTagName('row')) {
    const rowData = {};
    for(const c of row.getElementsByTagName('c')) {
      const ref = c.getAttribute('r') || '';
      const col = ref.replace(/[0-9]/g,'');
      const t = c.getAttribute('t') || '';
      const v = c.getElementsByTagName('v')[0];
      if(!v) { rowData[col] = null; continue; }
      const val = v.textContent;
      if(t === 's') {
        rowData[col] = strings[parseInt(val)] || val;
      } else {
        rowData[col] = parseFloat(val) || 0;
      }
    }
    rows.push(rowData);
  }
  return rows;
}

function rowsToProjects(rows) {
  const projects = {};
  for(const r of rows.slice(2)) {
    const proj = r['A'];
    if(proj && typeof proj === 'string' && proj.startsWith('PROJ-')) {
      projects[proj] = {
        cliente: r['B'] || '',
        saldo_ini: r['C'] || 0,
        facturado: r['D'] || 0,
        pagado: r['E'] || 0,
        pendiente: r['F'] || 0,
        saldo_fin: r['G'] || 0,
      };
    }
  }
  return projects;
}
export { parseExcelFile };
