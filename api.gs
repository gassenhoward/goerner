// ==========================================================================
// GOOGLE APPS SCRIPT: CRM BACKEND, API & AUTOMATIC DASHBOARD GENERATOR
// ==========================================================================

const EMAIL_INFO = "info@druckerei-goerner.de"; 
const EMAIL_VINYL = "vinyl@druckerei-goerner.de, satz@druckerei-goerner.de"; 
const GOOGLE_DRIVE_FOLDER_ID = "1ENmLOpM79-Lq_2oprfa-eXosZgnwzEnE";
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1UoYbGcSrBFcXyraAYy6gikHVSAJdv_Dyn7ck1SGIZnw/edit?usp=sharing";

// ==========================================================================
// 1. AUTOMATISCHE TRIGGER & ROUTING (doPost / doGet)
// ==========================================================================

function onEdit(e) {
  if (!e) return;
  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName().toLowerCase().trim();
  const editedColumn = range.getColumn();
  const editedRow = range.getRow();
  
  if (editedRow === 1) return;
  
  let istStatusSpalte = false;
  if ((sheetName === "vinyl_anfragen" || sheetName === "vinyl anfragen") && editedColumn === 29) {
    istStatusSpalte = true; 
  } else if (sheetName === "anfragen" && editedColumn === 7) {
    istStatusSpalte = true; 
  }
  
  if (istStatusSpalte) {
    verarbeiteZeilenFarbeUndRahmen(sheet, editedRow, sheet.getLastColumn());
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return erstelleJsonAntwort(false, "Fehler: Keine Formulardaten empfangen.");
    }
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType;
    
    if (formType === 'kontakt') {
      return verarbeiteKontaktFormular(data);
    } else if (formType === 'vinyl') {
      return verarbeiteVinylFormular(data);
    } else {
      return erstelleJsonAntwort(false, "Unbekannter Formular-Typ.");
    }
  } catch (error) {
    return erstelleJsonAntwort(false, "Fehler beim Verarbeiten der Anfrage: " + error.toString());
  }
}

function doGet(e) {
  const userProperties = PropertiesService.getUserProperties();
  const sessionActive = userProperties.getProperty('crm_session_active');
  
  if (e && e.parameter && e.parameter.auftragsnummer) {
    try {
      const auftragsnummer = e.parameter.auftragsnummer;
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("auftraege");
      if(!sheet) return erstelleJsonAntwort(false, "Tabelle nicht gefunden.");
      const daten = sheet.getDataRange().getValues();
      for (let i = 1; i < daten.length; i++) {
        if (daten[i][0].toString().trim().toUpperCase() === auftragsnummer.trim().toUpperCase()) {
          const ergebnis = {
            auftragsnummer: daten[i][0],
            projektname: daten[i][2],
            status: daten[i][3],
            liefertermin: daten[i][6] ? Utilities.formatDate(new Date(daten[i][6]), Session.getScriptTimeZone(), "dd.MM.yyyy") : "Noch offen"
          };
          return erstelleJsonAntwort(true, "Auftrag gefunden.", ergebnis);
        }
      }
      return erstelleJsonAntwort(false, "Auftragsnummer nicht gefunden.");
    } catch (error) {
      return erstelleJsonAntwort(false, "Fehler: " + error.toString());
    }
  }

  if ((e && e.parameter && e.parameter.page === 'dashboard') || sessionActive === 'true') {
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

// ==========================================================================
// 2. AUTHENTIFIZIERUNG & SESSION-MANAGEMENT
// ==========================================================================

function checkAuthentication(username, password) {
  const adminUser = "admin_goerner";
  const adminPass = "GOERNER_CRM_2026!#"; 
  if (username === adminUser && password === adminPass) {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('crm_session_active', 'true');
    return { success: true };
  }
  return { success: false, message: "Zugangsdaten ungültig." };
}

function performLogoutBackend() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('crm_session_active');
  return { success: true };
}

// ==========================================================================
// 3. CRM DASHBOARD API-ENDPUNKTE
// ==========================================================================

function getFormRequests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("vinyl_anfragen");
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const data = [];
  
  for (let i = values.length - 1; i >= Math.max(1, values.length - 100); i--) {
    let row = values[i];
    data.push({
      rowIndex: i + 1,
      timestamp: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm") : "",
      kunde: row[1] || "",
      firmaBand: row[2] || "",
      projekt: row[3] || "",
      email: row[4] || "",
      phone: row[5] || "",
      zusammenfassung: row[20] || "",
      driveLink: row[25] || "",
      transferLink: row[26] || "",
      nachricht: row[27] || "",
      status: row[28] || "Neu"
    });
  }
  return data;
}

function updateRequestStatusBackend(rowIndex, newStatus) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("vinyl_anfragen");
    if (!sheet) return { success: false, message: "Tabelle nicht gefunden." };
    
    sheet.getRange(parseInt(rowIndex), 29).setValue(newStatus);
    verarbeiteZeilenFarbeUndRahmen(sheet, parseInt(rowIndex), sheet.getLastColumn());
    return { success: true, message: "Status erfolgreich auf '" + newStatus + "' aktualisiert." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ==========================================================================
// 4. STELLENANGEBOTE & ASSETS BACKEND LOGIK
// ==========================================================================

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

function getLiveJobsBackend() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("stellenangebote");
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const data = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i][5] === "Aktiv") {
      data.push({
        rowId: i + 1,
        titel: values[i][1],
        abteilung: values[i][2],
        art: values[i][3],
        beschreibung: values[i][4]
      });
    }
  }
  return data;
}

function deleteJobOfferBackend(rowId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("stellenangebote");
    if (!sheet) return { success: false, message: "Tabelle nicht gefunden." };
    sheet.getRange(parseInt(rowId), 6).setValue("Inaktiv");
    return { success: true, message: "Stellenangebot erfolgreich deaktiviert." };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

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
      const folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
      const newFile = folder.createFile(blob);
      newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return { success: true, url: newFile.getUrl(), id: newFile.getId() };
    }
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ==========================================================================
// 5. FORMULAR-VERARBEITUNG (KONTAKT & VINYL MULTI-BASKET)
// ==========================================================================

function verarbeiteKontaktFormular(data) {
  if (!data.name || !data.email) return erstelleJsonAntwort(false, "Name und E-Mail erforderlich.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("anfragen");
  if (!sheet) {
    sheet = ss.insertSheet("anfragen");
    sheet.appendRow(["Zeitstempel", "Name", "E-Mail", "Telefon", "Betreff", "Nachricht", "Status"]);
  }
  
  const timestamp = new Date();
  sheet.appendRow([timestamp, data.name, data.email, data.phone || "", data.subject || "", data.message || "", "Neu"]);
  formatiereTabelle("anfragen");
  
  try { sendeKontaktEmail(data.name, data.email, data.phone || "", data.subject || "", data.message || ""); } catch(m) {}
  return erstelleJsonAntwort(true, "Kontaktanfrage gespeichert!");
}

function verarbeiteVinylFormular(data) {
  if (!data.name || !data.email) return erstelleJsonAntwort(false, "Name und E-Mail erforderlich.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("vinyl_anfragen");
  if (!sheet) {
    sheet = ss.insertSheet("vinyl_anfragen");
    sheet.appendRow([
      "Zeitstempel", "Name", "Firma/Band", "Projektname", "E-Mail", "Telefon", 
      "12 Kastentasche", "10 Kastentasche", "7 Kastentasche", "12 Gatefold", 
      "12 Innentasche", "10 Innentasche", "7 Innentasche", "Rückenbreite", 
      "Veredelung", "Kartonsorte", "Farbigkeit", "Sonderfarbe Details", 
      "Innendruck", "Grammatur", "Projekt-Zusammenfassung", "Lack/Cello", 
      "Inside Out", "Extras", "Stückzahl", "Drive Link", "Transfer Link", 
      "Nachricht", "Status"
    ]);
  }
  
  const timestamp = new Date();
  let driveLink = "";
  if (data.fileData && data.fileName) {
    try { driveLink = speichereDateiInDrive(data.fileData, data.fileName); } catch (fError) {
      return erstelleJsonAntwort(false, "Dateiupload-Fehler: " + fError.toString());
    }
  }

  const sheetDriveLink = driveLink ? '=HYPERLINK("' + driveLink + '"; "Druckdatei öffnen ➔")' : "";
  const sheetTransferLink = data.datenlink ? data.datenlink : "";
  const projektZusammenfassung = data.projektZusammenfassung || data.message || "Keine Spezifikationen angegeben.";

  sheet.appendRow([
    timestamp,                     // A
    data.name,                     // B
    data.firmaBand || "",          // C
    data.projektname || "",        // D
    data.email,                    // E
    data.phone || "",              // F
    "", "", "", "", "", "", "",    // G-M
    "",                            // N
    "",                            // O
    "",                            // P
    "",                            // Q
    "",                            // R
    "",                            // S
    "",                            // T
    projektZusammenfassung,        // U
    "",                            // V
    "",                            // W
    "",                            // X
    data.stueckzahl || "Spezifisch",// Y
    sheetDriveLink,                // Z
    sheetTransferLink,             // AA
    data.message || "",            // AB
    "Neu"                          // AC
  ]);
  
  formatiereTabelle("vinyl_anfragen");
  
  try {
    sendeVinylEmail(
      data.firmaBand || "Keine Angabe", 
      data.projektname || "Unbenanntes Projekt", 
      data.name, 
      data.email, 
      data.phone || "-", 
      projektZusammenfassung, 
      driveLink, 
      sheetTransferLink,
      data.message || ""
    );
  } catch (mailError) {
    console.error("Vinyl-Mail-Fehler: " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Vinyl-Spezifikation erfolgreich gespeichert!");
}

// ==========================================================================
// 6. E-MAIL BENACHRICHTIGUNGEN
// ==========================================================================

function sendeKontaktEmail(name, email, phone, subject, message) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #007bff; padding: 20px; border-radius: 8px;">
      <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 0;">Neue Anfrage: Kontaktformular</h2>
      <p><strong>Name / Firma:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Betreff:</strong> ${subject}</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; margin-top: 15px;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;
  MailApp.sendEmail({ to: EMAIL_INFO, subject: "CRM: Neue Kontaktanfrage", htmlBody: htmlBody });
}

function sendeVinylEmail(firmaBand, projektname, name, email, phone, zusammenfassung, dateiLink, transferLink, message) {
  const webAppUrl = ScriptApp.getService().getUrl() + "?page=dashboard";
  
  const formattierterHtmlText = zusammenfassung.split('\n\n').map(block => {
    const zeilen = block.split('\n');
    const titel = zeilen[0];
    const details = zeilen.slice(1).join('<br>');
    return `
      <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong style="font-size: 15px; color: #1e293b; display: block; margin-bottom: 4px;">${titel}</strong>
        <div style="padding-left: 12px; color: #475569; font-size: 13px; line-height: 1.5;">${details}</div>
      </div>
    `;
  }).join('');

  let assetsHtml = "";
  if (dateiLink) {
    assetsHtml += `<p style="margin: 6px 0;"><strong>Direkt-Upload (Google Drive):</strong> <a href="${dateiLink}" target="_blank" style="color: #ff007f; font-weight: bold; text-decoration: underline;">Druckdatei öffnen ➔</a></p>`;
  } else {
    assetsHtml += `<p style="margin: 6px 0; color: #6b7280;"><strong>Direkt-Upload:</strong> Kein Upload vorhanden</p>`;
  }

  if (transferLink) {
    assetsHtml += `<p style="margin: 6px 0;"><strong>Cloud-Link (WeTransfer / Dropbox):</strong> <a href="${transferLink}" target="_blank" style="color: #ff007f; font-weight: bold; text-decoration: underline;">Transfer-Link öffnen ➔</a></p>`;
  } else {
    assetsHtml += `<p style="margin: 6px 0; color: #6b7280;"><strong>Cloud-Link:</strong> Kein Link angegeben</p>`;
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; border: 2px solid #ff007f; padding: 25px; border-radius: 8px; background-color: #ffffff; color: #111111; line-height: 1.5;">
      <h2 style="color: #ff007f; border-bottom: 2px solid #ff007f; padding-bottom: 12px; margin-top: 0;">Neue Vinyl-Spezifikationsanfrage</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; width: 30%;"><strong>Kunde / Name:</strong></td>
          <td style="padding: 6px 0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Firma / Band:</strong></td>
          <td style="padding: 6px 0;">${firmaBand || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Projektname:</strong></td>
          <td style="padding: 6px 0;">${projektname || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>E-Mail:</strong></td>
          <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #ff007f;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Telefon:</strong></td>
          <td style="padding: 6px 0;">${phone || "-"}</td>
        </tr>
      </table>

      <h3 style="color: #ff007f; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Spezifizierte Komponenten:</h3>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; color: #0f172a;">
        ${formattierterHtmlText}
      </div>

      <h3 style="color: #ff007f; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Druckdaten & Assets:</h3>
      <div style="background-color: #f1f5f9; padding: 12px 15px; border-radius: 6px; font-size: 14px;">
        ${assetsHtml}
      </div>

      ${message ? `
      <h3 style="color: #ff007f; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Anmerkungen des Kunden:</h3>
      <div style="background-color: #fff0f6; border-left: 4px solid #ff007f; padding: 12px 15px; border-radius: 4px; font-size: 14px; white-space: pre-wrap;">${message}</div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="${webAppUrl}" style="background-color: #ff007f; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Zum CRM Admin Dashboard ➔</a>
      </div>
    </div>
  `;

  MailApp.sendEmail({ 
    to: EMAIL_VINYL, 
    subject: `CRM [Vinyl]: ${projektname || "Neuer Auftrag"} - ${name}`, 
    htmlBody: htmlBody 
  });
}

// ==========================================================================
// 7. UTILITIES & TABELLEN-FORMATIERUNG
// ==========================================================================

function speichereDateiInDrive(base64String, dateiName) {
  const ordner = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
  const datenTeile = base64String.split(",");
  const contentTyp = datenTeile[0].match(/:(.*?);/)[1];
  const roheDaten = Utilities.base64Decode(datenTeile[1]);
  const blob = Utilities.newBlob(roheDaten, contentTyp, dateiName);
  const datei = ordner.createFile(blob);
  datei.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return datei.getUrl();
}

function erstelleJsonAntwort(erfolg, meldung, daten = null) {
  return ContentService.createTextOutput(JSON.stringify({ erfolg: erfolg, meldung: meldung, daten: daten })).setMimeType(ContentService.MimeType.JSON);
}

function formatiereTabelle(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 1 || lastColumn < 1) return;
  
  const bereinigterName = sheetName.toLowerCase().trim();
  const datenBereichKomplett = sheet.getRange(2, 1, Math.max(1, lastRow - 1), lastColumn);
  
  const headerRange = sheet.getRange(1, 1, 1, lastColumn);
  headerRange.setBackground("#1a1a1a").setFontColor("#ffffff").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);
  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1);
  
  if (lastRow === 1) return;
  
  datenBereichKomplett.setFontFamily("Arial").setFontSize(10).setVerticalAlignment("middle").setHorizontalAlignment("left");
  datenBereichKomplett.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP); 
  
  for (let r = 2; r <= lastRow; r++) {
    sheet.setRowHeight(r, 65); 
    verarbeiteZeilenFarbeUndRahmen(sheet, r, lastColumn);
  }
  
  if (bereinigterName === "vinyl_anfragen" || bereinigterName === "vinyl anfragen") {
    sheet.getRange("A2:A" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("E2:E" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("F2:F" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("U2:U" + lastRow).setHorizontalAlignment("left").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    sheet.getRange(2, 7, lastRow - 1, 7).setHorizontalAlignment("center");
    sheet.getRange("T2:T" + lastRow).setHorizontalAlignment("center"); 
    sheet.getRange("W2:W" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("Y2:Y" + lastRow).setHorizontalAlignment("center").setFontWeight("bold");
  }
}

function verarbeiteZeilenFarbeUndRahmen(sheet, row, lastColumn) {
  const sheetName = sheet.getName().toLowerCase().trim();
  let statusColumn = (sheetName === "vinyl_anfragen" || sheetName === "vinyl anfragen") ? 29 : 7;
  
  const zeilenBereich = sheet.getRange(row, 1, 1, lastColumn);
  const statusWert = sheet.getRange(row, statusColumn).getValue().toString().trim();
  
  zeilenBereich.setBorder(true, null, true, null, null, null, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
  zeilenBereich.setFontFamily("Arial").setFontSize(10).setFontColor("#111111").setVerticalAlignment("middle");
  sheet.getRange(row, statusColumn).setFontWeight("bold").setHorizontalAlignment("center");
  
  if (statusWert === "Neu" || statusWert === "") {
    zeilenBereich.setBackground("#ffe3e3"); 
    sheet.getRange(row, statusColumn).setFontColor("#b91c1c");
  } 
  else if (statusWert === "In Bearbeitung") {
    zeilenBereich.setBackground("#fffbeb"); 
    sheet.getRange(row, statusColumn).setFontColor("#b45309");
    zeilenBereich.setBorder(true, true, true, true, null, null, "#ff007f", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  } 
  else if (statusWert === "Erledigt") {
    zeilenBereich.setBackground("#f0fdf4"); 
    sheet.getRange(row, statusColumn).setFontColor("#15803d");
    zeilenBereich.setBorder(true, true, true, true, null, null, "#bbf7d0", SpreadsheetApp.BorderStyle.SOLID);
  }
}