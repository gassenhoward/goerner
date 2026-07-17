// ==========================================================================
// GOOGLE APPS SCRIPT: CRM BACKEND, API & AUTOMATIC DASHBOARD GENERATOR
// ==========================================================================

const EMAIL_INFO = "info@druckerei-goerner.de"; 
const EMAIL_VINYL = "vinyl@druckerei-goerner.de, satz@druckerei-goerner.de"; 
const GOOGLE_DRIVE_FOLDER_ID = "1ENmLOpM79-Lq_2oprfa-eXosZgnwzEnE";

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1UoYbGcSrBFcXyraAYy6gikHVSAJdv_Dyn7ck1SGIZnw/edit?usp=sharing";

/**
 * AUTOMATISCHER CRM-TRIGGER: Läuft in Echtzeit bei manuellen Änderungen (z.B. Status)
 * Färbt bei einer Statusänderung die gesamte Zeile ein und setzt den Magenta-Rahmen.
 */
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

/**
 * Empfängt POST-Anfragen vom Webformular (AJAX)
 */
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

/**
 * Empfängt GET-Anfragen (Statusabfrage)
 */
function doGet(e) {
  try {
    const auftragsnummer = e.parameter.auftragsnummer;
    if (!auftragsnummer) return erstelleJsonAntwort(false, "Keine Auftragsnummer angegeben.");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("auftraege");
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

function verarbeiteKontaktFormular(data) {
  if (!data.name || !data.email) return erstelleJsonAntwort(false, "Name und E-Mail erforderlich.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("anfragen");
  
  const timestamp = new Date();
  sheet.appendRow([timestamp, data.name, data.email, data.phone || "", data.subject || "", data.message || "", "Neu"]);
  formatiereTabelle("anfragen");
  
  try { sendeKontaktEmail(data.name, data.email, data.phone || "", data.subject || "", data.message || ""); } catch(m) {}
  return erstelleJsonAntwort(true, "Kontaktanfrage gespeichert!");
}

/**
 * HOCHFLEXIBLE VINYL-VERARBEITUNG: Erstellt das perfekte Dashboard-Textformat für die Kollegen
 */
function verarbeiteVinylFormular(data) {
  if (!data.name || !data.email) return erstelleJsonAntwort(false, "Name und E-Mail erforderlich.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("vinyl_anfragen");
  
  const timestamp = new Date();
  let driveLink = "";
  if (data.fileData && data.fileName) {
    try { driveLink = speichereDateiInDrive(data.fileData, data.fileName); } catch (fError) {
      return erstelleJsonAntwort(false, "Dateiupload-Fehler: " + fError.toString());
    }
  }

  const sheetDriveLink = driveLink ? '=HYPERLINK("' + driveLink + '"; "Druckdatei öffnen ➔")' : "";
  const sheetTransferLink = data.datenlink ? data.datenlink : "";

  // Hintergrund-Kompatibilität für alte Spalten bleibt aktiv
  const kaste12 = data.Produkt_Kastentasche_12 ? "Ja" : "";
  const kaste10 = data.Produkt_Kastentasche_10 ? "Ja" : "";
  const kaste7 = data.Produkt_Kastentasche_7 ? "Ja" : "";
  const gate12 = data.Produkt_Gatefold_12 ? "Ja" : "";
  const inn12 = data.Produkt_Innentasche_12 ? "Ja" : "";
  const inn10 = data.Produkt_Innentasche_10 ? "Ja" : "";
  const inn7 = data.Produkt_Innentasche_7 ? "Ja" : "";

  // 1. GENERIERUNG DER MASTER-ZUSAMMENFASSUNG FÜR DEINE KOLLEGEN (Landet in Spalte G)
  const crmZeilenArray = [];
  
  if (data.Produkt_Kastentasche_12) crmZeilenArray.push("• 12\" Kastentasche" + (data.stueckzahl_Kastentasche_12 ? " [" + data.stueckzahl_Kastentasche_12 + " Stk.]" : "") + (data.extras_Kastentasche_12 ? " (Extras: " + data.extras_Kastentasche_12 + ")" : ""));
  if (data.Produkt_Kastentasche_10) crmZeilenArray.push("• 10\" Kastentasche" + (data.stueckzahl_Kastentasche_10 ? " [" + data.stueckzahl_Kastentasche_10 + " Stk.]" : "") + (data.extras_Kastentasche_10 ? " (Extras: " + data.extras_Kastentasche_10 + ")" : ""));
  if (data.Produkt_Kastentasche_7)  crmZeilenArray.push("• 7\" Kastentasche"  + (data.stueckzahl_Kastentasche_7  ? " [" + data.stueckzahl_Kastentasche_7  + " Stk.]" : "") + (data.extras_Kastentasche_7  ? " (Extras: " + data.extras_Kastentasche_7  + ")" : ""));
  if (data.Produkt_Gatefold_12)     crmZeilenArray.push("• 12\" Gatefold"     + (data.stueckzahl_Gatefold_12     ? " [" + data.stueckzahl_Gatefold_12     + " Stk.]" : "") + (data.extras_Gatefold_12     ? " (Extras: " + data.extras_Gatefold_12     + ")" : ""));
  if (data.Produkt_Innentasche_12)  crmZeilenArray.push("• 12\" Innentasche"   + (data.stueckzahl_Innentasche_12  ? " [" + data.stueckzahl_Innentasche_12  + " Stk.]" : "") + (data.extras_Innentasche_12  ? " (Extras: " + data.extras_Innentasche_12  + ")" : ""));
  if (data.Produkt_Innentasche_10)  crmZeilenArray.push("• 10\" Innentasche"   + (data.stueckzahl_Innentasche_10  ? " [" + data.stueckzahl_Innentasche_10  + " Stk.]" : "") + (data.extras_Innentasche_10  ? " (Extras: " + data.extras_Innentasche_10  + ")" : ""));
  if (data.Produkt_Innentasche_7)   crmZeilenArray.push("• 7\" Innentasche"    + (data.stueckzahl_Innentasche_7   ? " [" + data.stueckzahl_Innentasche_7   + " Stk.]" : "") + (data.extras_Innentasche_7   ? " (Extras: " + data.extras_Innentasche_7   + ")" : ""));

  // Zusatzkomponenten mit eigenen Stückzahlen anhängen
  if (data.stueckzahl_Labels) crmZeilenArray.push("• Schallplatten-Labels [" + data.stueckzahl_Labels + " Stk.]");
  if (data.stueckzahl_Einleger) crmZeilenArray.push("• Einleger / Booklets [" + data.stueckzahl_Einleger + " Stk.]");

  // Die Zeilen werden sauber mit einem echten Zeilenumbruch getrennt!
  const projektZusammenfassung = crmZeilenArray.join("\n");

  const rücken = data.rueckenbreite || "";
  const veredelung = data.veredelung || "";
  const karton = data.kartonsorte || "";
  const farbigkeit = data.farbigkeit || "";
  const sonderfarbeDetails = data.sonderfarbeDetails || "";
  const innendruck = data.innendruckDetails ? data.innendruckDetails : "";
  const grammatur = data.grammatur || "";
  const dispersionCello = data.dispersionCello || "";
  const inOut = data.insideOut ? "Ja" : "";
  const extras = data.extras || "";
  
  // In Spalte Y hinterlegen wir zur Sicherheit die primäre globale Stückzahl des Kunden
  const stück = data.stueckzahl || "Spezifisch";
  const nachricht = data.message || "";

  // appendRow befüllt exakt deine Spalten A bis AC ohne Verschiebung
  sheet.appendRow([
    timestamp, data.name, data.firmaBand || "", data.projektname || "", data.email, data.phone || "", 
    projektZusammenfassung, kaste10, kaste7, gate12, inn12, inn10, inn7, rücken, veredelung, karton, farbigkeit, 
    sonderfarbeDetails, innendruck, grammatur, veredelung, dispersionCello, inOut, extras, stück, 
    sheetDriveLink, sheetTransferLink, nachricht, "Neu"
  ]);
  
  formatiereTabelle("vinyl_anfragen");
  
  // Bereitet die HTML-E-Mail auf
  const emailProdukteHtml = crmZeilenArray.map(zeile => `<li>${zeile}</li>`).join("");

  try {
    sendeVinylEmail(data.firmaBand || "", data.projektname || "", data.name, data.email, data.phone || "", emailProdukteHtml, rücken, veredelung, karton, farbigkeit, sonderfarbeDetails, grammatur, dispersionCello, stück, driveLink, sheetTransferLink, nachricht);
  } catch (mailError) {
    console.error("Vinyl-Mail-Fehler: " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Vinyl-Spezifikation erfolgreich gespeichert!");
}

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

function sendeVinylEmail(firmaBand, projektname, name, email, phone, emailProdukteHtml, rücken, veredelung, karton, farbigkeit, sonderfarbeDetails, grammatur, dispersionCello, stueck, dateiLink, transferLink, message) {
  const sonderfarbeHtml = farbigkeit.toLowerCase().includes("sonderfarbe") ? `<p style="margin: 4px 0;"><strong>Sonderfarbe Details:</strong> ${sonderfarbeDetails}</p>` : "";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ff007f; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff007f; border-bottom: 2px solid #ff007f; padding-bottom: 10px; margin-top: 0;">Neue CRM-Anfrage: Vinyl-Konfigurator</h2>
      <p><strong>Firma / Band:</strong> ${firmaBand} | <strong>Projekt:</strong> ${projektname}</p>
      <p><strong>Kunde:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
      
      <h3 style="color: #ff007f; margin-top: 20px; margin-bottom: 5px;">Bestellte Komponenten & Stückzahlen:</h3>
      <div style="background-color: #fff0f6; padding: 12px 15px; border-radius: 6px; margin: 10px 0;">
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
          ${emailProdukteHtml}
        </ul>
      </div>

      <h3 style="color: #333; margin-top: 15px; margin-bottom: 5px;">Technische Materialdaten:</h3>
      <p><strong>Rückenbreite:</strong> ${rücken} | <strong>Karton:</strong> ${karton}</p>
      <p><strong>Farbigkeit:</strong> ${farbigkeit} ${sonderfarbeHtml} | <strong>Grammatur:</strong> ${grammatur}</p>
      <p><strong>Veredelung / Lacke:</strong> ${veredelung} ${dispersionCello}</p>
      <p><strong>Upload-Datei:</strong> ${dateiLink ? `<a href="${dateiLink}">Öffnen ➔</a>` : "Keine"} | <strong>Transfer:</strong> ${transferLink ? `<a href="${transferLink}">Öffnen ➔</a>` : "Kein"}</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #ff007f; margin-top: 15px;">
        <p style="margin: 0; font-weight: bold; color: #ff007f;">Kundennachricht:</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;
  MailApp.sendEmail({ to: EMAIL_VINYL, subject: "CRM: Vinyl-Anfrage von " + name, htmlBody: htmlBody });
}

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

// ==========================================================================
// INTERAKTIVES CRM STYLING-ENGINE (ZUR DETAILED OVERVIEW OPTIMIERT)
// ==========================================================================

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
  
  // WICHTIG FÜR DIE ÜBERSICHTLICHE MASTERZEILE:
  // Wir erlauben in Spalte G echten Textumbruch (Wrap), damit die Produkte sauber untereinander stehen.
  datenBereichKomplett.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP); 
  
  for (let r = 2; r <= lastRow; r++) {
    // Da in Spalte G mehrere Produkte untereinander stehen, geben wir den Zeilen automatisch mehr Höhe (z.B. 65px),
    // damit deine Kollegen alles sofort ohne lästiges Klicken lesen können!
    sheet.setRowHeight(r, 65); 
    verarbeiteZeilenFarbeUndRahmen(sheet, r, lastColumn);
  }
  
  if (bereinigterName === "vinyl_anfragen" || bereinigterName === "vinyl anfragen") {
    sheet.getRange("A2:A" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("E2:E" + lastRow).setHorizontalAlignment("center");
    sheet.getRange("F2:F" + lastRow).setHorizontalAlignment("center");
    
    // Die Master-Zusammenfassung (Spalte G) bekommt echten Textumbruch spendiert!
    sheet.getRange("G2:G" + lastRow).setHorizontalAlignment("left").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    
    // Alte Produkt-Kontrollspalten bleiben im Hintergrund zentriert
    sheet.getRange(2, 8, lastRow - 1, 6).setHorizontalAlignment("center");
    
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