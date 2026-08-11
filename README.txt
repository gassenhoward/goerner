==============================================================================
SYSTEMDOKUMENTATION & ARCHITEKTUR-GUIDE: OSKAR GÖRNER GMBH B2B WEB-CRM
==============================================================================
Version: 2.4.0 (Release 2026)
Tech-Stack: HTML5, Bootstrap 5.3.3, Custom CSS (CI-Engine), Vanilla JS, Google Apps Script (Backend & API), Google Sheets (Database).
Zielstellung: Vollständig integrierte B2B-Druckereiwebseite mit Echtzeit-Konfigurator, dynamischem Stellenportal und headless Google-Sheet-Backend für das CRM.

------------------------------------------------------------------------------
1. SYSTEMARCHITEKTUR & DATEI-STRUKTUR
------------------------------------------------------------------------------
Root-Verzeichnis/
├── index.html                   # Haupt-Landingpage mit interaktivem CMYK-Zylinder
├── impressum.html               # Impressum nach TMG/DSGVO/TTDSG (Inhaber Daniel Fitzner)
├── agb.html                     # B2B-Lieferbedingungen, Preflight, Toleranzen (BGB/HGB)
├── datenschutz.html             # Datenschutz mit Google-Apps-Script & Analytics Klauseln
├── readme.txt                   # Diese Systemdokumentation
│
├── css/
│   └── style.css                # Globale CI-Engine (Magenta #ff007f, Dark Slate #0f172a, Modern Footer)
│
├── js/
│   ├── script.js                # Core UI-Engine, Dynamic Form Handler, Interactive Animations
│   ├── jobs-daten.js            # Job- & Ausbildungs-Gitter Renderer
│   └── aktions-daten.js         # Promo- & Flyout-Drawer Daten-Array
│
├── sites/
│   ├── stellenangebote.html     # Dynamisches Karriereportal (Jobs & Ausbildung)
│   ├── vinyl/
│   │   ├── vinyl.html           # High-End Vinyl-Konfigurator mit Live-Basket
│   │   └── formate.html         # Formate, Rückenbreiten und Material-Matrix
│   └── produktion/
│       ├── print.html           # Offset- & Digitaldruck Spezifikationen
│       ├── druckvorstufe.html   # Preflight-Workstation & PDF/X Standards
│       └── weiterverarbeitung.html # Stanz-, Veredelungs- & Falzprozesse
│
└── backend/ (Google Apps Script / Web App)
    ├── Code.gs                  # REST-Endpoints (doPost, doGet), MailApp, Sheet-Controller
    ├── Dashboard.html           # CRM Admin-Oberfläche (Anfragen, Job-Verwaltung, Assets)
    └── Login.html               # Admin-Authentication Modal

------------------------------------------------------------------------------
2. GOOGLE APPS SCRIPT BACKEND & CRM-ANBINDUNG
------------------------------------------------------------------------------
Das Backend arbeitet ohne eigene Server-Infrastruktur als Google Apps Script (GAS) Web-App:

* SPREADSHEET-ID/URL:
  https://docs.google.com/spreadsheets/d/1UoYbGcSrBFcXyraAYy6gikHVSAJdv_Dyn7ck1SGIZnw/edit

* TABELLENBLÄTTER:
  - `anfragen`: Kontaktformular-Eingänge der Hauptseite.
  - `vinyl_anfragen`: Multi-Komponenten Anfragen inkl. Spezifikationen & Drive-Links.
  - `stellenangebote`: Aktive Stellenanzeigen für das Frontend.
  - `auftraege`: Kundenseitige Statusabfrage via Auftragsnummer.

* REST-FUNKTIONEN (`Code.gs`):
  - `doPost(e)`: Nimmt JSON-Payloads von `index.html` und `vinyl.html` entgegen, erzeugt Google Drive Dateilinks und verschickt automatisierte System-E-Mails.
  - `doGet(e)`: Ermöglicht die Nachverfolgung des Auftragsstatus über Parametereingabe.
  - `onEdit(e)`: Triggert automatisches Highlighting (Magenta-Glow & Statusfarben) bei manueller Bearbeitung im Google Sheet.

------------------------------------------------------------------------------
3. CI-LAYOUT, SCHRIFTEN & DESIGN-RICHTLINIEN
------------------------------------------------------------------------------
* FARB-SCHLÜSSEL:
  - Magenta Brand: #ff007f (Aktionen, Highlights, Buttons)
  - Dark Slate:    #0f172a / #1e293b (CRM-Hintergründe, Sidebars)
  - Dark Background: #111111 / #0a0a0c (Navbar, Hero, Footer)
  - White Content: #ffffff (Karten, Formularbereiche)

* FOOTE-KOMPONENTE (`.footer-modern`):
  - Dreispaltiges Grid mit Unternehmensdaten der Oskar Görner GmbH (Melanchthonstraße 1–7, Chemnitz).
  - Instagram-Button (`https://www.instagram.com/druckerei_oskar_goerner/`) mit Glow-Hover.
  - Google-Maps-Embed Iframe mit festem Standort-Parameter.

------------------------------------------------------------------------------
4. INBETRIEBNAHME & DEPLOYMENT
------------------------------------------------------------------------------
1. Statische Dateien auf den Webserver/FTP hochladen (`druckerei-goerner.de`).
2. Google Apps Script als Web-App bereitstellen:
   - Ausführen als: "Ich" (Administrator).
   - Zugriff: "Jeder" (Anonyme POST-Requests zulassen).
3. Web-App URL in `script.js` und Formular-Handlern als Form-Action hinterlegen.
==============================================================================
