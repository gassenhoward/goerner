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
function performLogin() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
            window.location.href = ScriptApp.getService().getUrl() + "?page=dashboard";
        } else {
            const ab = document.getElementById("alertBox");
            ab.textContent = res.message;
            ab.classList.remove("d-none");
        }
    }).checkAuthentication(u, p);
}