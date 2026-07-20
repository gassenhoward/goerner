// Einstiegspunkt für die Admin-Oberfläche via Apps Script Web App URL
function doGet(e) {
  if (e.parameter.page === 'dashboard') {
    return HtmlService.createTemplateFromFile('Dashboard').evaluate()
        .setTitle('CRM Admin-Panel | Druckerei Görner')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createTemplateFromFile('Login').evaluate()
      .setTitle('Anmeldung | CRM Admin-Panel')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Authentifizierung prüfen
function checkAuthentication(username, password) {
  const adminUser = "admin_goerner";
  const adminPass = "GOERNER_CRM_2026!#"; 
  if (username === adminUser && password === adminPass) {
    return { success: true };
  }
  return { success: false, message: "Zugangsdaten ungültig." };
}

// Formular- und Cookie-Anfragen aus dem Sheet auslesen
function getFormRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("vinyl_anfragen");
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const data = [];
  
  // Die letzten 50 Anfragen für das Dashboard aufbereiten
  for (let i = values.length - 1; i >= Math.max(1, values.length - 50); i--) {
    let row = values[i];
    data.push({
      timestamp: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm"),
      kunde: row[1],
      projekt: row[3],
      email: row[4],
      zusammenfassung: row[6],
      status: row[28]
    });
  }
  return data;
}

// Stellenangebot direkt über das CRM-System ergänzen
function saveNewJobOffer(title, department, type, description) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("stellenangebote");
    if (!sheet) {
      sheet = ss.insertSheet("stellenangebote");
      sheet.appendRow(["Zeitstempel", "Titel", "Abteilung", "Art", "Beschreibung", "Status"]);
    }
    sheet.appendRow([new Date(), title, department, type, description, "Aktiv"]);
    return { success: true, message: "Stellenangebot erfolgreich live geschaltet." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// Bild im Google Drive ersetzen (für dynamische Frontend-Bilder)
function updateCrmImage(base64Data, fileName, targetImageId) {
  try {
    const splitData = base64Data.split(",");
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const decoded = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(decoded, contentType, fileName);
    
    if (targetImageId) {
      const existingFile = DriveApp.getFileById(targetImageId);
      existingFile.setContent(blob);
      return { success: true, url: existingFile.getUrl(), id: targetImageId };
    } else {
      const folder = DriveApp.getFolderById("1ENmLOpM79-Lq_2oprfa-eXosZgnwzEnE");
      const newFile = folder.createFile(blob);
      newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return { success: true, url: newFile.getUrl(), id: newFile.getId() };
    }
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}