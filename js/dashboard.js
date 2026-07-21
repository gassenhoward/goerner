// ==========================================================================
// CLIENT-SIDE CRM CORE & MUTATION MECHANICS (js/dashboard.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {
    // Prüfen, ob wir uns auf dem Dashboard-Panel befinden (Vermeidung von Fehlern auf Login-Seiten)
    if (document.getElementById("requestsTable") || document.getElementById("panel-jobs")) {
        initDashboard();
    }
});

/**
 * Initialisiert die asynchronen Feeds des Dashboards
 */
function initDashboard() {
    loadRequests();
    loadLiveJobs();
}

/**
 * Holt die letzten 50 Formularanfragen aus Google Sheets über das Backend
 */
function loadRequests() {
    google.script.run.withSuccessHandler(function(data) {
        const tbody = document.querySelector("#requestsTable tbody");
        if (!tbody) return;
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Keine Anfragen vorhanden.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(r => `
            <tr>
                <td>${r.timestamp}</td>
                <td><strong>${r.kunde}</strong></td>
                <td>${r.projekt}</td>
                <td class="small text-white-50" style="white-space:pre-wrap;">${r.zusammenfassung}</td>
                <td><span class="badge ${r.status === 'Neu' ? 'bg-danger' : 'bg-warning'}">${r.status}</span></td>
            </tr>
        `).join('');
    }).getFormRequests();
}

/**
 * Übermittelt ein neues Stellenangebot an die Backend-Engine
 */
function submitJob() {
    const t = document.getElementById("jobTitle").value;
    const d = document.getElementById("jobDept").value;
    const ty = document.getElementById("jobType").value;
    const de = document.getElementById("jobDesc").value;
    
    if (!t || !de) {
        alert("Bitte Titel und Beschreibung ausfüllen.");
        return;
    }
    
    google.script.run.withSuccessHandler(function(res) {
        const alertBox = document.getElementById("jobAlert");
        alertBox.className = "alert " + (res.success ? "alert-success" : "alert-danger");
        alertBox.textContent = res.message;
        alertBox.classList.remove("d-none");
        if (res.success) {
            // Felder leeren und Live-Liste aktualisieren
            document.getElementById("jobTitle").value = "";
            document.getElementById("jobDesc").value = "";
            loadLiveJobs();
        }
    }).saveNewJobOffer(t, d, ty, de);
}

/**
 * Lädt die aktiven Live-Stellenangebote asynchron in die rechte Kontroll-Spalte
 */
function loadLiveJobs() {
    google.script.run.withSuccessHandler(function(data) {
        const jobsContainer = document.getElementById("panel-jobs");
        if (!jobsContainer) return;

        let liveContainer = document.getElementById("liveJobsContainer");
        if (!liveContainer) {
            liveContainer = document.createElement("div");
            liveContainer.id = "liveJobsContainer";
            liveContainer.className = "card-panel p-4 mt-4";
            liveContainer.innerHTML = '<h3>Aktive Live-Angebote (Rechte Spalte)</h3><div id="liveJobsList" class="list-group"></div>';
            jobsContainer.appendChild(liveContainer);
        }
        
        const list = document.getElementById("liveJobsList");
        if (data.length === 0) {
            list.innerHTML = '<p class="text-muted small">Keine aktiven Angebote in der Tabelle.</p>';
            return;
        }
        
        list.innerHTML = data.map(j => `
            <div class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h5 class="mb-1">${j.titel}</h5>
                    <small class="text-muted">${j.abteilung} · ${j.art}</small>
                </div>
                <button onclick="removeJobLive('${j.rowId}')" class="btn btn-sm btn-outline-danger">Entfernen</button>
            </div>
        `).join('');
    }).getLiveJobsBackend();
}

/**
 * Führt den Soft-Delete (Mutation auf "Inaktiv") aus
 */
function removeJobLive(rowId) {
    if (!confirm("Möchten Sie dieses Stellenangebot wirklich live entfernen?")) return;
    google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
            loadLiveJobs();
        } else {
            alert("Fehler beim Löschen: " + res.message);
        }
    }).deleteJobOfferBackend(rowId);
}

/**
 * Synchronisiert Webseiten-Assets mit Google Drive
 */
function uploadImageAsset() {
    const fileInput = document.getElementById("imageFile");
    const targetId = document.getElementById("imageTargetId").value;
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        google.script.run.withSuccessHandler(function(res) {
            const alertBox = document.getElementById("imageAlert");
            alertBox.className = "alert " + (res.success ? "alert-success" : "alert-danger");
            alertBox.textContent = res.success ? "Asset erfolgreich im Google Drive aktualisiert!" : res.message;
            alertBox.classList.remove("d-none");
        }).updateCrmImage(reader.result, file.name, targetId);
    };
}

/**
 * Führt den Login-Vorgang auf der Anmeldeseite aus
 */
// EXAKTE ZEILEN-ANPASSUNG FÜR LOGIN-ROUTING IN JS/DASHBOARD.JS
function performLogin() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
            window.location.href = "https://script.google.com/macros/s/AKfycbwNYzte8SJqxizVJyS-cwS9UWl9RHOnP2QUg8MLd_FEmKsarvnzpgXWH3GE4FV57MJE/exec?page=dashboard";
        } else {
            const ab = document.getElementById("alertBox");
            ab.textContent = res.message;
            ab.classList.remove("d-none");
        }
    }).checkAuthentication(u, p);
}

function checkJobsLock() {
    const password = prompt("Bitte Passwort für den Bereich Stellenangebote eingeben:");
    if (!password) return;
    
    google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
            document.getElementById("jobsLockOverlay").classList.add("d-none");
            document.getElementById("jobsContent").classList.remove("d-none");
            loadLiveJobs();
        } else {
            alert("Falsches Passwort!");
        }
    }).verifyJobsAccess(password);
}

function logout() {
    google.script.run.withSuccessHandler(function() {
        // Lädt die Basis-URL ohne Parameter (führt direkt zur Login.html)
        window.location.href = "<?!= ScriptApp.getService().getUrl() ?>";
    }).performLogoutBackend();
}

function sendeVinylEmail(firmaBand, projektname, name, email, phone, zusammenfassung, dateiLink, transferLink, message) {
  const webAppUrl = "https://script.google.com/macros/s/AKfycbwNYzte8SJqxizVJyS-cwS9UWl9RHOnP2QUg8MLd_FEmKsarvnzpgXWH3GE4FV57MJE/exec?page=dashboard";
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; border: 2px solid #e60072; padding: 25px; border-radius: 8px; background-color: #ffffff; color: #111111;">
      <h2 style="color: #e60072; border-bottom: 2px solid #e60072; padding-bottom: 12px;">Neue Vinyl-Spezifikationsanfrage</h2>
      <p><strong>Kunde:</strong> ${name} | <strong>Firma/Band:</strong> ${firmaBand || "-"}</p>
      <p><strong>Projekt:</strong> ${projektname || "-"} | <strong>E-Mail:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone || "-"}</p>
      <h3>Spezifizierte Komponenten:</h3>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${zusammenfassung}</div>
      <h3>Assets & Links:</h3>
      <p>Drive: ${dateiLink ? `<a href="${dateiLink}">Datei öffnen</a>` : "Keine"} | Transfer: ${transferLink ? `<a href="${transferLink}">Link öffnen</a>` : "Kein"}</p>
      ${message ? `<p><strong>Anmerkungen:</strong><br>${message}</p>` : ''}
      <div style="margin-top: 25px; text-align: center;">
        <a href="${webAppUrl}" style="background-color: #e60072; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Zum Dashboard</a>
      </div>
    </div>
  `;

  MailApp.sendEmail({ 
    to: EMAIL_VINYL, 
    subject: `CRM [Vinyl]: ${projektname || "Neuer Auftrag"} - ${name}`, 
    htmlBody: htmlBody 
  });
}