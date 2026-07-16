// ==========================================================================
// GOOGLE APPS SCRIPT: CRM BACKEND & API (Vollständig auf Deutsch)
// ==========================================================================

const EMAIL_INFO = "info@druckerei-goerner.de"; 
const EMAIL_VINYL = "vinyl@druckerei-goerner.de, satz@druckerei-goerner.de"; 
const GOOGLE_DRIVE_FOLDER_ID = "1ENmLOpM79-Lq_2oprfa-eXosZgnwzEnE";

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1UoYbGcSrBFcXyraAYy6gikHVSAJdv_Dyn7ck1SGIZnw/edit?usp=sharing";

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
  try {
    const auftragsnummer = e.parameter.auftragsnummer;
    if (!auftragsnummer) {
      return erstelleJsonAntwort(false, "Keine Auftragsnummer angegeben.");
    }
    
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
    return erstelleJsonAntwort(false, "Fehler bei der Suche: " + error.toString());
  }
}

function verarbeiteKontaktFormular(data) {
  if (!data.name || !data.email) {
    return erstelleJsonAntwort(false, "Eintrag verweigert: Name und E-Mail erforderlich.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("anfragen");
  
  const timestamp = new Date();
  const name = data.name;
  const email = data.email;
  const phone = data.phone || "—";
  const subject = data.subject || "—";
  const message = data.message || "—";
  const status = "Neu";
  
  sheet.appendRow([timestamp, name, email, phone, subject, message, status]);
  
  try {
    sendeKontaktEmail(name, email, phone, subject, message);
  } catch (mailError) {
    console.error("Kontakt-Mail-Fehler: " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Kontaktanfrage erfolgreich gespeichert!");
}

function verarbeiteVinylFormular(data) {
  if (!data.name || !data.email) {
    return erstelleJsonAntwort(false, "Eintrag verweigert: Name und E-Mail erforderlich.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("vinyl_anfragen");
  
  const timestamp = new Date();
  let driveLink = "";
  
  if (data.fileData && data.fileName) {
    try {
      driveLink = speichereDateiInDrive(data.fileData, data.fileName);
    } catch (fError) {
      return erstelleJsonAntwort(false, "Fehler beim Dateiupload: " + fError.toString());
    }
  }

  const sheetDriveLink = driveLink ? '=HYPERLINK("' + driveLink + '"; "Druckdatei öffnen ➔")' : "—";
  const sheetTransferLink = data.datenlink ? data.datenlink : "—";

  const kaste12 = data.Produkt_Kastentasche_12 ? "Ja" : "Nein";
  const kaste10 = data.Produkt_Kastentasche_10 ? "Ja" : "Nein";
  const kaste7 = data.Produkt_Kastentasche_7 ? "Ja" : "Nein";
  const gate12 = data.Produkt_Gatefold_12 ? "Ja" : "Nein";
  const inn12 = data.Produkt_Innentasche_12 ? "Ja" : "Nein";
  const inn10 = data.Produkt_Innentasche_10 ? "Ja" : "Nein";
  const inn7 = data.Produkt_Innentasche_7 ? "Ja" : "Nein";
  
  const rücken = data.rueckenbreite || "—";
  const veredelung = data.veredelung || "—";
  const karton = data.kartonsorte || "—";
  
  const farbigkeit = data.farbigkeit || "—";
  const sonderfarbeDetails = data.sonderfarbeDetails || "—";
  const innendruck = "Über Extras gesteuert";
  const grammatur = data.grammatur || "—";
  const dispersionCello = data.dispersionCello || "—";

  const inOut = data.insideOut ? "Ja" : "Nein";
  const extras = data.extras || "—";
  const stück = data.stueckzahl || "—";
  const nachricht = data.message || "—";

  sheet.appendRow([
    timestamp,                 // A
    data.name,                 // B
    data.firmaBand || "—",     // C
    data.projektname || "—",   // D
    data.email,                // E
    data.phone || "—",         // F
    kaste12, kaste10, kaste7,  // G, H, I
    gate12,                    // J
    inn12, inn10, inn7,        // K, L, M
    rücken,                    // N
    veredelung,                // O
    karton,                    // P
    farbigkeit,                // Q
    sonderfarbeDetails,        // R
    innendruck,                // S
    grammatur,                 // T
    veredelung,                // U
    dispersionCello,           // V
    inOut,                     // W
    extras,                    // X
    stück,                     // Y
    sheetDriveLink,            // Z
    sheetTransferLink,         // AA
    nachricht,                 // AB
    "Neu"                      // AC
  ]);
  
  const gewaehlteProdukte = [];
  if (data.Produkt_Kastentasche_12) gewaehlteProdukte.push("12\" Kastentasche");
  if (data.Produkt_Kastentasche_10) gewaehlteProdukte.push("10\" Kastentasche");
  if (data.Produkt_Kastentasche_7) gewaehlteProdukte.push("7\" Kastentasche");
  if (data.Produkt_Gatefold_12) gewaehlteProdukte.push("12\" Gatefold (Klappcover)");
  if (data.Produkt_Innentasche_12) gewaehlteProdukte.push("12\" Innentasche");
  if (data.Produkt_Innentasche_10) gewaehlteProdukte.push("10\" Innentasche");
  if (data.Produkt_Innentasche_7) gewaehlteProdukte.push("7\" Innentasche");

  const produkteHtml = gewaehlteProdukte.length > 0 
    ? gewaehlteProdukte.map(p => `<li>${p}</li>`).join("") 
    : "<li>Keine Produkte ausgewählt</li>";

  const insideOutHtml = data.insideOut 
    ? `<p style="margin: 4px 0;"><strong>Inside-Out-Druck:</strong> Ja</p>` 
    : "";

  try {
    sendeVinylEmail(
      data.firmaBand || "—", data.projektname || "—", data.name, data.email, data.phone || "—", 
      produkteHtml, rücken, veredelung, karton, farbigkeit, sonderfarbeDetails, grammatur, dispersionCello, insideOutHtml, extras,
      stück, driveLink, sheetTransferLink, nachricht
    );
  } catch (mailError) {
    console.error("Vinyl-Mail-Fehler: " + mailError.toString());
  }
  
  return erstelleJsonAntwort(true, "Vinyl-Spezifikation erfolgreich gespeichert!");
}

function sendeKontaktEmail(name, email, phone, subject, message) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #007bff; padding: 20px; border-radius: 8px;">
      <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 0;">Neue Anfrage: Kontaktformular</h2>
      <p style="margin: 4px 0;"><strong>Name / Firma:</strong> ${name}</p>
      <p style="margin: 4px 0;"><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin: 4px 0;"><strong>Telefon:</strong> ${phone}</p>
      <p style="margin: 4px 0;"><strong>Betreff:</strong> ${subject}</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; margin-top: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold; color: #007bff; margin-bottom: 5px;">Nachricht:</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <div style="text-align: center; border-top: 1px solid #dee2e6; padding-top: 15px;">
        <a href="${SPREADSHEET_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Google Tabelle öffnen 📊</a>
      </div>
    </div>
  `;
  MailApp.sendEmail({ to: EMAIL_INFO, subject: "CRM: Neue Kontaktanfrage - " + subject, htmlBody: htmlBody });
}

function sendeVinylEmail(firmaBand, projektname, name, email, phone, produkteHtml, rücken, veredelung, karton, farbigkeit, sonderfarbeDetails, grammatur, dispersionCello, insideOutHtml, extras, stueck, dateiLink, transferLink, message) {
  const sonderfarbeHtml = farbigkeit.toLowerCase().includes("sonderfarbe") 
    ? `<p style="margin: 4px 0;"><strong>Sonderfarbe Details:</strong> ${sonderfarbeDetails}</p>` 
    : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ff007f; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff007f; border-bottom: 2px solid #ff007f; padding-bottom: 10px; margin-top: 0;">Neue Anfrage: Vinyl-Konfigurator</h2>
      
      <h3 style="color: #333; margin-bottom: 5px;">Stammdaten:</h3>
      <p style="margin: 4px 0;"><strong>Firma / Band:</strong> ${firmaBand}</p>
      <p style="margin: 4px 0;"><strong>Projektname:</strong> ${projektname}</p>
      <p style="margin: 4px 0;"><strong>Ansprechpartner:</strong> ${name}</p>
      <p style="margin: 4px 0;"><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin: 4px 0;"><strong>Telefon:</strong> ${phone}</p>
      
      <div style="background-color: #fff0f6; border: 1px dashed #ff007f; padding: 12px 20px; margin: 20px 0; border-radius: 6px; text-align: center;">
        <span style="font-size: 1rem; color: #333; display: block; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Gewünschte Stückzahl</span>
        <strong style="font-size: 2rem; color: #ff007f; line-height: 1;">${stueck} Stück</strong>
      </div>
      
      <h3 style="color: #333; margin-top: 15px; margin-bottom: 5px;">Gewählte Produkte:</h3>
      <ul style="margin: 5px 0; padding-left: 20px;">
        ${produkteHtml}
      </ul>

      <h3 style="color: #333; margin-top: 15px; margin-bottom: 5px;">Spezifikationen:</h3>
      <p style="margin: 4px 0;"><strong>Rückenbreite(n):</strong> ${rücken}</p>
      <p style="margin: 4px 0;"><strong>Kartonsorte(n):</strong> ${karton}</p>
      <p style="margin: 4px 0;"><strong>Farbigkeit:</strong> ${farbigkeit}</p>
      ${sonderfarbeHtml}
      <p style="margin: 4px 0;"><strong>Grammatur/Materialstärke:</strong> ${grammatur}</p>
      
      <h3 style="color: #333; margin-top: 15px; margin-bottom: 5px;">Veredelungen & Weiterverarbeitung:</h3>
      <p style="margin: 4px 0;"><strong>Premium-Veredelungen:</strong> ${veredelung}</p>
      <p style="margin: 4px 0;"><strong>Dispersion & Cello:</strong> ${dispersionCello}</p>
      ${insideOutHtml}
      <p style="margin: 4px 0;"><strong>Ausstattung & Extras:</strong> ${extras}</p>
      
      <h3 style="color: #333; margin-top: 15px; margin-bottom: 5px;">Übertragene Dateien / Links:</h3>
      <p style="margin: 4px 0;"><strong>Direkt-Upload:</strong> ${dateiLink ? `<a href="${dateiLink}" style="color: #ff007f; font-weight: bold;">Datei im Google Drive öffnen ➔</a>` : "—"}</p>
      <p style="margin: 4px 0;"><strong>Transfer-Link:</strong> ${transferLink !== "—" ? `<a href="${transferLink}" style="color: #ff007f; font-weight: bold;">Transfer-Link öffnen ➔</a>` : transferLink}</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #ff007f; margin-top: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold; color: #ff007f; margin-bottom: 5px;">Nachricht/Details:</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #dee2e6; padding-top: 15px;">
        <a href="${SPREADSHEET_URL}" style="background-color: #ff007f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Google Tabelle öffnen</a>
      </div>
    </div>
  `;
  MailApp.sendEmail({ to: EMAIL_VINYL, subject: "CRM: Vinyl-Konfiguration erhalten! - " + (firmaBand !== "—" ? `${firmaBand} (${projektname})` : name), htmlBody: htmlBody });
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
  const ausgabe = { erfolg: erfolg, meldung: meldung, daten: daten };
  return ContentService.createTextOutput(JSON.stringify(ausgabe)).setMimeType(ContentService.MimeType.JSON);
}