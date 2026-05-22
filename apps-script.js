// ============================================================
//  ALLFIT – CRM Google Sheets
//  Pegá TODO este código en Google Apps Script (script.google.com)
//  y deployalo como Web App (ver instrucciones abajo)
// ============================================================

const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    var data = JSON.parse(e.postData.contents);

    // ── Columnas fijas siempre primero ──
    var FIXED = ['Fecha', 'Estado'];

    // ── Obtener / crear cabeceras ──
    var headers;
    if (sheet.getLastRow() === 0) {
      // Primera fila: armar cabeceras con columnas fijas + campos del form
      var dynamicKeys = Object.keys(data).filter(function(k){ return k !== '_fecha'; });
      headers = FIXED.concat(dynamicKeys);
      sheet.appendRow(headers);

      // Estilo cabecera
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1756b8');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);  // Fecha
      sheet.setColumnWidth(2, 130);  // Estado

    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // ── Agregar columnas nuevas si el form tiene campos extras ──
    Object.keys(data).forEach(function(key){
      if (key === '_fecha') return;
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        var newColRange = sheet.getRange(1, headers.length);
        newColRange.setValue(key);
        newColRange.setBackground('#1756b8');
        newColRange.setFontColor('#ffffff');
        newColRange.setFontWeight('bold');
      }
    });

    // ── Armar fila ──
    var fecha  = data['_fecha'] ? new Date(data['_fecha']) : new Date();
    var row = headers.map(function(h){
      if (h === 'Fecha')  return fecha;
      if (h === 'Estado') return 'Nuevo';
      return data[h] !== undefined ? data[h] : '';
    });

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();

    // ── Dropdown de Estado ──
    var estadoCol = headers.indexOf('Estado') + 1;
    if (estadoCol > 0) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Nuevo', 'Contactado', 'En proceso', 'Cerrado', 'Sin cerrar'], true)
        .build();
      sheet.getRange(lastRow, estadoCol).setDataValidation(rule);
      // Color de celda según estado inicial
      sheet.getRange(lastRow, estadoCol).setBackground('#FEF3C7').setFontColor('#92400E');
    }

    // ── Zebra striping de la fila nueva ──
    var rowBg = (lastRow % 2 === 0) ? '#F8FAFC' : '#FFFFFF';
    sheet.getRange(lastRow, 1, 1, headers.length).setBackground(rowBg);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('ALLFIT Leads API – OK');
}

// ============================================================
//  INSTRUCCIONES DE DEPLOY
//  1. Ir a https://script.google.com → "Nuevo proyecto"
//  2. Borrar el código que hay y pegar TODO este archivo
//  3. Guardar (Ctrl+S) → ponerle nombre "ALLFIT CRM"
//  4. Clic en "Implementar" → "Nueva implementación"
//  5. Tipo: "Aplicación web"
//     - Ejecutar como: YO (tu cuenta Google)
//     - Quién tiene acceso: Cualquier persona (anónimo)
//  6. Clic en "Implementar" → copiar la URL que aparece
//  7. Pegar esa URL en formulario.html donde dice SHEETS_URL = ''
//  8. Guardar y commitear
// ============================================================
