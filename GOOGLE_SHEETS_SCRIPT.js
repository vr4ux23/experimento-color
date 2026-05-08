// --- INSTRUCCIONES ---
// 1. Abre un Google Sheet nuevo.
// 2. Ve a 'Extensiones' -> 'Apps Script'.
// 3. Borra todo el código y pega esto.
// 4. Dale a 'Implementar' -> 'Nueva implementación'.
// 5. Elige Tipo: 'Aplicación web'.
// 6. Quién tiene acceso: 'Cualquier persona'.
// 7. Copia la URL que te den y pégala en App.tsx (variable SCRIPT_URL).

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Si la hoja está vacía, añade las cabeceras
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Fecha", 
      "Nombre", 
      "Edad", 
      "Sexo", 
      "Aciertos Fácil", 
      "Aciertos Intermedio", 
      "Aciertos Difícil", 
      "Aciertos Total", 
      "Tiempo Promedio (ms)"
    ]);
  }
  
  sheet.appendRow([
    data.fecha,
    data.nombre,
    data.edad,
    data.sexo,
    data.aciertos_facil,
    data.aciertos_intermedio,
    data.aciertos_dificil,
    data.aciertos_total,
    data.tiempo_promedio_ms
  ]);
  
  return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
}
