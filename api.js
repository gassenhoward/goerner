// ==========================================================================
// GOOGLE APPS SCRIPT: CRM BACKEND & API (Vollständig auf Deutsch)
// ==========================================================================

// Empfänger-Adressen für dein CRM (Vinyl-Mails gehen an beide Adressen!)
const EMAIL_INFO = "info@druckerei-goerner.de"; 
const EMAIL_VINYL = "vinyl@druckerei-goerner.de, satz@druckerei-goerner.de"; 
const GOOGLE_DRIVE_FOLDER_ID = "1ENmLOpM79-Lq_2oprfa-eXosZgnwzEnE";

/**
 * doPOST verarbeitet alle eingehenden Formularabsendungen (AJAX POST)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType; // 'kontakt' oder 'vinyl'
    
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
 * doGet verarbeitet die Suchabfragen nach Auftragsnummern (AJAX GET)
 * Aufruf z. B. über: API_URL?auftragsnummer=GD-2026-001
 */
function doGet(e) {
  try {
    const auftragsnummer = e.parameter.auftragsnummer;
    if (!auftragsnummer) {
      return erstelleJsonAntwort(false, "Keine Auftragsnummer angegeben.");
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("auftraege");
    const daten = sheet.getDataRange().getValues();
    
    // Spalten-Indizes in der Tabelle "auftraege": 
    // A=0 (Auftragsnummer), B=1 (Kunden_ID), C=2 (Projektname), D=3 (Status), G=6 (Liefertermin)
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
    return erstelleJsonAntwort(false, "Fehler bei der Suche: " + error.toString());
  }
}

// ==========================================================================
// HILFSFUNKTIONEN FÜR DIE FORMULAR-VERARBEITUNG
// ==========================================================================

function verarbeiteKontaktFormular(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("anfragen");
  
  const timestamp = new Date();
  const name = data.name || "";
  const email = data.email || "";
  const phone = data.phone || "";
  const subject = data.subject || "";
  const message = data.message || "";
  const status = "Neu";
  
  // Zeile in Google Sheets eintragen (Spalten A bis G)
  sheet.appendRow([timestamp, name, email, phone, subject, message, status]);
  
  // E-Mail-Benachrichtigung senden (Fehlersicher verpackt für maximale Performance!)
  try {
    sendeKontaktEmail(name, email, phone, subject, message);
  } catch (mailError) {
    console.error("E-Mail konnte nicht gesendet werden (Limit erreicht?): " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Kontaktanfrage erfolgreich gespeichert!");
}

function verarbeiteVinylFormular(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("vinyl_anfragen");
  
  const timestamp = new Date();
  let dateiLink = data.datenlink || ""; 
  
  if (data.fileData && data.fileName) {
    try {
      dateiLink = speichereDateiInDrive(data.fileData, data.fileName);
    } catch (fError) {
      return erstelleJsonAntwort(false, "Fehler beim Speichern der Datei: " + fError.toString());
    }
  }

  const sheetLink = dateiLink ? '=HYPERLINK("' + dateiLink + '"; "Druckdatei öffnen ➔")' : "Keine Datei";

  // Zeile eintragen (22 Spalten)
  sheet.appendRow([
    timestamp, 
    data.name || "",                          // Spalte B: Name
    data.firmaBand || "",                     // Spalte C: Firma / Band
    data.projektname || "",                   // Spalte D: Projektname
    data.email || "",                         // Spalte E: Email
    data.phone || "",                         // Spalte F: Telefon
    data.Produkt_KT12 ? "Ja" : "Nein",        // Spalte G: KT 12"
    data.Produkt_KT10 ? "Ja" : "Nein",        // Spalte H: KT 10"
    data.Produkt_KT7 ? "Ja" : "Nein",         // Spalte I: KT 7"
    data.Produkt_Gatefold ? "Ja" : "Nein",    // Spalte J: Gatefold
    data.Produkt_Maxi12 ? "Ja" : "Nein",      // Spalte K: Maxi 12"
    data.Produkt_Maxi10 ? "Ja" : "Nein",      // Spalte L: Maxi 10"
    data.Produkt_Maxi7 ? "Ja" : "Nein",       // Spalte M: Maxi 7"
    data.rueckenbreite || "",                 // Spalte N: Rücken
    data.veredelung || "",                    // Spalte O: Veredelung
    data.kartonsorte || "",                   // Spalte P: Karton
    data.insideOut ? "Ja" : "Nein",           // Spalte Q: Inside Out
    data.extras || "",                        // Spalte R: Extras
    data.stueckzahl || "",                    // Spalte S: Stückzahl
    sheetLink,                                // Spalte T: Datenlink
    data.message || "",                       // Spalte U: Nachricht
    "Neu"                                     // Spalte V: Status
  ]);
  
  // Vinyl E-Mail-Benachrichtigung senden (Fehlersicher verpackt für maximale Performance!)
  try {
    sendeVinylEmail(
      data.firmaBand || "",
      data.projektname || "", 
      data.name || "", 
      data.email || "", 
      data.phone || "", 
      data.stueckzahl || "", 
      data.rueckenbreite || "", 
      data.kartonsorte || "", 
      dateiLink, 
      data.message || ""
    );
  } catch (mailError) {
    console.error("Vinyl-E-Mail konnte nicht gesendet werden (Limit erreicht?): " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Vinyl-Spezifikation erfolgreich gespeichert!");
}

// E-Mail-Funktion für das Standard-Kontaktformular
function sendeKontaktEmail(name, email, phone, subject, message) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #007bff; padding: 20px; border-radius: 8px;">
      <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Neue Anfrage: Kontaktformular</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Betreff:</strong> ${subject}</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; margin-top: 15px;">
        <p style="margin: 0; font-weight: bold; color: #007bff; margin-bottom: 5px;">Nachricht:</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: EMAIL_INFO,
    subject: "CRM: Neue Kontaktanfrage - " + subject,
    htmlBody: htmlBody
  });
}

// E-Mail-Funktion für das Vinyl-Formular
function sendeVinylEmail(firmaBand, projektname, name, email, phone, stueck, ruecken, karton, dateiLink, message) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ff007f; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff007f; border-bottom: 2px solid #ff007f; padding-bottom: 10px;">Neue Anfrage: Vinyl-Konfigurator</h2>
      <p><strong>Firma / Band:</strong> ${firmaBand}</p>
      <p><strong>Projektname:</strong> ${projektname}</p>
      <p><strong>Ansprechpartner:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Gewünschte Stückzahl:</strong> ${stueck}</p>
      <p><strong>Rückenbreite:</strong> ${ruecken}</p>
      <p><strong>Kartonsorte:</strong> ${karton}</p>
      <p><strong>Druckdatei:</strong> ${dateiLink ? `<a href="${dateiLink}" style="color: #ff007f; font-weight: bold;">Druckdatei öffnen ➔</a>` : "Keine Datei hochgeladen"}</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #ff007f; margin-top: 15px;">
        <p style="margin: 0; font-weight: bold; color: #ff007f; margin-bottom: 5px;">Nachricht/Details:</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">Eingegangen über das Vinyl-Spezifikations-Formular der Druckerei Oskar Görner GmbH.</p>
    </div>
  `;
  
  MailApp.sendEmail({
    to: EMAIL_VINYL,
    subject: "CRM: Vinyl-Konfiguration erhalten! - " + (firmaBand ? `${firmaBand} (${projektname})` : name),
    htmlBody: htmlBody
  });
}

// Hilfsfunktion: Wandelt Base64 zurück in eine Datei und speichert sie im Drive-Ordner
function speichereDateiInDrive(base64String, dateiName) {
  const ordner = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
  
  const datenTeile = base64String.split(",");
  const contentTyp = datenTeile[0].match(/:(.*?);/)[1];
  const roheDaten = Utilities.base64Decode(datenTeile[1]);
  
  const blob = Utilities.newBlob(roheDaten, contentTyp, dateiName);
  const datei = ordner.createFile(blob);
  
  // Wichtig: Datei für jeden freigeben, der den Link hat, damit Ihr Team sie im CRM öffnen kann
  datei.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return datei.getUrl();
}

// Hilfsfunktion: Erstellt eine standardisierte JSON-Antwort inklusive CORS-CORS-Header für Webseiten
function erstelleJsonAntwort(erfolg, meldung, daten = null) {
  const ausgabe = {
    erfolg: erfolg,
    meldung: meldung,
    daten: daten
  };
  
  return ContentService.createTextOutput(JSON.stringify(ausgabe))
    .setMimeType(ContentService.MimeType.JSON);
}